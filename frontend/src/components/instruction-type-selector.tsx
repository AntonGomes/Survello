"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "@/components/ui/select";
import { 
  createInstructionTypeMutation,
  readInstructionTypesOptions,
} from "@/client/@tanstack/react-query.gen";
import type { InstructionTypeRead } from "@/client/types.gen";

interface InstructionTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  onTypeCreated?: (newType: InstructionTypeRead) => void;
  /** Called with the selected type when auto-fill values should be applied */
  onTypeSelected?: (type: InstructionTypeRead) => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * A reusable instruction type selector with inline creation capability.
 * 
 * This component provides a consistent experience across:
 * - CreateJobDialog
 * - CreateInstructionDialog
 * - Any other place instruction types need to be selected
 */
export function InstructionTypeSelector({
  value,
  onChange,
  onTypeCreated,
  onTypeSelected,
  disabled = false,
  placeholder = "Select Instruction Type",
}: InstructionTypeSelectorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  
  const queryClient = useQueryClient();

  const { data: instructionTypes, isLoading } = useQuery({
    ...readInstructionTypesOptions(),
  });

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

  const handleCreateType = () => {
    if (!newTypeName.trim()) return;
    createType({
      body: {
        name: newTypeName,
        description: null,
      },
    });
  };

  const handleValueChange = (val: string) => {
    if (val === "_new") {
      setIsCreating(true);
    } else {
      onChange(val);
      // Find and notify about selected type for auto-fill
      const type = instructionTypes?.find(t => t.id.toString() === val);
      if (type && onTypeSelected) {
        onTypeSelected(type);
      }
    }
  };

  if (isCreating) {
    return (
      <div className="flex gap-2">
        <Input 
          value={newTypeName} 
          onChange={(e) => setNewTypeName(e.target.value)}
          placeholder="New Type Name"
          className="h-10"
          autoFocus
          disabled={isCreatingPending}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleCreateType();
            }
            if (e.key === "Escape") {
              setIsCreating(false);
              setNewTypeName("");
            }
          }}
        />
        <Button 
          type="button" 
          size="icon" 
          onClick={handleCreateType}
          disabled={isCreatingPending || !newTypeName.trim()}
        >
          {isCreatingPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
        </Button>
        <Button 
          type="button" 
          size="icon" 
          variant="ghost"
          onClick={() => {
            setIsCreating(false);
            setNewTypeName("");
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Select 
      onValueChange={handleValueChange} 
      value={value}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder={isLoading ? "Loading..." : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {isLoading ? (
          <div className="flex items-center justify-center p-2">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : (
          <>
            {instructionTypes?.map((type) => (
              <SelectItem key={type.id} value={type.id.toString()}>
                {type.name}
              </SelectItem>
            ))}
            <SelectSeparator />
            <SelectItem value="_new" className="text-primary font-medium">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create New Type...
              </div>
            </SelectItem>
          </>
        )}
      </SelectContent>
    </Select>
  );
}
