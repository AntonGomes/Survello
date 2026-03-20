"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { Loader2, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { readClientsOptions, readLeadsOptions, readInstructionTypesOptions } from "@/client/@tanstack/react-query.gen"
import { QuoteStatus } from "@/client/types.gen"

import { formSchema, type QuoteFormValues } from "./quote-form-schema"
import { useQuoteSubmit } from "./use-quote-submit"
import { ClientLeadSelect } from "./client-lead-select"
import { QuoteLinesSection } from "./quote-lines-section"

interface CreateQuoteDialogProps {
  initialClientId?: number
  initialLeadId?: number
  trigger?: React.ReactNode
}

export function CreateQuoteDialog({ initialClientId, initialLeadId, trigger }: CreateQuoteDialogProps) {
  const [open, setOpen] = useState(false)

  const { data: clients, isLoading: isLoadingClients } = useQuery({ ...readClientsOptions(), enabled: !initialClientId && !initialLeadId })
  const { data: leads, isLoading: isLoadingLeads } = useQuery({ ...readLeadsOptions(), enabled: !initialClientId && !initialLeadId })
  const { data: instructionTypes, isLoading: isLoadingTypes } = useQuery({ ...readInstructionTypesOptions() })

  const defaultClientOrLead = initialClientId ? `client:${initialClientId}` : initialLeadId ? `lead:${initialLeadId}` : ""

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", client_or_lead: defaultClientOrLead, estimated_fee: "", expected_start_date: "", status: QuoteStatus.DRAFT, notes: "", lines: [] },
  })

  const fieldArray = useFieldArray({ control: form.control, name: "lines" })
  const { onSubmit, isPending } = useQuoteSubmit({ form, setOpen })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline"><FileText className="mr-2 h-4 w-4" />Create Quote</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Quote</DialogTitle>
          <DialogDescription>Create a new quote with potential projects.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <QuoteNameField form={form} />
              {!initialClientId && !initialLeadId && (
                <FormField control={form.control} name="client_or_lead" render={({ field }) => (
                  <ClientLeadSelect field={field} clients={clients} leads={leads} isLoading={isLoadingClients || isLoadingLeads} />
                )} />
              )}
              <FeeAndStatusFields form={form} />
              <DateAndNotesFields form={form} />
            </div>
            <QuoteLinesSection fieldArray={fieldArray} formControl={form.control} instructionTypes={instructionTypes} isLoadingTypes={isLoadingTypes} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create Quote</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function QuoteNameField({ form }: { form: ReturnType<typeof useForm<QuoteFormValues>> }) {
  return (
    <FormField control={form.control} name="name" render={({ field }) => (
      <FormItem className="col-span-2">
        <FormLabel>Quote Name</FormLabel>
        <FormControl><Input placeholder="Schedule of Conditions - 123 High St" {...field} /></FormControl>
        <FormMessage />
      </FormItem>
    )} />
  )
}

function FeeAndStatusFields({ form }: { form: ReturnType<typeof useForm<QuoteFormValues>> }) {
  return (
    <>
      <FormField control={form.control} name="estimated_fee" render={({ field }) => (
        <FormItem>
          <FormLabel>Total Fee (GBP)</FormLabel>
          <FormControl><Input type="number" placeholder="5000" {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />
      <FormField control={form.control} name="status" render={({ field }) => (
        <FormItem>
          <FormLabel>Status</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
            <SelectContent>
              {Object.values(QuoteStatus).map((status) => <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>)}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )} />
    </>
  )
}

function DateAndNotesFields({ form }: { form: ReturnType<typeof useForm<QuoteFormValues>> }) {
  return (
    <>
      <FormField control={form.control} name="expected_start_date" render={({ field }) => (
        <FormItem>
          <FormLabel>Expected Start</FormLabel>
          <FormControl><Input type="date" {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />
      <FormField control={form.control} name="notes" render={({ field }) => (
        <FormItem className="col-span-2">
          <FormLabel>Notes</FormLabel>
          <FormControl><Textarea placeholder="Any additional notes..." className="resize-none" {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />
    </>
  )
}
