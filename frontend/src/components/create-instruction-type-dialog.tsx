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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  createInstructionTypeMutation,
  readInstructionTypesOptions
} from "@/client/@tanstack/react-query.gen";
import { FeeType, type InstructionTypeCreate } from "@/client/types.gen";
import { toast } from "sonner";

export function CreateInstructionTypeDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rate, setRate] = useState(0);
  const [feeType, setFeeType] = useState<FeeType>(FeeType.FIXED);
  const [contingency, setContingency] = useState(0);

  const resetForm = () => {
    setName("");
    setDescription("");
    setRate(0);
    setFeeType(FeeType.FIXED);
    setContingency(0);
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
      rate,
      default_fee_type: feeType,
      default_contingency_percentage: contingency,
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
            Define a new instruction type with default settings for your organization.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name"
              placeholder="e.g. Building Survey" 
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rate">Default Rate (£/hr)</Label>
              <Input 
                id="rate"
                type="number" 
                step="0.01" 
                min="0" 
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contingency">Contingency (%)</Label>
              <Input 
                id="contingency"
                type="number" 
                step="1" 
                min="0" 
                max="100" 
                value={contingency}
                onChange={(e) => setContingency(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="feeType">Default Fee Type</Label>
            <Select value={feeType} onValueChange={(v) => setFeeType(v as FeeType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select fee type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={FeeType.FIXED}>Fixed</SelectItem>
                <SelectItem value={FeeType.HOURLY}>Hourly</SelectItem>
                <SelectItem value={FeeType.MIXED}>Mixed</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              This will be the default fee type for instructions of this type.
            </p>
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
