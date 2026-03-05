"use client";

import { useState, FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  createInstructionTypeMutation,
  readInstructionTypesOptions
} from "@/client/@tanstack/react-query.gen";
import { type InstructionTypeCreate } from "@/client/types.gen";
import { toast } from "sonner";

export function CreateInstructionTypeDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const resetForm = () => {
    setName("");
    setDescription("");
  };

  const { mutate: createInstructionType, isPending } = useMutation({
    ...createInstructionTypeMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: readInstructionTypesOptions().queryKey });
      setOpen(false);
      resetForm();
      toast.success("Instruction type created");
    },
    onError: () => {
      toast.error("Failed to create instruction type");
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    
    if (name.length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }

    const instructionTypeData: InstructionTypeCreate = {
      name,
      description: description || null,
      default_template_file_id: null,
    };

    createInstructionType({
      body: instructionTypeData,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Instruction Type
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Instruction Type</DialogTitle>
          <DialogDescription>
            Define a new instruction type for your organization. This categorizes the types of work you do.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name"
              placeholder="e.g. Building Survey, Dilaps Report" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description"
              placeholder="Describe this instruction type..."
              className="resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
