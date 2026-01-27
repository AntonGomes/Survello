"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { FileText, Image as ImageIcon, FolderOpen, Sparkles, Download, Upload } from "lucide-react";

import { DocumentViewerWithChat } from "@/components/document-viewer-with-chat";
import { ErrorAlert } from "@/components/error-alert";
import { JobStatusPanel } from "@/components/job-status-panel";
import { UploadCard } from "@/components/upload-card";
import { useDocumentGeneration } from "@/hooks/use-document-generation";
import { FeatureHeader } from "@/components/feature-header";
import { SaveToSurvelloModal } from "@/components/save-to-survello-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { readJobOptions } from "@/client/@tanstack/react-query.gen";
import { useAuth } from "@/context/auth-context";

export default function GeneratePage() {
  const searchParams = useSearchParams();
  const jobIdParam = searchParams.get("jobId");
  const jobId = jobIdParam ? parseInt(jobIdParam) : undefined;
  
  const { user } = useAuth();
  const [contextFiles, setContextFiles] = useState<File[]>([]);
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Fetch job if jobId is provided (for context info)
  const { data: linkedJob } = useQuery({
    ...readJobOptions({ path: { job_id: jobId! } }),
    enabled: !!jobId,
  });

  const {
    updates,
    error,
    status,
    isCompleted,
    previewUrl,
    downloadUrl,
    uploadProgress,
    start,
    reset,
    runId,
  } = useDocumentGeneration();

  const canStart = useMemo(
    () =>
      Boolean(templateFile) &&
      contextFiles.length > 0 &&
      !["presigning", "uploading", "generating"].includes(status),
    [status, templateFile, contextFiles.length],
  );

  const downloadPath = useMemo(() => downloadUrl || "", [downloadUrl]);

  // Reset state handler
  const handleStartNew = () => {
    reset();
    setContextFiles([]);
    setTemplateFile(null);
  };

  return (
    <>
      {/* Header - Always visible */}
      <FeatureHeader 
        title="Document Generator" 
        badge={linkedJob ? `Job: ${linkedJob.name}` : null}
      />

      {/* Pre-generation: Upload UI */}
      {!isCompleted && !downloadPath && (
        <div className="px-8 pb-8 space-y-6">
          {/* Info Banner when linked to job */}
          {linkedJob && (
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <FolderOpen className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      Linked to Job: {linkedJob.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {linkedJob.client?.name} • {linkedJob.address || "No address"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Section - Context files required, template required */}
          <div className="grid md:grid-cols-2 gap-6">
            <UploadCard
              title="Context Files"
              icon={<ImageIcon className="w-5 h-5 text-accent" />}
              hint="Required"
              required
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

          {/* Helper text */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Upload context files (photos, notes, documents) and a template to generate your report.</p>
          </div>
        </div>
      )}

      {error && <ErrorAlert message={error} />}

      {/* Generation progress */}
      {!isCompleted && (
        <JobStatusPanel
          canStart={canStart}
          status={status}
          uploadProgress={uploadProgress}
          onStart={() => start({ templateFile, contextFiles, jobId, orgId: user?.org_id ?? 0 })}
          updates={updates}
        />
      )}

      {/* Post-generation: Document viewer + actions */}
      {isCompleted && downloadPath && previewUrl && (
        <div className="px-8 pb-8 space-y-6">
          <DocumentViewerWithChat 
            previewUrl={previewUrl}
          />
          
          {/* Action buttons */}
          <div className="flex items-center justify-center gap-4">
            <a href={downloadPath} download>
              <Button size="lg" className="gap-2">
                <Download className="h-4 w-4" />
                Download Document
              </Button>
            </a>
            <Button 
              variant="outline" 
              size="lg" 
              className="gap-2"
              onClick={() => setShowSaveModal(true)}
            >
              <Upload className="h-4 w-4" />
              Save to Survello
            </Button>
            <Button 
              variant="ghost" 
              size="lg" 
              className="gap-2"
              onClick={handleStartNew}
            >
              <Sparkles className="h-4 w-4" />
              Generate Another
            </Button>
          </div>
        </div>
      )}

      {/* Save to Survello Modal */}
      <SaveToSurvelloModal
        open={showSaveModal}
        onOpenChange={setShowSaveModal}
        runId={runId}
        initialJobId={jobId}
      />
    </>
  );
}