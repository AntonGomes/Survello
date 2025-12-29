import { Dispatch, SetStateAction } from "react";
import { FileText, Image as ImageIcon } from "lucide-react";
import { UploadCard } from "@/components/upload-card";

interface UploadSectionProps {
  contextFiles: File[];
  setContextFiles: Dispatch<SetStateAction<File[]>>;
  templateFile: File | null;
  setTemplateFile: Dispatch<SetStateAction<File | null>>;
}

export function UploadSection({
  contextFiles,
  setContextFiles,
  templateFile,
  setTemplateFile,
}: UploadSectionProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      <UploadCard
        title="Context Files"
        icon={<ImageIcon className="w-5 h-5 text-accent" />}
        hint="Optional"
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
  );
}
