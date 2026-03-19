"use client";

import { Files, StickyNote, FolderOpen, ChevronDown } from "lucide-react";
import { ReactNode } from "react";
import { useDropzone } from "react-dropzone";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

const MAX_CONTEXT_FILES = 100;

type DocSlot = {
  key: string;
  title: string;
  icon: ReactNode;
  files: File[];
  onDrop: (files: File[]) => void;
};

type Props = {
  slots: DocSlot[];
  disabled?: boolean;
};

export function SupportingDocs({ slots, disabled }: Props) {
  const totalFiles = slots.reduce((sum, s) => sum + s.files.length, 0);

  return (
    <Collapsible>
      <CollapsibleTrigger className="flex w-full items-center gap-3 rounded-xl border border-border bg-card px-5 py-4 text-left transition-all hover:bg-muted/50 group">
        <span className="text-sm font-semibold text-foreground flex-1">
          Supporting Documents
        </span>
        {totalFiles > 0 && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {totalFiles} file{totalFiles !== 1 ? "s" : ""}
          </Badge>
        )}
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
          Optional
        </Badge>
        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mt-3 space-y-2">
          {slots.map((slot) => (
            <DocSlotRow key={slot.key} slot={slot} disabled={disabled} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function DocSlotRow({ slot, disabled }: { slot: DocSlot; disabled?: boolean }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxFiles: MAX_CONTEXT_FILES,
    disabled,
    onDrop: slot.onDrop,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-3.5 cursor-pointer transition-all hover:border-accent/40",
        isDragActive && "ring-2 ring-accent/40 border-accent bg-accent/5",
        disabled && "opacity-50 pointer-events-none",
      )}
    >
      <input {...getInputProps()} />
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
        {slot.icon}
      </div>
      <span className="text-sm font-medium text-foreground flex-1">{slot.title}</span>
      <SlotStatus count={slot.files.length} isDragActive={isDragActive} />
    </div>
  );
}

function SlotStatus({ count, isDragActive }: { count: number; isDragActive: boolean }) {
  if (isDragActive) {
    return <span className="text-xs text-accent font-medium">Drop here</span>;
  }
  if (count > 0) {
    return (
      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
        {count} file{count !== 1 ? "s" : ""}
      </Badge>
    );
  }
  return <span className="text-xs text-muted-foreground">Drop or click</span>;
}

export function buildDocSlots(
  files: { leaseDocFiles: File[]; siteNoteFiles: File[]; miscFiles: File[] },
  onUpdate: (patch: Partial<typeof files>) => void,
): DocSlot[] {
  return [
    {
      key: "lease-docs",
      title: "Lease Documentation",
      icon: <Files className="h-4 w-4 text-muted-foreground" />,
      files: files.leaseDocFiles,
      onDrop: (dropped) => onUpdate({ leaseDocFiles: deduplicateFiles(files.leaseDocFiles, dropped) }),
    },
    {
      key: "site-notes",
      title: "Site Notes",
      icon: <StickyNote className="h-4 w-4 text-muted-foreground" />,
      files: files.siteNoteFiles,
      onDrop: (dropped) => onUpdate({ siteNoteFiles: deduplicateFiles(files.siteNoteFiles, dropped) }),
    },
    {
      key: "misc",
      title: "Miscellaneous",
      icon: <FolderOpen className="h-4 w-4 text-muted-foreground" />,
      files: files.miscFiles,
      onDrop: (dropped) => onUpdate({ miscFiles: deduplicateFiles(files.miscFiles, dropped) }),
    },
  ];
}

function deduplicateFiles(existing: File[], incoming: File[]) {
  const newFiles = incoming.filter(
    (file) => !existing.some((p) => p.name === file.name),
  );
  return [...existing, ...newFiles];
}
