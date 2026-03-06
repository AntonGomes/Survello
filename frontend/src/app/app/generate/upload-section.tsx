"use client";

import { FileText, Image as ImageIcon, FolderOpen } from "lucide-react";
import { UploadCard } from "@/components/upload-card";
import { Card, CardContent } from "@/components/ui/card";
import { InfoTooltip } from "@/components/ui/info-tooltip";

interface LinkedJobBannerProps {
  name: string;
  clientName?: string;
  address?: string | null;
}

export function LinkedJobBanner({ name, clientName, address }: LinkedJobBannerProps) {
  return (
    <Card className="bg-muted/50 border-dashed">
      <CardContent className="py-4">
        <div className="flex items-center gap-3">
          <FolderOpen className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Linked to Job: {name}</p>
            <p className="text-xs text-muted-foreground">{clientName} &bull; {address || "No address"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface UploadGridProps {
  contextFiles: File[];
  templateFile: File | null;
  onContextDrop: (files: File[]) => void;
  onTemplateDrop: (files: File[]) => void;
}

export function UploadGrid({ contextFiles, templateFile, onContextDrop, onTemplateDrop }: UploadGridProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium">Context Files</span>
          <InfoTooltip content="Upload photos, notes, survey data, or any documents that provide context for your report. These will be analyzed to generate content." side="right" />
        </div>
        <UploadCard title="Context Files" icon={<ImageIcon className="w-5 h-5 text-accent" />} hint="Required" required files={contextFiles} onDrop={onContextDrop} maxFiles={100} />
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium">Template File</span>
          <InfoTooltip content="Upload a Word document (.docx) template. The AI will fill in placeholders and generate content based on your context files." side="right" />
        </div>
        <UploadCard title="Template File" icon={<FileText className="w-5 h-5 text-accent" />} hint="Required" required files={templateFile ? [templateFile] : []} onDrop={onTemplateDrop} maxFiles={1} />
      </div>
    </div>
  );
}
