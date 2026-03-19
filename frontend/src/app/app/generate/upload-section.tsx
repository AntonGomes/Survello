"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import {
  FileText,
  Files,
  Image as ImageIcon,
  StickyNote,
  FolderOpen,
  Check,
  X,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
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
  const added = incoming.filter(
    (file) => !existing.some((p) => p.name === file.name),
  );
  return [...existing, ...added];
}

const IMAGE_ACCEPT = { "image/*": [".png", ".jpg", ".jpeg", ".webp", ".heic"] };
const PDF_ACCEPT = { "application/pdf": [".pdf"] };
const MAX_SURVEY_IMAGES = 500;
const MAX_CONTEXT_FILES = 100;
const THUMBNAIL_DISPLAY_LIMIT = 18;

export function DilapsUploadGrid({ files, onUpdate, disabled }: DilapsUploadGridProps) {
  return (
    <div className="space-y-5">
      <LeaseSection
        leaseFile={files.leaseFile}
        leaseDocFiles={files.leaseDocFiles}
        onLeaseChange={(f) => onUpdate({ ...files, leaseFile: f })}
        onLeaseDocsChange={(f) => onUpdate({ ...files, leaseDocFiles: f })}
        disabled={disabled}
      />

      <SurveySection
        surveyFiles={files.surveyImageFiles}
        siteNoteFiles={files.siteNoteFiles}
        onSurveyChange={(f) => onUpdate({ ...files, surveyImageFiles: f })}
        onSiteNotesChange={(f) => onUpdate({ ...files, siteNoteFiles: f })}
        disabled={disabled}
      />

      <MiscDropzone
        files={files.miscFiles}
        onDrop={(dropped) =>
          onUpdate({ ...files, miscFiles: deduplicateFiles(files.miscFiles, dropped) })
        }
        disabled={disabled}
      />
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 mb-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 mt-0.5">
        <Icon className="h-4.5 w-4.5 text-primary" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function LeaseSection({
  leaseFile,
  leaseDocFiles,
  onLeaseChange,
  onLeaseDocsChange,
  disabled,
}: {
  leaseFile: File | null;
  leaseDocFiles: File[];
  onLeaseChange: (f: File | null) => void;
  onLeaseDocsChange: (f: File[]) => void;
  disabled?: boolean;
}) {
  const leaseDropzone = useDropzone({
    accept: PDF_ACCEPT,
    maxFiles: 1,
    disabled,
    onDrop: (files) => onLeaseChange(files[0] || null),
  });

  const refsDropzone = useDropzone({
    maxFiles: MAX_CONTEXT_FILES,
    disabled,
    onDrop: (dropped) => onLeaseDocsChange(deduplicateFiles(leaseDocFiles, dropped)),
  });

  return (
    <Card className="py-5">
      <CardContent>
        <SectionHeading
          icon={FileText}
          title="Lease"
          description="The lease agreement and any documents it references"
        />

        <div className="space-y-2">
          <div
            {...leaseDropzone.getRootProps()}
            className={cn(
              "flex items-center gap-3 rounded-lg border-2 border-dashed px-4 py-3.5 cursor-pointer transition-all",
              leaseFile
                ? "border-accent/40 bg-accent/5"
                : "border-border hover:border-accent/40",
              leaseDropzone.isDragActive && "border-accent bg-accent/10",
              disabled && "opacity-50 pointer-events-none",
            )}
          >
            <input {...leaseDropzone.getInputProps()} />
            {leaseFile ? (
              <>
                <Check className="h-4 w-4 text-accent shrink-0" />
                <span className="text-sm truncate flex-1">{leaseFile.name}</span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onLeaseChange(null); }}
                  className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground flex-1">
                  {leaseDropzone.isDragActive ? "Drop lease PDF here" : "Drop or click to add the lease PDF"}
                </span>
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0 shrink-0">
                  Required
                </Badge>
              </>
            )}
          </div>

          <div
            {...refsDropzone.getRootProps()}
            className={cn(
              "flex items-center gap-3 rounded-lg border border-dashed px-4 py-3 cursor-pointer transition-all",
              leaseDocFiles.length > 0
                ? "border-accent/30 bg-accent/5"
                : "border-border hover:border-accent/30",
              refsDropzone.isDragActive && "border-accent bg-accent/10",
              disabled && "opacity-50 pointer-events-none",
            )}
          >
            <input {...refsDropzone.getInputProps()} />
            <Files className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-sm text-muted-foreground">
                {refsDropzone.isDragActive
                  ? "Drop files here"
                  : "Schedules, annexes, or documents referenced in the lease"}
              </span>
            </div>
            {leaseDocFiles.length > 0 ? (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                {leaseDocFiles.length} file{leaseDocFiles.length !== 1 ? "s" : ""}
              </Badge>
            ) : (
              <Badge className="text-[10px] px-1.5 py-0 shrink-0 bg-amber-500/15 text-amber-600 border-amber-500/30">
                Recommended
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SurveySection({
  surveyFiles,
  siteNoteFiles,
  onSurveyChange,
  onSiteNotesChange,
  disabled,
}: {
  surveyFiles: File[];
  siteNoteFiles: File[];
  onSurveyChange: (f: File[]) => void;
  onSiteNotesChange: (f: File[]) => void;
  disabled?: boolean;
}) {
  const imagesDropzone = useDropzone({
    accept: IMAGE_ACCEPT,
    maxFiles: MAX_SURVEY_IMAGES,
    disabled,
    onDrop: (dropped) => onSurveyChange(deduplicateFiles(surveyFiles, dropped)),
  });

  const notesDropzone = useDropzone({
    maxFiles: MAX_CONTEXT_FILES,
    disabled,
    onDrop: (dropped) => onSiteNotesChange(deduplicateFiles(siteNoteFiles, dropped)),
  });

  const thumbnails = useMemo(
    () => surveyFiles.slice(0, THUMBNAIL_DISPLAY_LIMIT).map((f) => ({
      name: f.name,
      url: URL.createObjectURL(f),
    })),
    [surveyFiles],
  );

  const overflow = surveyFiles.length - THUMBNAIL_DISPLAY_LIMIT;

  return (
    <Card className="py-5">
      <CardContent>
        <SectionHeading
          icon={ImageIcon}
          title="Survey"
          description="Photos from the property inspection and any supporting notes"
        />

        <div className="space-y-2">
          <div className="rounded-lg border-2 border-dashed overflow-hidden transition-all">
            {surveyFiles.length > 0 && (
              <div className="px-4 py-3 border-b border-border/50">
                <div className="flex flex-wrap gap-2">
                  {thumbnails.map((t) => (
                    <img
                      key={t.name}
                      src={t.url}
                      alt={t.name}
                      className="h-14 w-14 rounded-md object-cover border border-border"
                    />
                  ))}
                  {overflow > 0 && (
                    <div className="flex h-14 w-14 items-center justify-center rounded-md border border-dashed border-border bg-muted/50">
                      <span className="text-xs font-medium text-muted-foreground">+{overflow}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div
              {...imagesDropzone.getRootProps()}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-all",
                surveyFiles.length > 0
                  ? "border-accent/40 bg-accent/5"
                  : "border-border hover:border-accent/40",
                imagesDropzone.isDragActive && "bg-accent/10",
                disabled && "opacity-50 pointer-events-none",
              )}
            >
              <input {...imagesDropzone.getInputProps()} />
              {surveyFiles.length > 0 ? (
                <>
                  <Plus className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground flex-1">Add more images</span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                    {surveyFiles.length} image{surveyFiles.length !== 1 ? "s" : ""}
                  </Badge>
                </>
              ) : (
                <>
                  <ImageIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground flex-1">
                    {imagesDropzone.isDragActive ? "Drop images here" : "Drop or click to add survey photos"}
                  </span>
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0 shrink-0">
                    Required
                  </Badge>
                </>
              )}
            </div>
          </div>

          <div
            {...notesDropzone.getRootProps()}
            className={cn(
              "flex items-center gap-3 rounded-lg border border-dashed px-4 py-3 cursor-pointer transition-all",
              siteNoteFiles.length > 0
                ? "border-accent/30 bg-accent/5"
                : "border-border hover:border-accent/30",
              notesDropzone.isDragActive && "border-accent bg-accent/10",
              disabled && "opacity-50 pointer-events-none",
            )}
          >
            <input {...notesDropzone.getInputProps()} />
            <StickyNote className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground flex-1">
              {notesDropzone.isDragActive
                ? "Drop files here"
                : "Site notes or observations from the survey"}
            </span>
            {siteNoteFiles.length > 0 ? (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                {siteNoteFiles.length} file{siteNoteFiles.length !== 1 ? "s" : ""}
              </Badge>
            ) : (
              <Badge className="text-[10px] px-1.5 py-0 shrink-0 bg-amber-500/15 text-amber-600 border-amber-500/30">
                Recommended
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MiscDropzone({
  files,
  onDrop,
  disabled,
}: {
  files: File[];
  onDrop: (dropped: File[]) => void;
  disabled?: boolean;
}) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxFiles: MAX_CONTEXT_FILES,
    disabled,
    onDrop,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex items-center gap-3 rounded-lg border border-dashed px-4 py-3 cursor-pointer transition-all",
        files.length > 0
          ? "border-accent/30 bg-accent/5"
          : "border-border hover:border-border-foreground/20",
        isDragActive && "border-accent bg-accent/10",
        disabled && "opacity-50 pointer-events-none",
      )}
    >
      <input {...getInputProps()} />
      <FolderOpen className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-sm text-muted-foreground flex-1">
        {isDragActive ? "Drop files here" : "Any other relevant documents"}
      </span>
      {files.length > 0 && (
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
          {files.length} file{files.length !== 1 ? "s" : ""}
        </Badge>
      )}
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
