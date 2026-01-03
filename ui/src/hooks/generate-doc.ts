import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "@/lib/api"; // Import the helper

export type Status =
  | "idle"
  | "presigning"
  | "uploading"
  | "generating"
  | "finalising"
  | "completed"
  | "error";

export enum FileRole {
  TEMPLATE = "template",
  INPUT = "input",
  ARTEFACT = "artefact",
  PREVIEW_PDF = "preview_pdf",
}

export interface FileRead {
  id?: number;
  storage_key?: string; 
  file_name: string;
  mime_type: string;
  role: FileRole;
}

export interface GetPresignPutsRequest {
  files: FileRead[];
}

export interface PresignedPut {
  file: FileRead;
  put_url: string;
}
export interface GetPresignPutsResponse {
  puts: PresignedPut[];
}

interface RegisterFilesRequest {
  files: FileRead[];
}

interface RegisterFilesResponse {
  files: FileRead[];
}

interface StartRunRequest {
  template_id: number;
  context_file_ids: number[];
  job_id?: number;
}

type StartArgs = {
  templateFile: File | null;
  contextFiles: File[];
};

export function useGenerateDoc() {
  const [runId, setRunId] = useState<number | null>(null);
  const [updates, setUpdates] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const reset = useCallback(() => {
    setRunId(null);
    setUpdates([]);
    setError(null);
    setStatus("idle");
    setDownloadUrl(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const start = useCallback(
    async ({ templateFile, contextFiles }: StartArgs) => {
      if (!templateFile) return;
      try {
        setError(null);
        setUpdates([]);
        setUploadProgress(0);

        // 1. Presigning + Upload to storgae
        setStatus("presigning");

        const filesMetaDataBundle: FileRead[] = [
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
        const getPresignPutsRequestPayload: GetPresignPutsRequest = { files: filesMetaDataBundle };

        const response = await apiFetch("/store/presign_uploads", {
          method: "POST",
          body: JSON.stringify(getPresignPutsRequestPayload),
        });

        const { puts } = response as GetPresignPutsResponse;

        const numFiles = puts.length;
        let uploadedFiles= 0;
        let presignProgress = 30;

        const bumpProgress = () => {
          uploadedFiles += 1;
          const next =
            numFiles === 0 ? presignProgress : Math.min(presignProgress, Math.round((uploadedFiles/ numFiles) * presignProgress));
          setUploadProgress(next);
        };

        const put = (file: File, put: PresignedPut) =>
          new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.upload.onprogress = () => {bumpProgress()};
            xhr.onerror = () => reject(new Error(`Failed to upload ${put.file.file_name}`));
            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                bumpProgress();
                resolve();
              } else {
                reject(new Error(`Upload failed with status ${xhr.status}`));
              }
            };
            xhr.open("PUT", put.put_url);
            xhr.setRequestHeader("Content-Type", file.type);
            xhr.send(file);
          });

        await Promise.all([
          put(templateFile, puts[0]),
          ...contextFiles.map((file, idx) =>
            put(file, puts[idx + 1]),
          ),
        ]);
        setUploadProgress(presignProgress);

        // 2. Register files
        const registerPayload: RegisterFilesRequest = {
            files: puts.map(p => p.file)
        };
        
        const registerRes = await apiFetch("/store/register", {
            method: "POST",
            body: JSON.stringify(registerPayload)
        }) as RegisterFilesResponse;
        
        const registeredFiles = registerRes.files;
        // Assuming order is preserved
        const templateId = registeredFiles[0].id!;
        const contextFileIds = registeredFiles.slice(1).map(f => f.id!);

        // 3. starting run
        const startRunPayload: StartRunRequest = {
          template_id: templateId,
          context_file_ids: contextFileIds,
        };

        const startRunRes = await apiFetch("/generate/start_run", {
          method: "POST",
          body: JSON.stringify(startRunPayload),
        });
        
        const { run_id: newRunId } = startRunRes as { run_id: number };
        setRunId(newRunId);
        
        const poll = async () => {
          try {
            const data = await apiFetch(`/generate/status/${newRunId}`);
            console.log("Polled run status data:", data); // DEBUG
            setStatus(data.status);
            if (data.status == "uploading") {
                setUploadProgress(data.upload_progress || 30);
            }
            if (data.status == "generating") {
                setUpdates(data.model_responses);
            }
            // Should maybe doing something here with finialising status?
            
            if (data.status === "completed") {
               const dlRes = await apiFetch(`/generate/latest_artefact/${newRunId}`);
               const { download_url, preview_url } = dlRes;
               setDownloadUrl(download_url);
               setPreviewUrl(preview_url);
               return true; 
            } else if (data.status === "error") {
               setError("Run failed during processing.");
               return true; 
            }
            
            return false; 
          } catch (e) {
            console.error("Polling error", e);
            return false;
          }
        };

        pollIntervalRef.current = setInterval(async () => {
            const stop = await poll();
            if (stop && pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
            }
        }, 2000);

      } catch (err) {
        setError(err instanceof Error ? err.message : "Generation failed");
        setStatus("error");
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }
      }
    },
    [],
  );

  useEffect(() => {
      return () => {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      };
  }, []);

  const state = useMemo(
    () => ({
      runId,
      updates,
      error,
      status,
      downloadUrl,
      previewUrl,
      uploadProgress,
      isStreaming: status === "generating",
      isCompleted: status === "completed",
    }),
    [downloadUrl, error, runId, status, updates, uploadProgress],
  );

  return { ...state, start, reset, setError };
}