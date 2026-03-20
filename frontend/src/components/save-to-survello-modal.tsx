"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderOpen, Briefcase, Check, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { readJobsOptions, readJobOptions, readRunArtefactsOptions, updateFileMutation } from "@/client/@tanstack/react-query.gen";
import { toast } from "sonner";

interface SaveToSurvelloModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  runId: number | null;
  initialJobId?: number;
}

function useSaveToSurvello({ open, runId, initialJobId, onOpenChange }: SaveToSurvelloModalProps) {
  const queryClient = useQueryClient();
  const [selectedJobId, setSelectedJobId] = useState<string>(initialJobId?.toString() || "");
  const [selectedInstructionId, setSelectedInstructionId] = useState<string>("");

  const { data: jobs, isLoading: isLoadingJobs } = useQuery({ ...readJobsOptions({}), enabled: open });
  const { data: selectedJob, isLoading: isLoadingJob } = useQuery({ ...readJobOptions({ path: { job_id: parseInt(selectedJobId) } }), enabled: open && !!selectedJobId });
  const { data: artefacts } = useQuery({ ...readRunArtefactsOptions({ path: { run_id: runId! } }), enabled: open && !!runId });

  const { mutate: updateFile, isPending } = useMutation({
    ...updateFileMutation(),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: readJobOptions({ path: { job_id: parseInt(selectedJobId) } }).queryKey }); toast.success("Document saved to Survello"); onOpenChange(false); },
    onError: () => { toast.error("Failed to save document"); },
  });

  useEffect(() => { setSelectedInstructionId(""); }, [selectedJobId]);
  useEffect(() => { if (initialJobId) setSelectedJobId(initialJobId.toString()); }, [initialJobId, open]);

  const handleSave = () => {
    if (!artefacts?.length) { toast.error("No output files found"); return; }
    const artefact = artefacts[0];
    if (!artefact?.file_id) { toast.error("No output file found"); return; }
    updateFile({ path: { file_id: artefact.file_id }, body: { job_id: selectedJobId ? parseInt(selectedJobId) : null, instruction_id: selectedInstructionId ? parseInt(selectedInstructionId) : null } });
  };

  return { selectedJobId, setSelectedJobId, selectedInstructionId, setSelectedInstructionId, jobs, isLoadingJobs, selectedJob, isLoadingJob, isPending, handleSave };
}

function JobSelect({ value, onChange, jobs, isLoading }: {
  value: string; onChange: (v: string) => void; jobs: { id: number; name: string }[] | undefined; isLoading: boolean
}) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2"><FolderOpen className="h-4 w-4" />Job</Label>
      <Select value={value} onValueChange={onChange} disabled={isLoading}>
        <SelectTrigger><SelectValue placeholder="Select a job..." /></SelectTrigger>
        <SelectContent>{jobs?.map((job) => <SelectItem key={job.id} value={job.id.toString()}>{job.name}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}

function InstructionSelect({ value, onChange, instructions, isLoading }: {
  value: string; onChange: (v: string) => void; instructions: { id: number; instruction_type?: { name?: string } | null }[]; isLoading: boolean
}) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2"><Briefcase className="h-4 w-4" />Instruction (Optional)</Label>
      <Select value={value} onValueChange={onChange} disabled={isLoading || instructions.length === 0}>
        <SelectTrigger><SelectValue placeholder={isLoading ? "Loading..." : instructions.length === 0 ? "No instructions in this job" : "Select an instruction..."} /></SelectTrigger>
        <SelectContent>{instructions.map((i) => <SelectItem key={i.id} value={i.id.toString()}>{i.instruction_type?.name || "Instruction"}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}

export function SaveToSurvelloModal(props: SaveToSurvelloModalProps) {
  const state = useSaveToSurvello(props);
  const instructions = state.selectedJob?.instructions || [];

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Save to Survello</DialogTitle><DialogDescription>Attach the generated document to a job and optionally an instruction.</DialogDescription></DialogHeader>
        <div className="space-y-4 py-4">
          <JobSelect value={state.selectedJobId} onChange={state.setSelectedJobId} jobs={state.jobs} isLoading={state.isLoadingJobs} />
          {state.selectedJobId && <InstructionSelect value={state.selectedInstructionId} onChange={state.setSelectedInstructionId} instructions={instructions} isLoading={state.isLoadingJob} />}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => props.onOpenChange(false)}>Cancel</Button>
          <Button onClick={state.handleSave} disabled={!state.selectedJobId || state.isPending} className="gap-2">
            {state.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
