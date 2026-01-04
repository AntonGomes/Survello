// src/app/HomeClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, Image as ImageIcon } from "lucide-react";

import { DownloadButton } from "@/components/download-button";
import { ErrorAlert } from "@/components/error-alert";
import { JobStatusPanel } from "@/components/job-status-panel";
import { UploadCard } from "@/components/upload-card";
import { useDocumentGeneration } from "@/hooks/use-document-generation";

export function Main() {
  const [contextFiles, setContextFiles] = useState<File[]>([]);
  const [templateFile, setTemplateFile] = useState<File | null>(null);

  const {
    updates,
    error,
    status,
    isStreaming,
    isCompleted,
    downloadUrl,
    uploadProgress,
    start,
    // setError,
  } = useDocumentGeneration();

  const canStart = useMemo(
    () =>
      Boolean(templateFile) &&
      !["presigning", "uploading", "creating", "streaming"].includes(status),
    [status, templateFile],
  );

  const downloadPath = useMemo(() => downloadUrl || "", [downloadUrl]);

  return (
    <>
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Generate Document</h1>
        <p className="text-muted-foreground max-w-3xl">
          Create professional documents in seconds. Upload your context files (images, PDFs) and a template, 
          and our AI will intelligently analyze the content to generate a filled document matching your requirements.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <UploadCard
          title="Context Files"
          icon={<ImageIcon className="w-5 h-5 text-accent" />}
          hint="Optional"
          files={contextFiles}
          onDrop={(files) => {
            setContextFiles((prev) => {
              const newFiles = files.filter(
                (file) => !prev.some((p) => p.name === file.name)
              );
              return [...prev, ...newFiles];
            });
          }}
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
        onStart={() => start({ templateFile, contextFiles })}
        updates={updates}
      />
      )}

      {isCompleted && downloadPath && (
        <DownloadButton downloadPath={downloadPath} />
      )}
    </>
  );
}
