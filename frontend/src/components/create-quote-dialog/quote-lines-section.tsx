"use client"

import { Plus, Trash2, Loader2 } from "lucide-react"
import type { UseFieldArrayReturn } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { QuoteFormValues } from "./quote-form-schema"

interface InstructionType {
  id: number
  name: string
}

interface QuoteLinesSectionProps {
  fieldArray: UseFieldArrayReturn<QuoteFormValues, "lines">
  formControl: unknown
  instructionTypes: InstructionType[] | undefined
  isLoadingTypes: boolean
}

export function QuoteLinesSection({ fieldArray, formControl, instructionTypes, isLoadingTypes }: QuoteLinesSectionProps) {
  const { fields, append, remove } = fieldArray

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Potential Instructions</h4>
        <Button type="button" variant="outline" size="sm" onClick={() => append({ instruction_type_id: "", estimated_fee: "", notes: "" })}>
          <Plus className="mr-1 h-3 w-3" />Add Instruction
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">No instructions added yet. Add potential instructions this quote covers.</p>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => (
            <QuoteLineRow key={field.id} index={index} formControl={formControl} instructionTypes={instructionTypes} isLoadingTypes={isLoadingTypes} onRemove={() => remove(index)} />
          ))}
        </div>
      )}
    </div>
  )
}

interface QuoteLineRowProps {
  index: number
  formControl: unknown
  instructionTypes: InstructionType[] | undefined
  isLoadingTypes: boolean
  onRemove: () => void
}

function QuoteLineRow({ index, formControl, instructionTypes, isLoadingTypes, onRemove }: QuoteLineRowProps) {
  const control = formControl as QuoteLinesSectionProps["formControl"]

  return (
    <div className="grid grid-cols-12 gap-2 p-3 border rounded-lg bg-muted/30">
      <FormField control={control as never} name={`lines.${index}.instruction_type_id`} render={({ field }) => (
        <FormItem className="col-span-5">
          <FormLabel className="text-xs">Instruction Type</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl><SelectTrigger className="h-8"><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
            <SelectContent>
              {isLoadingTypes ? (
                <div className="flex items-center justify-center p-2"><Loader2 className="h-4 w-4 animate-spin" /></div>
              ) : (
                instructionTypes?.map((pt) => <SelectItem key={pt.id} value={pt.id.toString()}>{pt.name}</SelectItem>)
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )} />
      <FormField control={control as never} name={`lines.${index}.estimated_fee`} render={({ field }) => (
        <FormItem className="col-span-3">
          <FormLabel className="text-xs">Fee (GBP)</FormLabel>
          <FormControl><Input type="number" placeholder="1000" className="h-8" {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />
      <FormField control={control as never} name={`lines.${index}.notes`} render={({ field }) => (
        <FormItem className="col-span-3">
          <FormLabel className="text-xs">Notes</FormLabel>
          <FormControl><Input placeholder="Notes..." className="h-8" {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />
      <div className="col-span-1 flex items-end justify-center pb-0.5">
        <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
