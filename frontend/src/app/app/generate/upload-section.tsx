"use client";

import { useQuery } from "@tanstack/react-query";
import { FolderOpen } from "lucide-react";

import { LeaseUpload } from "@/app/app/generate/lease-upload";
import { SurveyUpload } from "@/app/app/generate/survey-upload";
import { SupportingDocs, buildDocSlots } from "@/app/app/generate/supporting-docs";
import { Card, CardContent } from "@/components/ui/card";
import { readJobOptions } from "@/client/@tanstack/react-query.gen";

type UploadFiles = {
  leaseFile: File | null;
  leaseDocFiles: File[];
  siteNoteFiles: File[];
  surveyImageFiles: File[];
  miscFiles: File[];
};

type DilapsUploadGridProps = {
  files: UploadFiles;
  onUpdate: (files: UploadFiles) => void;
  disabled?: boolean;
};

function deduplicateFiles(existing: File[], incoming: File[]) {
  const newFiles = incoming.filter(
    (file) => !existing.some((p) => p.name === file.name),
  );
  return [...existing, ...newFiles];
}

export function DilapsUploadGrid({ files, onUpdate, disabled }: DilapsUploadGridProps) {
  const docSlots = buildDocSlots(
    { leaseDocFiles: files.leaseDocFiles, siteNoteFiles: files.siteNoteFiles, miscFiles: files.miscFiles },
    (patch) => onUpdate({ ...files, ...patch }),
  );

  return (
    <div className="space-y-4">
      <LeaseUpload
        file={files.leaseFile}
        onDrop={(dropped) => onUpdate({ ...files, leaseFile: dropped[0] || null })}
        disabled={disabled}
      />
      <SurveyUpload
        files={files.surveyImageFiles}
        onDrop={(dropped) => onUpdate({
          ...files,
          surveyImageFiles: deduplicateFiles(files.surveyImageFiles, dropped),
        })}
        disabled={disabled}
      />
      <SupportingDocs slots={docSlots} disabled={disabled} />
    </div>
  );
}

type LinkedJobBannerProps = {
  jobId: number;
};

export function LinkedJobBanner({ jobId }: LinkedJobBannerProps) {
  const { data: linkedJob } = useQuery({
    ...readJobOptions({ path: { job_id: jobId } }),
    enabled: !!jobId,
  });

  if (!linkedJob) return null;

  return (
    <Card className="bg-muted/50 border-dashed">
      <CardContent className="py-4">
        <div className="flex items-center gap-3">
          <FolderOpen className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">
              Linked to Job: {linkedJob.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {linkedJob.client?.name} &bull; {linkedJob.address || "No address"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
