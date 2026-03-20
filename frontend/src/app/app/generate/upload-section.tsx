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
  Upload,
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

function DropWell({
  icon: Icon,
  label,
  badge,
  isDragActive,
  className,
  rootProps,
  inputProps,
}: {
  icon: React.ElementType;
  label: string;
  badge?: React.ReactNode;
  isDragActive: boolean;
  className?: string;
  rootProps: ReturnType<ReturnType<typeof useDropzone>["getRootProps"]>;
  inputProps: ReturnType<ReturnType<typeof useDropzone>["getInputProps"]>;
}) {
  return (
    <div
      {...rootProps}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 cursor-pointer transition-all",
        "bg-muted/30 hover:bg-muted/60 hover:border-primary/40",
        isDragActive && "border-primary bg-primary/10",
        className,
      )}
    >
      <input {...inputProps} />
      <div className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
        isDragActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground",
      )}>
        {isDragActive ? <Upload className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
      </div>
      <span className={cn(
        "text-sm",
        isDragActive ? "text-primary font-medium" : "text-muted-foreground",
      )}>
        {isDragActive ? "Drop here" : label}
      </span>
      {!isDragActive && badge}
    </div>
  );
}

function SecondaryDropWell({
  icon: Icon,
  label,
  badge,
  isDragActive,
  rootProps,
  inputProps,
}: {
  icon: React.ElementType;
  label: string;
  badge?: React.ReactNode;
  isDragActive: boolean;
  rootProps: ReturnType<ReturnType<typeof useDropzone>["getRootProps"]>;
  inputProps: ReturnType<ReturnType<typeof useDropzone>["getInputProps"]>;
}) {
  return (
    <div
      {...rootProps}
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed px-4 py-5 cursor-pointer transition-all",
        "bg-muted/20 hover:bg-muted/40 hover:border-primary/30",
        isDragActive && "border-primary bg-primary/10",
      )}
    >
      <input {...inputProps} />
      <div className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
        isDragActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground",
      )}>
        {isDragActive ? <Upload className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
      </div>
      <span className={cn(
        "text-xs text-center",
        isDragActive ? "text-primary font-medium" : "text-muted-foreground",
      )}>
        {isDragActive ? "Drop here" : label}
      </span>
      {!isDragActive && badge}
    </div>
  );
}

function FilledRow({
  fileName,
  onRemove,
}: {
  fileName: string;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-accent/8 border border-accent/20 px-3 py-2">
      <Check className="h-3.5 w-3.5 text-accent shrink-0" />
      <span className="text-sm truncate flex-1">{fileName}</span>
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function FileCountRow({
  count,
  label,
  rootProps,
  inputProps,
}: {
  count: number;
  label: string;
  rootProps: ReturnType<ReturnType<typeof useDropzone>["getRootProps"]>;
  inputProps: ReturnType<ReturnType<typeof useDropzone>["getInputProps"]>;
}) {
  return (
    <div
      {...rootProps}
      className="flex items-center gap-2 rounded-md bg-accent/8 border border-accent/20 px-3 py-2 cursor-pointer hover:bg-accent/15 transition-colors"
    >
      <input {...inputProps} />
      <Check className="h-3.5 w-3.5 text-accent shrink-0" />
      <span className="text-sm flex-1">
        {count} {label}
      </span>
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Plus className="h-3 w-3" /> Add more
      </span>
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
    <Card className={cn("py-5", disabled && "opacity-50 pointer-events-none")}>
      <CardContent>
        <SectionHeading
          icon={FileText}
          title="Lease"
          description="The lease agreement and any documents it references"
        />

        <div className="space-y-2">
          {leaseFile ? (
            <FilledRow
              fileName={leaseFile.name}
              onRemove={() => onLeaseChange(null)}
            />
          ) : (
            <DropWell
              icon={FileText}
              label="Lease PDF"
              badge={
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                  Required
                </Badge>
              }
              isDragActive={leaseDropzone.isDragActive}
              rootProps={leaseDropzone.getRootProps()}
              inputProps={leaseDropzone.getInputProps()}
            />
          )}

          {leaseDocFiles.length > 0 ? (
            <FileCountRow
              count={leaseDocFiles.length}
              label={`referenced document${leaseDocFiles.length !== 1 ? "s" : ""}`}
              rootProps={refsDropzone.getRootProps()}
              inputProps={refsDropzone.getInputProps()}
            />
          ) : (
            <SecondaryDropWell
              icon={Files}
              label="Schedules, annexes, or referenced documents"
              badge={
                <Badge className="text-[10px] px-1.5 py-0 bg-amber-500/15 text-amber-600 border-amber-500/30">
                  Recommended
                </Badge>
              }
              isDragActive={refsDropzone.isDragActive}
              rootProps={refsDropzone.getRootProps()}
              inputProps={refsDropzone.getInputProps()}
            />
          )}
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
    <Card className={cn("py-5", disabled && "opacity-50 pointer-events-none")}>
      <CardContent>
        <SectionHeading
          icon={ImageIcon}
          title="Survey"
          description="Photos from the property inspection and any supporting notes"
        />

        <div className="space-y-2">
          {surveyFiles.length > 0 ? (
            <div className="rounded-lg border border-accent/20 overflow-hidden">
              <div className="px-3 py-3 bg-accent/5">
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
              <div
                {...imagesDropzone.getRootProps()}
                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors border-t border-accent/10"
              >
                <input {...imagesDropzone.getInputProps()} />
                <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground flex-1">Add more photos</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {surveyFiles.length} image{surveyFiles.length !== 1 ? "s" : ""}
                </Badge>
              </div>
            </div>
          ) : (
            <DropWell
              icon={ImageIcon}
              label="Survey photos"
              badge={
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                  Required
                </Badge>
              }
              isDragActive={imagesDropzone.isDragActive}
              rootProps={imagesDropzone.getRootProps()}
              inputProps={imagesDropzone.getInputProps()}
            />
          )}

          {siteNoteFiles.length > 0 ? (
            <FileCountRow
              count={siteNoteFiles.length}
              label={`site note${siteNoteFiles.length !== 1 ? "s" : ""}`}
              rootProps={notesDropzone.getRootProps()}
              inputProps={notesDropzone.getInputProps()}
            />
          ) : (
            <SecondaryDropWell
              icon={StickyNote}
              label="Site notes or survey observations"
              badge={
                <Badge className="text-[10px] px-1.5 py-0 bg-amber-500/15 text-amber-600 border-amber-500/30">
                  Recommended
                </Badge>
              }
              isDragActive={notesDropzone.isDragActive}
              rootProps={notesDropzone.getRootProps()}
              inputProps={notesDropzone.getInputProps()}
            />
          )}
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

  if (files.length > 0) {
    return (
      <FileCountRow
        count={files.length}
        label={`other document${files.length !== 1 ? "s" : ""}`}
        rootProps={getRootProps()}
        inputProps={getInputProps()}
      />
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-3 cursor-pointer transition-all",
        "text-muted-foreground hover:bg-muted/30 hover:border-primary/20",
        isDragActive && "border-primary bg-primary/10 text-primary",
        disabled && "opacity-50 pointer-events-none",
      )}
    >
      <input {...getInputProps()} />
      <FolderOpen className="h-4 w-4" />
      <span className="text-sm">
        {isDragActive ? "Drop here" : "Other documents"}
      </span>
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
