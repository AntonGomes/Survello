import { useState, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { 
  generateFileUploadUrlsMutation, 
  createFilesMutation, 
  createRunMutation, 
  readRunOptions,
  readRunArtefactsOptions,
  generateFileDownloadUrlOptions
} from "@/client/@tanstack/react-query.gen";
import { uploadFilesToS3 } from "@/lib/upload";

export type Status =
  | "idle"
  | "presigning"
  | "uploading"
  | "generating"
  | "finalising"
  | "completed"
  | "error";

type StartArgs = {
  templateFile: File | null;
  contextFiles: File[];
  jobId?: number;
  orgId: number;
};

export function useDocumentGeneration() {
  const [runId, setRunId] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [localStatus, setLocalStatus] = useState<Status>("idle"); // For pre-run states

  const presignMutation = useMutation({
    ...generateFileUploadUrlsMutation(),
  });

  const registerFilesMutation = useMutation({
    ...createFilesMutation(),
  });

  const startRun = useMutation({
    ...createRunMutation(),
  });

  // Main workflow function
  const startGeneration = async ({ templateFile, contextFiles, jobId, orgId }: StartArgs) => {
      if (!templateFile) throw new Error("Template file is required");
      
      setLocalStatus("presigning");
      setUploadProgress(0);

      // Combine all files with a simple structure we'll use throughout
      const allFiles = [
        { file: templateFile, clientId: "template" },
        ...contextFiles.map((file, i) => ({ file, clientId: `context-${i}` }))
      ];

      // A. Presign
      const presignData = await presignMutation.mutateAsync({
          body: allFiles.map(({ file, clientId }) => ({
              file_name: file.name,
              mime_type: file.type || "application/octet-stream",
              size_bytes: file.size,
              client_id: clientId
          }))
      });

      if (!presignData) throw new Error("Failed to get presigned URLs");

      // Match presign responses back to files by client_id
      const fileDataMap = new Map(allFiles.map(f => [f.clientId, f.file]));
      const uploads = presignData.map(p => ({
          file: fileDataMap.get(p.client_id!)!,
          ...p
      }));

      // B. Upload
      setLocalStatus("uploading");
      await uploadFilesToS3(
          uploads.map(u => u.file),
          uploads.map(u => ({ put_url: u.put_url })),
          setUploadProgress
      );

      // C. Register
      const registeredFiles = await registerFilesMutation.mutateAsync({
          body: uploads.map(u => ({
              file_name: u.file.name,
              mime_type: u.file.type || "application/octet-stream",
              size_bytes: u.file.size,
              storage_key: u.storage_key,
              org_id: orgId,
          }))
      });

      if (!registeredFiles?.length) throw new Error("No files registered");
      console.log("Registered files:", registeredFiles); // Debug log

      // D. Start Run (template is first, rest are context)
      const [templateFileRegistered, ...contextFilesRegistered] = registeredFiles;
      
      if (!templateFileRegistered) throw new Error("Template file not registered");

      const startResponse = await startRun.mutateAsync({
          body: {
              template_file_id: templateFileRegistered.id,
              context_file_ids: contextFilesRegistered.map(f => f.id),
              job_id: jobId
          }
      });

      if (!startResponse) throw new Error("Failed to start run");

      return startResponse.id;
  };
    
  const mutation = useMutation({
      mutationFn: startGeneration,
      onSuccess: (data) => {
          setRunId(data);
          setLocalStatus("generating");
      },
      onError: (error) => {
          console.error(error);
          setLocalStatus("error");
      }
  });

  // 2. Poll for status
  const { data: run, isError: isRunError } = useQuery({
    ...readRunOptions({ 
        path: { run_id: runId! }
    }),
    enabled: !!runId && localStatus !== "completed" && localStatus !== "error",
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "completed" || status === "error") return false;
      return 1000;
    },
  });

  // Update local status based on run status
  if (run?.status && localStatus === "generating") {
    if (run.status === "completed") setLocalStatus("completed");
    else if (run.status === "error") setLocalStatus("error");
  }

  // 3. Fetch Artefacts
  const { data: artefacts } = useQuery({
    ...readRunArtefactsOptions({
        path: { run_id: runId! },
    }),
    enabled: !!runId && run?.status === "completed",
  });

  const outputArtefact = artefacts?.[0];

  // 4. Fetch URLs
  const { data: downloadUrl } = useQuery({
      ...generateFileDownloadUrlOptions({
          path: { file_id: outputArtefact?.file_id ?? 0 }
      }),
      enabled: !!outputArtefact?.file_id
  });

  const { data: previewUrl } = useQuery({
      ...generateFileDownloadUrlOptions({
          path: { file_id: outputArtefact?.preview_file_id ?? 0 },
          query: { inline: true }
      }),
      enabled: !!outputArtefact?.preview_file_id
  });
  
  const reset = useCallback(() => {
    setRunId(null);
    setLocalStatus("idle");
    setUploadProgress(0);
    mutation.reset();
  }, [mutation]);

  return {
    start: mutation.mutate,
    reset,
    runId,
    status: (runId ? run?.status : localStatus) as Status,
    error: mutation.error?.message || (isRunError ? "Failed to read run status" : null),
    updates: run?.model_responses || [], // Expecting model_responses to be in RunRead
    uploadProgress,
    
    downloadUrl: downloadUrl || null, 
    previewUrl: previewUrl || null,
    
    isStreaming: localStatus === "generating" && run?.status !== "completed",
    isCompleted: run?.status === "completed",
    isLoading: mutation.isPending || localStatus === "presigning" || localStatus === "uploading",
  };
}
