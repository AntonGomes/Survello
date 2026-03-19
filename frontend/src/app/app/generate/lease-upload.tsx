"use client";

import { FileText, Check, X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Props = {
  file: File | null;
  onDrop: (files: File[]) => void;
  disabled?: boolean;
};

export function LeaseUpload({ file, onDrop, disabled }: Props) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled,
    onDrop,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 cursor-pointer transition-all hover:border-accent/60",
        isDragActive && "ring-2 ring-accent/40 border-accent",
        disabled && "opacity-50 pointer-events-none",
      )}
    >
      <input {...getInputProps()} />
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10">
        <FileText className="h-5 w-5 text-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">Lease PDF</span>
          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
            Required
          </Badge>
        </div>
        <FileStatusLabel file={file} isDragActive={isDragActive} />
      </div>
      {file && <RemoveButton onDrop={onDrop} />}
    </div>
  );
}

function FileStatusLabel({ file, isDragActive }: { file: File | null; isDragActive: boolean }) {
  if (isDragActive) {
    return <p className="text-xs text-accent mt-0.5">Drop your PDF here</p>;
  }
  if (file) {
    return (
      <div className="flex items-center gap-1.5 mt-0.5">
        <Check className="h-3.5 w-3.5 text-accent" />
        <p className="text-xs text-muted-foreground truncate">{file.name}</p>
      </div>
    );
  }
  return (
    <p className="text-xs text-muted-foreground mt-0.5">
      Drop a PDF or click to browse
    </p>
  );
}

function RemoveButton({ onDrop }: { onDrop: (files: File[]) => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onDrop([]);
      }}
      className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
    >
      <X className="h-4 w-4" />
    </button>
  );
}
