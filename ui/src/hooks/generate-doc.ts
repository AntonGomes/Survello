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

const EVENT_TYPES = [
  "response.code_interpreter_call_code.done",
  "response.output_text.done",
] as const;

export function generateDoc() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [updates, setUpdates] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);


  const appendUpdate = useCallback((raw: string) => {
    if (!raw) return;
    try {
      const json = JSON.parse(raw);
      const parsed = typeof json === "string" ? json : JSON.stringify(json);
      setUpdates((prev) => prev.concat(parsed.split(/\r?\n/)));
    } catch {
      setUpdates((prev) => prev.concat(raw.split(/\r?\n/)));
    }
  }, []);

  const reset = useCallback(() => {
    setJobId(null);
    setUpdates([]);
    setError(null);
    setStatus("idle");
    setDownloadUrl(null);
    setUploadProgress(0);
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
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
        const { uploads } = (await presignRes.json()) as {
          uploads: Array<{ key: string; upload_url: string; kind: string; content_type: string }>;
        };

        const templateUpload = uploads.find((u) => u.kind === "template")!;
        const contextUploads = uploads.filter((u) => u.kind === "context");

        // 2. uploading: browser PUTs files to the presigned URLs
        setStatus("uploading");
        const totalBytes =
          templateFile.size + contextFiles.reduce((sum, file) => sum + file.size, 0);
        let uploadedBytes = 0;

        const bumpProgress = (delta: number) => {
          uploadedBytes += delta;
          const next =
            totalBytes === 0 ? 50 : Math.min(50, Math.round((uploadedBytes / totalBytes) * 50));
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
        setUploadProgress(50);

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

        // 3. streaming: open SSE to follow progress and collect updates
        setStatus("streaming");
        const es = new EventSource(`/api/generate/run_job/${newJobId}`);
        eventSourceRef.current = es;

        EVENT_TYPES.forEach((eventType) => {
          es.addEventListener(eventType, (event: MessageEvent) => {
            appendUpdate(event.data ?? "");
          });
        });

        es.addEventListener("openaiUpload", (event: MessageEvent) => {
          const percent = Number(event.data);
          if (Number.isFinite(percent)) {
            setUploadProgress((prev) => Math.max(prev, 50 + percent / 2));
          }
        });

        es.addEventListener("completed", async () => {
          // 4. completed: fetch the presigned download URL
          const res = await fetch(`/api/generate/download_url/${newJobId}`);
          const { download_url } = (await res.json()) as { download_url: string };
          setDownloadUrl(download_url);
          setStatus("completed");
          es.close();
        });

        es.addEventListener("modelError", (event: MessageEvent) => {
          setError(String(event.data || "Generation failed"));
          setStatus("error");
          es.close();
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Generation failed");
        setStatus("error");
        eventSourceRef.current?.close();
      }
    },
    [appendUpdate],
  );

  useEffect(() => () => eventSourceRef.current?.close(), []);

  const state = useMemo(
    () => ({
      jobId,
      updates,
      error,
      status,
      downloadUrl,
      uploadProgress,
      isStreaming: status === "streaming",
      isCompleted: status === "completed",
    }),
    [downloadUrl, error, jobId, status, updates, uploadProgress],
  );

  return { ...state, start, reset, setError };
}
