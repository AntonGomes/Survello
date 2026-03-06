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

export type Status = "idle" | "presigning" | "uploading" | "generating" | "finalising" | "completed" | "error";

type StartArgs = {
  templateFile: File | null;
  contextFiles: File[];
  jobId?: number;
  orgId: number;
};

const POLL_INTERVAL_MS = 1000;

function useUploadMutations() {
  const presignMutation = useMutation({ ...generateFileUploadUrlsMutation() });
  const registerFilesMutation = useMutation({ ...createFilesMutation() });
  const startRun = useMutation({ ...createRunMutation() });
  return { presignMutation, registerFilesMutation, startRun };
}

function useRunPolling({ runId, localStatus }: { runId: number | null; localStatus: Status }) {
  const { data: run, isError: isRunError } = useQuery({
    ...readRunOptions({ path: { run_id: runId! } }),
    enabled: !!runId && localStatus !== "completed" && localStatus !== "error",
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "completed" || status === "error") return false;
      return POLL_INTERVAL_MS;
    },
  });
  return { run, isRunError };
}

function useArtefactDownloads(runId: number | null, runStatus: string | undefined) {
  const { data: artefacts } = useQuery({
    ...readRunArtefactsOptions({ path: { run_id: runId! } }),
    enabled: !!runId && runStatus === "completed",
  });
  const outputArtefact = artefacts?.[0];
  const { data: downloadUrl } = useQuery({
    ...generateFileDownloadUrlOptions({ path: { file_id: outputArtefact?.file_id ?? 0 } }),
    enabled: !!outputArtefact?.file_id,
  });
  const { data: previewUrl } = useQuery({
    ...generateFileDownloadUrlOptions({ path: { file_id: outputArtefact?.preview_file_id ?? 0 }, query: { inline: true } }),
    enabled: !!outputArtefact?.preview_file_id,
  });
  return { downloadUrl, previewUrl };
}

async function executeGeneration({ args, uploads, setLocalStatus, setUploadProgress }: { args: StartArgs; uploads: ReturnType<typeof useUploadMutations>; setLocalStatus: (s: Status) => void; setUploadProgress: (p: number) => void }) {
  const { templateFile, contextFiles, jobId, orgId } = args;
  if (!templateFile) throw new Error("Template file is required");
  setLocalStatus("presigning");
  setUploadProgress(0);
  const allFiles = [{ file: templateFile, clientId: "template" }, ...contextFiles.map((file, i) => ({ file, clientId: `context-${i}` }))];
  const presignData = await uploads.presignMutation.mutateAsync({
    body: allFiles.map(({ file, clientId }) => ({ file_name: file.name, mime_type: file.type || "application/octet-stream", size_bytes: file.size, client_id: clientId })),
  });
  if (!presignData) throw new Error("Failed to get presigned URLs");
  const fileDataMap = new Map(allFiles.map(f => [f.clientId, f.file]));
  const uploadEntries = presignData.map(p => ({ file: fileDataMap.get(p.client_id!)!, ...p }));
  setLocalStatus("uploading");
  await uploadFilesToS3({ files: uploadEntries.map(u => u.file), presignedPuts: uploadEntries.map(u => ({ put_url: u.put_url, mime_type: u.mime_type })), onProgress: setUploadProgress });
  const registeredFiles = await uploads.registerFilesMutation.mutateAsync({
    body: uploadEntries.map(u => ({ file_name: u.file.name, mime_type: u.file.type || "application/octet-stream", size_bytes: u.file.size, storage_key: u.storage_key, org_id: orgId })),
  });
  if (!registeredFiles?.length) throw new Error("No files registered");
  const [templateFileRegistered, ...contextFilesRegistered] = registeredFiles;
  if (!templateFileRegistered) throw new Error("Template file not registered");
  const startResponse = await uploads.startRun.mutateAsync({ body: { template_file_id: templateFileRegistered.id, context_file_ids: contextFilesRegistered.map(f => f.id), job_id: jobId } });
  if (!startResponse) throw new Error("Failed to start run");
  return startResponse.id;
}

export function useDocumentGeneration() {
  const [runId, setRunId] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [localStatus, setLocalStatus] = useState<Status>("idle");
  const uploads = useUploadMutations();
  const { run, isRunError } = useRunPolling({ runId, localStatus });
  const { downloadUrl, previewUrl } = useArtefactDownloads(runId, run?.status);

  if (run?.status && localStatus === "generating") {
    if (run.status === "completed") setLocalStatus("completed");
    else if (run.status === "error") setLocalStatus("error");
  }

  const mutation = useMutation({
    mutationFn: (args: StartArgs) => executeGeneration({ args, uploads, setLocalStatus, setUploadProgress }),
    onSuccess: (data) => { setRunId(data); setLocalStatus("generating"); },
    onError: (error) => { console.error(error); setLocalStatus("error"); },
  });

  const reset = useCallback(() => { setRunId(null); setLocalStatus("idle"); setUploadProgress(0); mutation.reset(); }, [mutation]);

  return {
    start: mutation.mutate, reset, runId,
    status: (runId ? run?.status : localStatus) as Status,
    error: mutation.error?.message || (isRunError ? "Failed to read run status" : null),
    updates: run?.model_responses || [], uploadProgress,
    downloadUrl: downloadUrl || null, previewUrl: previewUrl || null,
    isStreaming: localStatus === "generating" && run?.status !== "completed",
    isCompleted: run?.status === "completed",
    isLoading: mutation.isPending || localStatus === "presigning" || localStatus === "uploading",
  };
}
