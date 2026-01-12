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
import { 
  type FilePresignRequest,
  type FileCreate,
  type RunCreate,
} from "@/client/types.gen";
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

  // 2. Main workflow function
  const startGeneration = async ({ templateFile, contextFiles, jobId }: StartArgs) => {
      if (!templateFile) throw new Error("Template file is required");
      
      setLocalStatus("presigning");
      setUploadProgress(0);

      // A. Presign
      const filesToPresign: FilePresignRequest[] = [
        {
            file_name: templateFile.name,
            mime_type: templateFile.type || "application/octet-stream",
            size_bytes: templateFile.size,
            client_id: "template"
        },
        ...contextFiles.map((file, index) => ({
            file_name: file.name,
            mime_type: file.type || "application/octet-stream",
            size_bytes: file.size,
            client_id: `context-${index}`
        }))
      ];

      const presignData = await presignMutation.mutateAsync({
          body: filesToPresign
      });

      if (!presignData) throw new Error("Failed to get presigned URLs");

      // B. Upload
      setLocalStatus("uploading");
      
      const uploads = presignData.map(p => {
          let file: File | undefined;
          if (p.client_id === "template") {
              file = templateFile;
          } else if (p.client_id?.startsWith("context-")) {
              const index = parseInt(p.client_id.split("-")[1] || "0");
              file = contextFiles[index];
          }
          
          if (!file) throw new Error(`Could not match presigned URL for client_id ${p.client_id}`);
          
          return {
              file,
              url: p.put_url,
              ...p 
          };
      });

      // Upload files
      const fileUrlsMap = uploads.map(u => ({ put_url: u.url }));

      const filesToUpload = uploads.map(u => u.file); // Use the ordered files from uploads match

      await uploadFilesToS3(filesToUpload, fileUrlsMap, (progress) => {
          setUploadProgress(progress);
      });

      // C. Register
      const filesToRegister: FileCreate[] = uploads.map(u => ({
          file_name: u.file.name,
          mime_type: u.file.type || "application/octet-stream",
          size_bytes: u.file.size,
          storage_key: u.storage_key,
          org_id: 1, // TODO: Use actual user org_id
      }));
      
      const registerResponse = await registerFilesMutation.mutateAsync({
          body: filesToRegister
      });

      if (!registerResponse) throw new Error("Failed to register files");
      
      const registeredFiles = registerResponse;
      if (!registeredFiles || registeredFiles.length === 0) throw new Error("No files registered");
      
      // We need to map back from registered files to what we sent
      // The backend returns them in order created, but let's be safe if we can.
      // Actually the backend `create_files` just returns `list[FileRead]`.
      // We assume order is preserved.
      
      // Identify template and context files based on the order we sent them (template first)
      const templateFileRegistered = registeredFiles[0];
      const contextFilesRegistered = registeredFiles.slice(1);
      
      if (!templateFileRegistered) throw new Error("Template file not registered correctly");

      // D. Start Run
      const runData: RunCreate = {
          template_file_id: templateFileRegistered.id,
          context_file_ids: contextFilesRegistered.map(f => f.id),
          job_id: jobId
      };

      const startResponse = await startRun.mutateAsync({
          body: runData
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
