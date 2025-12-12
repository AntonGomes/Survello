import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type Status =
  | "idle"
  | "presigning"
  | "uploading"
  | "creating"
  | "streaming"
  | "completed"
  | "error";

type StartArgs = {
  templateFile: File | null;
  contextFiles: File[];
  userId?: string;
};

export function useGenerateDoc() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [updates, setUpdates] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const reset = useCallback(() => {
    setJobId(null);
    setUpdates([]);
    setError(null);
    setStatus("idle");
    setDownloadUrl(null);
    setUploadProgress(0);
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const start = useCallback(
    async ({ templateFile, contextFiles, userId }: StartArgs) => {
      if (!templateFile) return;
      try {
        setError(null);
        setUpdates([]);
        setUploadProgress(0);

        // 1. presigning: ask backend for presigned URLs + storage keys
        setStatus("presigning");

        const filesMeta = [
          {
            name: templateFile.name,
            content_type: templateFile.type || "application/octet-stream",
            kind: "template",
          },
          ...contextFiles.map((file) => ({
            name: file.name,
            content_type: file.type || "application/octet-stream",
            kind: "context",
          })),
        ];

        const presignRes = await fetch("/api/generate/presign_uploads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, files: filesMeta }),
        });
        console.log("presignedRes", presignRes);
        const { uploads } = (await presignRes.json()) as {
          uploads: Array<{ key: string; upload_url: string; kind: string; content_type: string }>;
        };
        console.log("uploads", uploads);

        const templateUpload = uploads.find((u) => u.kind === "template")!;
        const contextUploads = uploads.filter((u) => u.kind === "context");

        // 2. uploading: browser PUTs files to the presigned URLs
        setStatus("uploading");
        const totalBytes =
          templateFile.size + contextFiles.reduce((sum, file) => sum + file.size, 0);
        let uploadedBytes = 0;

        const bumpProgress = (delta: number) => {
          uploadedBytes += delta;
          // Scale 0-100% of S3 upload to 0-33% of total job
          const next =
            totalBytes === 0 ? 33 : Math.min(33, Math.round((uploadedBytes / totalBytes) * 33));
          setUploadProgress(next);
        };

        const put = (file: File, url: string, contentType: string) =>
          new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            let previousLoaded = 0;

            xhr.upload.onprogress = (event: ProgressEvent<EventTarget>) => {
              const loaded = event.lengthComputable ? event.loaded : file.size;
              const delta = Math.max(0, loaded - previousLoaded);
              previousLoaded = loaded;
              bumpProgress(delta);
            };

            xhr.onerror = () => reject(new Error(`Failed to upload ${file.name}`));
            xhr.onload = () => {
              // Ensure we count any remaining bytes and resolve.
              bumpProgress(Math.max(0, file.size - previousLoaded));
              resolve();
            };

            xhr.open("PUT", url);
            xhr.setRequestHeader("Content-Type", contentType);
            xhr.send(file);
          });

        await Promise.all([
          put(templateFile, templateUpload.upload_url, templateUpload.content_type),
          ...contextFiles.map((file, idx) =>
            put(file, contextUploads[idx].upload_url, contextUploads[idx].content_type),
          ),
        ]);
        setUploadProgress(33);

        // 2. creating: tell backend to create the job using uploaded file keys
        setStatus("creating");
        const jobRes = await fetch("/api/generate/create_job", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            template_file_url: templateUpload.key,
            context_file_urls: contextUploads.map((c) => c.key),
          }),
        });
        const { id: newJobId } = (await jobRes.json()) as { id: string };
        setJobId(newJobId);

        // 3. Polling: check status periodically
        setStatus("streaming");
        
        const poll = async () => {
          try {
            const res = await fetch(`/api/generate/status/${newJobId}`);
            if (!res.ok) {
               // If 404 or other error, maybe retry or fail?
               console.error("Status check failed", res.status);
               return false;
            }
            
            const data = await res.json();
            // data: { id, status, progress, logs, output_document_url }
            
            if (data.logs) {
                setUpdates(data.logs);
            }
            
            if (typeof data.progress === 'number') {
                // Backend returns 33-100 range.
                // We take the max to ensure we don't jump back if S3 upload finished at 33
                // and backend starts at 33.
                setUploadProgress(prev => Math.max(prev, data.progress));
            }
            
            if (data.status === "completed") {
               const dlRes = await fetch(`/api/generate/download_url/${newJobId}`);
               const { download_url } = await dlRes.json();
               setDownloadUrl(download_url);
               setStatus("completed");
               return true; // stop polling
            } else if (data.status === "failed") {
               setError("Job failed during processing.");
               setStatus("error");
               return true; // stop polling
            }
            
            return false; // continue polling
          } catch (e) {
            console.error("Polling error", e);
            return false;
          }
        };

        // Start polling loop
        pollIntervalRef.current = setInterval(async () => {
            const stop = await poll();
            if (stop && pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
            }
        }, 2000); // Poll every 2 seconds

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

  const statusMessage = useMemo(() => {
      if (status === "presigning" || status === "uploading") return "Uploading files...";
      if (status === "creating") return "Creating job...";
      if (status === "streaming") {
          if (uploadProgress < 66) return "Preparing documents...";
          if (uploadProgress < 100) return "Sending to AI...";
          return "AI is thinking...";
      }
      if (status === "completed") return "Document generated!";
      if (status === "error") return "Error occurred";
      return "";
  }, [status, uploadProgress]);

  const state = useMemo(
    () => ({
      jobId,
      updates,
      error,
      status,
      statusMessage,
      downloadUrl,
      uploadProgress,
      isStreaming: status === "streaming",
      isCompleted: status === "completed",
    }),
    [downloadUrl, error, jobId, status, statusMessage, updates, uploadProgress],
  );

  return { ...state, start, reset, setError };
}
