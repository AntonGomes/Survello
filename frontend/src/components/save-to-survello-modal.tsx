"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderOpen, Briefcase, Check, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  readJobsOptions,
  readJobOptions,
  readRunArtefactsOptions,
  updateFileMutation,
} from "@/client/@tanstack/react-query.gen";
import { toast } from "sonner";

interface SaveToSurvelloModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  runId: number | null;
  initialJobId?: number;
}

export function SaveToSurvelloModal({
  open,
  onOpenChange,
  runId,
  initialJobId,
}: SaveToSurvelloModalProps) {
  const queryClient = useQueryClient();
  const [selectedJobId, setSelectedJobId] = useState<string>(
    initialJobId?.toString() || ""
  );
  const [selectedInstructionId, setSelectedInstructionId] = useState<string>("");

  // Fetch minimal jobs list
  const { data: jobs, isLoading: isLoadingJobs } = useQuery({
    ...readJobsOptions({}),
    enabled: open,
  });

  // Fetch selected job details for instructions
  const { data: selectedJob, isLoading: isLoadingJob } = useQuery({
    ...readJobOptions({
      path: { job_id: parseInt(selectedJobId) },
    }),
    enabled: open && !!selectedJobId,
  });

  // Fetch run artefacts to get the output file IDs
  const { data: artefacts } = useQuery({
    ...readRunArtefactsOptions({
      path: { run_id: runId! },
    }),
    enabled: open && !!runId,
  });

  // Update file mutation
  const { mutate: updateFile, isPending } = useMutation({
    ...updateFileMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: readJobOptions({ path: { job_id: parseInt(selectedJobId) } }).queryKey,
      });
      toast.success("Document saved to Survello");
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to save document");
    },
  });

  // Reset instruction selection when job changes
  useEffect(() => {
    setSelectedInstructionId("");
  }, [selectedJobId]);

  // Set initial job if provided
  useEffect(() => {
    if (initialJobId) {
      setSelectedJobId(initialJobId.toString());
    }
  }, [initialJobId, open]);

  const handleSave = () => {
    if (!artefacts || artefacts.length === 0) {
      toast.error("No output files found");
      return;
    }

    const artefact = artefacts[0];
    if (!artefact?.file_id) {
      toast.error("No output file found");
      return;
    }

    // Update the artefact file to attach to job/instruction
    updateFile({
      path: { file_id: artefact.file_id },
      body: {
        job_id: selectedJobId ? parseInt(selectedJobId) : null,
        instruction_id: selectedInstructionId ? parseInt(selectedInstructionId) : null,
      },
    });
  };

  const instructions = selectedJob?.instructions || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save to Survello</DialogTitle>
          <DialogDescription>
            Attach the generated document to a job and optionally an instruction.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Job Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Job
            </Label>
            <Select
              value={selectedJobId}
              onValueChange={setSelectedJobId}
              disabled={isLoadingJobs}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a job..." />
              </SelectTrigger>
              <SelectContent>
                {jobs?.map((job) => (
                  <SelectItem key={job.id} value={job.id.toString()}>
                    {job.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Instruction Selection (optional) */}
          {selectedJobId && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Instruction (Optional)
              </Label>
              <Select
                value={selectedInstructionId}
                onValueChange={setSelectedInstructionId}
                disabled={isLoadingJob || instructions.length === 0}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isLoadingJob
                        ? "Loading..."
                        : instructions.length === 0
                        ? "No instructions in this job"
                        : "Select an instruction..."
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {instructions.map((instruction) => (
                    <SelectItem key={instruction.id} value={instruction.id.toString()}>
                      {instruction.instruction_type?.name || "Instruction"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selectedJobId || isPending}
            className="gap-2"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
