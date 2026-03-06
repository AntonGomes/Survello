import { ReactNode } from "react";
import { Upload } from "lucide-react";
import { Dropzone, DropzoneContent } from "@/components/ui/shadcn-io/dropzone";

type Props = {
  title: string;
  icon: ReactNode;
  hint?: string;
  required?: boolean;
  files: File[];
  onDrop: (files: File[]) => void;
  maxFiles?: number;
};

export function UploadCard({
  title,
  icon,
  hint,
  required = false,
  files,
  onDrop,
  maxFiles = 1,
}: Props) {
  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <span className={`text-xs ml-auto ${required ? "text-destructive" : "text-muted-foreground"}`}>
          {hint ?? (required ? "Required" : "Optional")}
        </span>
      </div>
      <Dropzone
        maxFiles={maxFiles}
        onDrop={onDrop}
        src={files}
        className="border-2 border-dashed border-accent/40 bg-primary/10 hover:border-accent hover:bg-accent/10 transition-all rounded-xl"
      >
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/20 text-primary mb-3">
              <Upload size={20} />
            </div>
            <p className="font-medium text-sm text-foreground mb-1">
              Browse Files
            </p>
            <p className="text-xs text-muted-foreground">
              Click to browse or drag files here
            </p>
          </div>
        ) : (
          <DropzoneContent />
        )}
      </Dropzone>
      {files.length > 0 && (
        <p className="text-sm text-muted-foreground mt-3">
          {files.length} file{files.length !== 1 ? "s" : ""} added
        </p>
      )}
    </div>
  );
}
