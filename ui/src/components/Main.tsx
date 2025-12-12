// src/app/HomeClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, Image as ImageIcon } from "lucide-react";

import { DownloadButton } from "@/components/download-button";
import { ErrorAlert } from "@/components/error-alert";
import { JobStatusPanel } from "@/components/job-status-panel";
import { UploadCard } from "@/components/upload-card";
import { useGenerateDoc } from "@/hooks/generate-doc";

type MainProps = {
  userId?: string;
};

export function Main({ userId: initialUserId }: MainProps) {
  const [contextFiles, setContextFiles] = useState<File[]>([]);
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [userId, setUserId] = useState<string | undefined>(initialUserId);

  const {
    updates,
    error,
    status,
    isStreaming,
    isCompleted,
    downloadUrl,
    uploadProgress,
    start,
    setError,
  } = useGenerateDoc();

  // Create user via Next API route on the client so auth cookies flow automatically
  useEffect(() => {
    const ensureUser = async () => {
      if (userId) return;
      const res = await fetch("/api/users", { method: "POST" });
      if (!res.ok) throw new Error(`Failed to create user (${res.status})`);
      const data = (await res.json()) as { id: string };
      setUserId(data.id);
    };
    
    ensureUser();
  }, [userId, setUserId, setError]);

  const canStart = useMemo(
    () =>
      Boolean(templateFile) &&
      Boolean(userId) &&
      !["presigning", "uploading", "creating", "streaming"].includes(status),
    [status, templateFile, userId],
  );

  const downloadPath = useMemo(() => downloadUrl || "", [downloadUrl]);

  return (
    <>
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <UploadCard
          title="Context Files"
          icon={<ImageIcon className="w-5 h-5 text-accent" />}
          hint="Optional"
          files={contextFiles}
          onDrop={setContextFiles}
          maxFiles={100}
        />
        <UploadCard
          title="Template File"
          icon={<FileText className="w-5 h-5 text-accent" />}
          hint="Required"
          required
          files={templateFile ? [templateFile] : []}
          onDrop={(files) => setTemplateFile(files[0] || null)}
          maxFiles={1}
        />
      </div>

      {error && <ErrorAlert message={error} />}

      {!isCompleted && (

      <JobStatusPanel
        canStart={canStart}
        status={status}
        uploadProgress={uploadProgress}
        onStart={() => start({ templateFile, contextFiles, userId })}
        updates={updates}
      />
      )}

      {isCompleted && downloadPath && (
        <DownloadButton downloadPath={downloadPath} />
      )}
    </>
  );
}
