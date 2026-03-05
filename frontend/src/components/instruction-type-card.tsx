"use client";

import { FolderOpen, FileText, Pencil, Paperclip } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { InstructionTypeRead } from "@/client";

interface InstructionTypeCardProps {
  instructionType: InstructionTypeRead;
}

export function InstructionTypeCard({ instructionType }: InstructionTypeCardProps) {
  const hasTemplate = !!instructionType.default_template_file_id;

  return (
    <Card className="group hover:border-primary/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-lg truncate">{instructionType.name}</CardTitle>
            {instructionType.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {instructionType.description}
              </p>
            )}
          </div>
          <FolderOpen className="h-5 w-5 text-muted-foreground shrink-0" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Template Status */}
        <div className="flex items-center gap-2">
          {hasTemplate ? (
            <Badge variant="secondary" className="gap-1">
              <FileText className="h-3 w-3" />
              Template attached
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground gap-1">
              <FileText className="h-3 w-3" />
              No template
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Edit
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Paperclip className="h-3.5 w-3.5 mr-1.5" />
            {hasTemplate ? "Change" : "Attach"} Template
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
