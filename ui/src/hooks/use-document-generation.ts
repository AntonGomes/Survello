import { useState, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { 
  presignUploads, 
  registerFiles, 
  startRun, 
  getRunStatus, 
  getLatestArtefact 
} from "@/client/sdk.gen";
import { 
  FileRole, 
  type FilePresign, 
  type FileInput,
  type PresignedPut
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

export { FileRole };

type StartArgs = {
  templateFile: File | null;
  contextFiles: File[];
};

export function useDocumentGeneration() {
  const [runId, setRunId] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [localStatus, setLocalStatus] = useState<Status>("idle"); // For pre-run states

  // 1. Mutation to kick off the process (Presign -> Upload -> Register -> Start)
  const startMutation = useMutation({
    mutationFn: async ({ templateFile, contextFiles }: StartArgs) => {
      if (!templateFile) throw new Error("Template file is required");
      
      setLocalStatus("presigning");
      setUploadProgress(0);

      // A. Presign
      const filesMetaDataBundle: FilePresign[] = [
        {
          file_name: templateFile.name,
          mime_type: templateFile.type || "application/octet-stream",
          role: FileRole.TEMPLATE,
        },
        ...contextFiles.map((file) => ({
          file_name: file.name,
          mime_type: file.type || "application/octet-stream",
          role: FileRole.INPUT,
        })),
      ];

      const { data: presignData, error: presignError } = await presignUploads({
        body: { files: filesMetaDataBundle }
      });

      if (presignError || !presignData) throw new Error("Failed to get presigned URLs");

      // B. Upload
      setLocalStatus("uploading");
      const allFiles = [templateFile, ...contextFiles];
      
      await uploadFilesToS3(allFiles, presignData.puts, (progress) => {
        setUploadProgress(progress);
      });

      // C. Register
      const { data: registerData, error: registerError } = await registerFiles({
        body: { files: presignData.puts.map(p => p.file) }
      });

      if (registerError || !registerData) throw new Error("Failed to register files");

      const registeredFiles = registerData.files;
      if (!registeredFiles || registeredFiles.length === 0) throw new Error("No files registered");
      const firstFile = registeredFiles[0];
      if (!firstFile) throw new Error("No files registered");
      const templateId = firstFile.id!;
      const contextFileIds = registeredFiles.slice(1).map(f => f.id!);

      // D. Start Run
      const { data: startData, error: startError } = await startRun({
        body: {
          template_id: templateId,
          context_file_ids: contextFileIds,
        }
      });

      if (startError || !startData) throw new Error("Failed to start run");

      return startData.run_id;
    },
    onSuccess: (newRunId) => {
      setRunId(newRunId);
      setLocalStatus("generating"); // Handover to polling
    },
    onError: (error) => {
      setLocalStatus("error");
      console.error("Generation start failed:", error);
    }
  });

  // 2. Query to poll status (only active when we have a runId and not finished)
  const isPolling = !!runId && localStatus !== "completed" && localStatus !== "error";
  
  const statusQuery = useQuery({
    queryKey: ["runStatus", runId],
    queryFn: async () => {
      if (!runId) return null;
      const { data, error } = await getRunStatus({ path: { run_id: runId } });
      if (error || !data) throw new Error("Failed to fetch status");
      return data;
    },
    enabled: isPolling,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "completed" || status === "error") return false;
      return 2000; // Poll every 2s
    },
  });

  // 3. Query to get final artefact (only when status is completed)
  const isCompleted = statusQuery.data?.status === "completed";
  
  const artefactQuery = useQuery({
    queryKey: ["runArtefact", runId],
    queryFn: async () => {
      if (!runId) return null;
      const { data, error } = await getLatestArtefact({ path: { run_id: runId } });
      if (error || !data) throw new Error("Failed to fetch artefact");
      return data;
    },
    enabled: isCompleted,
  });

  // Derived State
  const status = (runId ? statusQuery.data?.status : localStatus) as Status;
  const updates = statusQuery.data?.model_responses || [];
  const error = startMutation.error?.message || statusQuery.error?.message || artefactQuery.error?.message || null;
  
  const reset = useCallback(() => {
    setRunId(null);
    setLocalStatus("idle");
    setUploadProgress(0);
    startMutation.reset();
  }, [startMutation]);

  return {
    start: startMutation.mutate,
    reset,
    runId,
    status,
    error,
    updates,
    uploadProgress: status === "uploading" && runId ? (statusQuery.data?.upload_progress || 100) : uploadProgress,
    downloadUrl: artefactQuery.data?.download_url || null,
    previewUrl: artefactQuery.data?.preview_url || null,
    isStreaming: status === "generating",
    isCompleted: status === "completed",
    isLoading: startMutation.isPending || (!!runId && status !== "completed" && status !== "error"),
  };
}
