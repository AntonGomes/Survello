"use client";

import { useState, FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { createInstructionTypeMutation, readInstructionTypesOptions } from "@/client/@tanstack/react-query.gen";
import { type InstructionTypeCreate } from "@/client/types.gen";
import { toast } from "sonner";

function useCreateInstructionType(onSuccess: () => void) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { mutate: createInstructionType, isPending } = useMutation({
    ...createInstructionTypeMutation(),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: readInstructionTypesOptions().queryKey }); onSuccess(); setName(""); setDescription(""); toast.success("Instruction type created"); },
    onError: () => { toast.error("Failed to create instruction type"); },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (name.length < 2) { toast.error("Name must be at least 2 characters"); return; }
    const data: InstructionTypeCreate = { name, description: description || null, default_template_file_id: null };
    createInstructionType({ body: data });
  }

  return { name, setName, description, setDescription, isPending, handleSubmit };
}

export function CreateInstructionTypeDialog() {
  const [open, setOpen] = useState(false);
  const state = useCreateInstructionType(() => setOpen(false));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Create Instruction Type</Button></DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader><DialogTitle>Create Instruction Type</DialogTitle><DialogDescription>Define a new instruction type for your organization. This categorizes the types of work you do.</DialogDescription></DialogHeader>
        <form onSubmit={state.handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="e.g. Building Survey, Dilaps Report" value={state.name} onChange={(e) => state.setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Describe this instruction type..." className="resize-none" value={state.description} onChange={(e) => state.setDescription(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={state.isPending}>{state.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
