"use client";

import { useQuery } from "@tanstack/react-query";
import { FeatureHeader } from "@/components/feature-header";
import { InstructionTypeCard } from "@/components/instruction-type-card";
import { CreateInstructionTypeDialog } from "@/components/create-instruction-type-dialog";
import { readInstructionTypesOptions } from "@/client/@tanstack/react-query.gen";
import { Loader2 } from "lucide-react";

export default function TemplatesPage() {
  const { data: instructionTypes, isLoading, isError } = useQuery({
    ...readInstructionTypesOptions(),
  });

  return (
    <div className="space-y-6 h-full flex flex-col">
      <FeatureHeader title="Document Templates" badge={null} />

      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Configure instruction types and their default document templates. These templates are used when generating reports and documents for each instruction type.
        </p>
        <CreateInstructionTypeDialog />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="text-center py-12 text-destructive border rounded-lg border-dashed border-destructive/50 bg-destructive/10">
          Failed to load instruction types. Please try again later.
        </div>
      ) : instructionTypes && instructionTypes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {instructionTypes.map((instructionType) => (
            <InstructionTypeCard key={instructionType.id} instructionType={instructionType} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
          No instruction types yet. Create your first one to get started.
        </div>
      )}
    </div>
  );
}
