"use client";

import { useMemo } from "react";
import { Image as ImageIcon, Plus } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const MAX_SURVEY_IMAGES = 500;
const THUMBNAIL_DISPLAY_LIMIT = 18;
const IMAGE_ACCEPT = { "image/*": [".png", ".jpg", ".jpeg", ".webp", ".heic"] };

type Props = {
  files: File[];
  onDrop: (files: File[]) => void;
  disabled?: boolean;
};

export function SurveyUpload({ files, onDrop, disabled }: Props) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: IMAGE_ACCEPT,
    maxFiles: MAX_SURVEY_IMAGES,
    disabled,
    onDrop,
  });

  const hasFiles = files.length > 0;

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <SurveyHeader count={files.length} />
      {hasFiles && <ThumbnailGrid files={files} />}
      <div
        {...getRootProps()}
        className={cn(
          "px-5 py-6 cursor-pointer transition-all text-center",
          isDragActive && "bg-accent/5 ring-2 ring-inset ring-accent/40",
          !isDragActive && "hover:bg-muted/50",
          disabled && "opacity-50 pointer-events-none",
        )}
      >
        <input {...getInputProps()} />
        <DropzonePrompt isDragActive={isDragActive} hasFiles={hasFiles} />
      </div>
    </div>
  );
}

function SurveyHeader({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-3 px-5 pt-5 pb-2">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
        <ImageIcon className="h-5 w-5 text-accent" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-foreground">Survey Images</span>
        <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Required</Badge>
        {count > 0 && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {count} image{count !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>
    </div>
  );
}

function ThumbnailGrid({ files }: { files: File[] }) {
  const thumbnails = useMemo(
    () => files.slice(0, THUMBNAIL_DISPLAY_LIMIT).map((f) => ({
      name: f.name,
      url: URL.createObjectURL(f),
    })),
    [files],
  );

  const overflow = files.length - THUMBNAIL_DISPLAY_LIMIT;

  return (
    <div className="px-5 py-3">
      <div className="flex flex-wrap gap-2">
        {thumbnails.map((t) => (
          <img
            key={t.name}
            src={t.url}
            alt={t.name}
            className="h-16 w-16 rounded-lg object-cover border border-border"
          />
        ))}
        {overflow > 0 && <OverflowBadge count={overflow} />}
      </div>
    </div>
  );
}

function OverflowBadge({ count }: { count: number }) {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-border bg-muted/50">
      <span className="text-xs font-medium text-muted-foreground">+{count}</span>
    </div>
  );
}

function DropzonePrompt({ isDragActive, hasFiles }: { isDragActive: boolean; hasFiles: boolean }) {
  if (isDragActive) {
    return <p className="text-sm text-accent font-medium">Drop images here</p>;
  }

  return (
    <div className="flex items-center justify-center gap-2 text-muted-foreground">
      <Plus className="h-4 w-4" />
      <p className="text-sm">
        {hasFiles ? "Add more images" : "Drop survey images or click to browse"}
      </p>
    </div>
  );
}
