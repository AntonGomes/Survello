"use client"

import { useState } from "react"
import { Plus, Loader2, Check, X } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select"
import { createInstructionTypeMutation, readInstructionTypesOptions } from "@/client/@tanstack/react-query.gen"

interface InstructionType { id: number; name: string }

interface InstructionTypeFieldProps {
  field: { value: string; onChange: (value: string) => void }
  instructionTypes: InstructionType[] | undefined
  isLoading: boolean
}

function InlineCreateType({ value, onChange, isPending, onSubmit, onCancel }: {
  value: string; onChange: (v: string) => void; isPending: boolean; onSubmit: () => void; onCancel: () => void
}) {
  return (
    <div className="flex gap-2">
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder="New Type Name" className="h-10" autoFocus
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onSubmit() } if (e.key === "Escape") { onCancel() } }} />
      <Button type="button" size="icon" onClick={onSubmit} disabled={isPending || !value.trim()}>
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
      </Button>
      <Button type="button" size="icon" variant="ghost" onClick={onCancel}><X className="h-4 w-4" /></Button>
    </div>
  )
}

export function InstructionTypeField({ field, instructionTypes, isLoading }: InstructionTypeFieldProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newTypeName, setNewTypeName] = useState("")
  const queryClient = useQueryClient()

  const { mutate: createType, isPending } = useMutation({
    ...createInstructionTypeMutation(),
    onSuccess: (newType) => { queryClient.invalidateQueries({ queryKey: readInstructionTypesOptions().queryKey }); field.onChange(newType.id.toString()); setIsCreating(false); setNewTypeName("") },
  })

  const handleCreate = () => { if (!newTypeName.trim()) return; createType({ body: { name: newTypeName, description: null } }) }
  const cancelCreate = () => { setIsCreating(false); setNewTypeName("") }

  if (isCreating) {
    return <FormItem><FormLabel>Instruction Type</FormLabel><InlineCreateType value={newTypeName} onChange={setNewTypeName} isPending={isPending} onSubmit={handleCreate} onCancel={cancelCreate} /><FormMessage /></FormItem>
  }

  return (
    <FormItem>
      <FormLabel>Instruction Type</FormLabel>
      <Select onValueChange={(val) => { if (val === "_new") { setIsCreating(true) } else { field.onChange(val) } }} value={field.value}>
        <FormControl><SelectTrigger><SelectValue placeholder={isLoading ? "Loading..." : "Select Type"} /></SelectTrigger></FormControl>
        <SelectContent>
          {isLoading ? <div className="flex items-center justify-center p-2"><Loader2 className="h-4 w-4 animate-spin" /></div> : (
            <>{instructionTypes?.map((type) => <SelectItem key={type.id} value={type.id.toString()}>{type.name}</SelectItem>)}<SelectSeparator /><SelectItem value="_new" className="text-primary font-medium"><div className="flex items-center gap-2"><Plus className="h-4 w-4" />Create New Type...</div></SelectItem></>
          )}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )
}
