"use client";

import { useEffect, useMemo, useState } from "react";

import { DocumentViewerWithChat } from "@/components/document-viewer-with-chat";
import { ErrorAlert } from "@/components/error-alert";
import { JobStatusPanel } from "@/components/job-status-panel";
import { UploadSection } from "@/components/upload-section";
import { useDocumentGeneration } from "@/hooks/use-document-generation";

export default function GeneratePage() {
  const [contextFiles, setContextFiles] = useState<File[]>([]);
  const [templateFile, setTemplateFile] = useState<File | null>(null);

  const {
    updates,
    error,
    status,
    isStreaming,
    isCompleted,
    previewUrl,
    downloadUrl,
    uploadProgress,
    start,
    // setError, // setError is not exposed in the new hook, errors are handled via the error property
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

    {!isCompleted && !downloadPath && (
      <>
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Generate Document</h1>
        <p className="text-muted-foreground max-w-3xl">
          Create professional documents in seconds. Upload your context files (images, PDFs) and a template, 
          and our AI will intelligently analyze the content to generate a filled document matching your requirements.
        </p>
      </div>

      <UploadSection
        contextFiles={contextFiles}
        setContextFiles={setContextFiles}
        templateFile={templateFile}
        setTemplateFile={setTemplateFile}
      />
      </>
    )}

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

      {isCompleted && downloadPath && previewUrl &&(
        <DocumentViewerWithChat 
          downloadPath={downloadPath} 
          previewUrl={previewUrl}
        />
      )}
    </>
  );
}