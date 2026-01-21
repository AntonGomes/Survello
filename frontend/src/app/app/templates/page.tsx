"use client";

import { useQuery } from "@tanstack/react-query";
import { FeatureHeader } from "@/components/feature-header";
import { ProjectTypeCard } from "@/components/project-type-card";
import { CreateProjectTypeDialog } from "@/components/create-project-type-dialog";
import { readProjectTypesOptions } from "@/client/@tanstack/react-query.gen";
import { Loader2 } from "lucide-react";

export default function TemplatesPage() {
  const { data: projectTypes, isLoading, isError } = useQuery({
    ...readProjectTypesOptions(),
  });

  return (
    <div className="space-y-6 h-full flex flex-col">
      <FeatureHeader title="Templates" badge={null} />

      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Manage project types and their default templates.
        </p>
        <CreateProjectTypeDialog />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="text-center py-12 text-destructive border rounded-lg border-dashed border-destructive/50 bg-destructive/10">
          Failed to load project types. Please try again later.
        </div>
      ) : projectTypes && projectTypes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projectTypes.map((projectType) => (
            <ProjectTypeCard key={projectType.id} projectType={projectType} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
          No project types yet. Create your first one to get started.
        </div>
      )}
    </div>
  );
}
