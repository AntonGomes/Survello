"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select";
import { createInstructionTypeMutation, readInstructionTypesOptions } from "@/client/@tanstack/react-query.gen";
import type { InstructionTypeRead } from "@/client/types.gen";

interface InstructionTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  onTypeCreated?: (newType: InstructionTypeRead) => void;
  onTypeSelected?: (type: InstructionTypeRead) => void;
  disabled?: boolean;
  placeholder?: string;
}

function InlineCreateInput({ value, onChange, isPending, onSubmit, onCancel }: {
  value: string; onChange: (v: string) => void; isPending: boolean; onSubmit: () => void; onCancel: () => void
}) {
  return (
    <div className="flex gap-2">
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="New Type Name" className="h-10" autoFocus disabled={isPending}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onSubmit(); } if (e.key === "Escape") { onCancel(); } }} />
      <Button type="button" size="icon" onClick={onSubmit} disabled={isPending || !value.trim()}>
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
      </Button>
      <Button type="button" size="icon" variant="ghost" onClick={onCancel}><X className="h-4 w-4" /></Button>
    </div>
  );
}

function TypeSelectDropdown({ value, onValueChange, types, isLoading, placeholder }: {
  value: string; onValueChange: (v: string) => void; types: InstructionTypeRead[] | undefined; isLoading: boolean; placeholder: string
}) {
  return (
    <Select onValueChange={onValueChange} value={value}>
      <SelectTrigger><SelectValue placeholder={isLoading ? "Loading..." : placeholder} /></SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-2"><Loader2 className="h-4 w-4 animate-spin" /></div>
        ) : (
          <>
            {types?.map((type) => <SelectItem key={type.id} value={type.id.toString()}>{type.name}</SelectItem>)}
            <SelectSeparator />
            <SelectItem value="_new" className="text-primary font-medium">
              <div className="flex items-center gap-2"><Plus className="h-4 w-4" />Create New Type...</div>
            </SelectItem>
          </>
        )}
      </SelectContent>
    </Select>
  );
}

export function InstructionTypeSelector({ value, onChange, onTypeCreated, onTypeSelected, placeholder = "Select Instruction Type" }: InstructionTypeSelectorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const queryClient = useQueryClient();
  const { data: instructionTypes, isLoading } = useQuery({ ...readInstructionTypesOptions() });

  const { mutate: createType, isPending: isCreatingPending } = useMutation({
    ...createInstructionTypeMutation(),
    onSuccess: (newType) => {
      queryClient.invalidateQueries({ queryKey: readInstructionTypesOptions().queryKey });
      onChange(newType.id.toString());
      onTypeCreated?.(newType);
      setIsCreating(false);
      setNewTypeName("");
    },
  });

  const handleCreateType = () => { if (!newTypeName.trim()) return; createType({ body: { name: newTypeName, description: null } }); };

  const handleValueChange = (val: string) => {
    if (val === "_new") { setIsCreating(true); return; }
    onChange(val);
    const type = instructionTypes?.find(t => t.id.toString() === val);
    if (type && onTypeSelected) onTypeSelected(type);
  };

  if (isCreating) {
    return <InlineCreateInput value={newTypeName} onChange={setNewTypeName} isPending={isCreatingPending} onSubmit={handleCreateType} onCancel={() => { setIsCreating(false); setNewTypeName(""); }} />;
  }

  return <TypeSelectDropdown value={value} onValueChange={handleValueChange} types={instructionTypes} isLoading={isLoading} placeholder={placeholder} />;
}
