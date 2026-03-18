"use client";

import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  Image as ImageIcon,
  StickyNote,
  FolderOpen,
  Files,
} from "lucide-react";

import { UploadCard } from "@/components/upload-card";
import { Card, CardContent } from "@/components/ui/card";
import { readJobOptions } from "@/client/@tanstack/react-query.gen";

const MAX_SURVEY_IMAGES = 500;
const MAX_CONTEXT_FILES = 100;

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
};

function deduplicateFiles(existing: File[], incoming: File[]) {
  const newFiles = incoming.filter(
    (file) => !existing.some((p) => p.name === file.name),
  );
  return [...existing, ...newFiles];
}

export function DilapsUploadGrid({ files, onUpdate }: DilapsUploadGridProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UploadCard
        title="Lease PDF"
        icon={<FileText className="w-5 h-5 text-accent" />}
        hint="Required"
        required
        files={files.leaseFile ? [files.leaseFile] : []}
        onDrop={(dropped) =>
          onUpdate({ ...files, leaseFile: dropped[0] || null })
        }
        maxFiles={1}
        accept={{ "application/pdf": [".pdf"] }}
      />
      <UploadCard
        title="Lease Documentation"
        icon={<Files className="w-5 h-5 text-accent" />}
        hint="Optional"
        files={files.leaseDocFiles}
        onDrop={(dropped) =>
          onUpdate({
            ...files,
            leaseDocFiles: deduplicateFiles(files.leaseDocFiles, dropped),
          })
        }
        maxFiles={MAX_CONTEXT_FILES}
      />
      <UploadCard
        title="Site Notes"
        icon={<StickyNote className="w-5 h-5 text-accent" />}
        hint="Optional"
        files={files.siteNoteFiles}
        onDrop={(dropped) =>
          onUpdate({
            ...files,
            siteNoteFiles: deduplicateFiles(files.siteNoteFiles, dropped),
          })
        }
        maxFiles={MAX_CONTEXT_FILES}
      />
      <UploadCard
        title="Survey Images"
        icon={<ImageIcon className="w-5 h-5 text-accent" />}
        hint="Required"
        required
        files={files.surveyImageFiles}
        onDrop={(dropped) =>
          onUpdate({
            ...files,
            surveyImageFiles: deduplicateFiles(
              files.surveyImageFiles,
              dropped,
            ),
          })
        }
        maxFiles={MAX_SURVEY_IMAGES}
        accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp", ".heic"] }}
      />
      <UploadCard
        title="Misc"
        icon={<FolderOpen className="w-5 h-5 text-accent" />}
        hint="Optional"
        files={files.miscFiles}
        onDrop={(dropped) =>
          onUpdate({
            ...files,
            miscFiles: deduplicateFiles(files.miscFiles, dropped),
          })
        }
        maxFiles={MAX_CONTEXT_FILES}
      />
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
