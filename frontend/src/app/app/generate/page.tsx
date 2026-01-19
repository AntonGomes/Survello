"use client";

import { useMemo, useState } from "react";

import { DocumentViewerWithChat } from "@/components/document-viewer-with-chat";
import { ErrorAlert } from "@/components/error-alert";
import { JobStatusPanel } from "@/components/job-status-panel";
import { UploadSection } from "@/components/upload-section";
import { useDocumentGeneration } from "@/hooks/use-document-generation";
import { FeatureHeader } from "@/components/feature-header";

export default function GeneratePage() {
  const [contextFiles, setContextFiles] = useState<File[]>([]);
  const [templateFile, setTemplateFile] = useState<File | null>(null);

  const {
    updates,
    error,
    status,
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
      <FeatureHeader 
        title="Generate Document" 
        badge={null}
      />

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