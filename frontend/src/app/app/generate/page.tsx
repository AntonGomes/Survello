"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Sparkles, Download, Upload } from "lucide-react";

import { DocumentViewerWithChat } from "@/components/document-viewer-with-chat";
import { ErrorAlert } from "@/components/error-alert";
import { JobStatusPanel } from "@/components/job-status-panel";
import { useDocumentGeneration } from "@/hooks/use-document-generation";
import { FeatureHeader } from "@/components/feature-header";
import { SaveToSurvelloModal } from "@/components/save-to-survello-modal";
import { Button } from "@/components/ui/button";
import { readJobOptions } from "@/client/@tanstack/react-query.gen";
import { useAuth } from "@/context/auth-context";
import { LinkedJobBanner, UploadGrid } from "./upload-section";

export default function GeneratePage() {
  const searchParams = useSearchParams();
  const jobIdParam = searchParams.get("jobId");
  const jobId = jobIdParam ? parseInt(jobIdParam) : undefined;

  const { user } = useAuth();
  const [contextFiles, setContextFiles] = useState<File[]>([]);
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const { data: linkedJob } = useQuery({ ...readJobOptions({ path: { job_id: jobId! } }), enabled: !!jobId });
  const docGen = useDocumentGeneration();

  const canStart = useMemo(
    () => Boolean(templateFile) && contextFiles.length > 0 && !["presigning", "uploading", "generating"].includes(docGen.status),
    [docGen.status, templateFile, contextFiles.length],
  );

  const downloadPath = useMemo(() => docGen.downloadUrl || "", [docGen.downloadUrl]);
  const handleStartNew = () => { docGen.reset(); setContextFiles([]); setTemplateFile(null); };
  const handleContextDrop = (files: File[]) => {
    setContextFiles((prev) => { const newFiles = files.filter((file) => !prev.some((p) => p.name === file.name)); return [...prev, ...newFiles]; });
  };

  return (
    <>
      <FeatureHeader title="Document Generator" badge={linkedJob ? `Job: ${linkedJob.name}` : null} />
      {!docGen.isCompleted && !downloadPath && (
        <div className="px-8 pb-8 space-y-6">
          {linkedJob && <LinkedJobBanner name={linkedJob.name} clientName={linkedJob.client?.name} address={linkedJob.address} />}
          <UploadGrid contextFiles={contextFiles} templateFile={templateFile} onContextDrop={handleContextDrop} onTemplateDrop={(files) => setTemplateFile(files[0] || null)} />
          <div className="text-center text-sm text-muted-foreground"><p>Upload context files (photos, notes, documents) and a template to generate your report.</p></div>
        </div>
      )}
      {docGen.error && <ErrorAlert message={docGen.error} />}
      {!docGen.isCompleted && <JobStatusPanel canStart={canStart} status={docGen.status} uploadProgress={docGen.uploadProgress} onStart={() => docGen.start({ templateFile, contextFiles, jobId, orgId: user?.org_id ?? 0 })} updates={docGen.updates} />}
      {docGen.isCompleted && downloadPath && docGen.previewUrl && (
        <CompletedActions downloadPath={downloadPath} previewUrl={docGen.previewUrl} onSave={() => setShowSaveModal(true)} onStartNew={handleStartNew} />
      )}
      <SaveToSurvelloModal open={showSaveModal} onOpenChange={setShowSaveModal} runId={docGen.runId} initialJobId={jobId} />
    </>
  );
}

function CompletedActions({ downloadPath, previewUrl, onSave, onStartNew }: {
  downloadPath: string; previewUrl: string; onSave: () => void; onStartNew: () => void
}) {
  return (
    <div className="px-8 pb-8 space-y-6">
      <DocumentViewerWithChat previewUrl={previewUrl} />
      <div className="flex items-center justify-center gap-4">
        <a href={downloadPath} download><Button size="lg" className="gap-2"><Download className="h-4 w-4" />Download Document</Button></a>
        <Button variant="outline" size="lg" className="gap-2" onClick={onSave}><Upload className="h-4 w-4" />Save to Survello</Button>
        <Button variant="ghost" size="lg" className="gap-2" onClick={onStartNew}><Sparkles className="h-4 w-4" />Generate Another</Button>
      </div>
    </div>
  );
}
