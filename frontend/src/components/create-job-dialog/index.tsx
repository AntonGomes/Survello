"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Loader2, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { createJobMutation, createInstructionMutation, readJobsOptions, readClientsOptions, readClientOptions, readInstructionTypesOptions } from "@/client/@tanstack/react-query.gen"
import { JobStatus, InstructionStatus, type JobCreate, type InstructionCreate } from "@/client/types.gen"

import { ClientSelectField } from "./client-select-field"
import { InstructionTypeField } from "./instruction-type-field"

const formSchema = z.object({
  name: z.string().min(2, "Job reference must be at least 2 characters"),
  client_id: z.string().min(1, "Please select a client"),
  is_joint: z.boolean(),
  secondary_client_id: z.string().optional(),
  address: z.string().optional(),
  status: z.nativeEnum(JobStatus),
  instruction_type_id: z.string().min(1, "Please select an instruction type"),
})

type FormValues = z.infer<typeof formSchema>

interface CreateJobDialogProps {
  initialClientId?: number
  trigger?: React.ReactNode
}

function useCreateJobSubmit({ createJob, createInstruction, queryClient, initialClientId, onSuccess }: {
  createJob: (args: { body: JobCreate }) => Promise<{ id: number }>; createInstruction: (args: { body: InstructionCreate }) => Promise<unknown>
  queryClient: ReturnType<typeof useQueryClient>; initialClientId?: number; onSuccess: () => void
}) {
  return async (values: FormValues) => {
    const jobData: JobCreate = {
      name: values.name, client_id: parseInt(values.client_id), is_joint: values.is_joint,
      secondary_client_id: values.is_joint && values.secondary_client_id ? parseInt(values.secondary_client_id) : null,
      address: values.address || null, status: values.status as JobStatus,
    }
    const newJob = await createJob({ body: jobData })
    await createInstruction({ body: { description: "", job_id: newJob.id, instruction_type_id: parseInt(values.instruction_type_id), status: InstructionStatus.PLANNED } })
    invalidateJobQueries({ queryClient, initialClientId })
    onSuccess()
  }
}

export function CreateJobDialog({ initialClientId, trigger }: CreateJobDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const { data: clients, isLoading: isLoadingClients } = useQuery({ ...readClientsOptions(), enabled: open })
  const { data: instructionTypes, isLoading: isLoadingTypes } = useQuery({ ...readInstructionTypesOptions() })
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", client_id: initialClientId ? initialClientId.toString() : "", is_joint: false, secondary_client_id: "", address: "", status: JobStatus.PLANNED, instruction_type_id: "" },
  })
  const { mutateAsync: createJob, isPending: isCreatingJob } = useMutation({ ...createJobMutation() })
  const { mutateAsync: createInstruction, isPending: isCreatingInstruction } = useMutation({ ...createInstructionMutation() })
  const isPending = isCreatingJob || isCreatingInstruction
  const onSubmit = useCreateJobSubmit({ createJob: createJob as never, createInstruction: createInstruction as never, queryClient, initialClientId, onSuccess: () => { setOpen(false); form.reset() } })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || (<Button><Plus className="mr-2 h-4 w-4" />Create Job</Button>)}</DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Job</DialogTitle>
          <DialogDescription>{initialClientId ? "Create a new job with its first instruction for this client." : "Create a new job with its first instruction. A job number will be automatically assigned."}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <JobDetailsSection form={form} clients={clients} isLoadingClients={isLoadingClients} initialClientId={initialClientId} />
            <Separator />
            <InstructionSection form={form} instructionTypes={instructionTypes} isLoadingTypes={isLoadingTypes} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isPending}>{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create Job & Instruction</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

function invalidateJobQueries({ queryClient, initialClientId }: {
  queryClient: ReturnType<typeof useQueryClient>; initialClientId?: number
}) {
  queryClient.invalidateQueries({ queryKey: readJobsOptions({ query: { limit: 100, offset: 0 } }).queryKey })
  queryClient.invalidateQueries({ queryKey: readJobsOptions().queryKey })
  if (initialClientId) {
    queryClient.invalidateQueries({ queryKey: readClientOptions({ path: { client_id: initialClientId } }).queryKey })
  }
}

function JobDetailsSection({ form, clients, isLoadingClients, initialClientId }: {
  form: ReturnType<typeof useForm<FormValues>>; clients: unknown; isLoadingClients: boolean; initialClientId?: number
}) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-muted-foreground">Job Details</h4>
      <JobReferenceField form={form} />
      {!initialClientId && (
        <FormField control={form.control} name="client_id" render={({ field }) => (
          <ClientSelectField field={field} clients={clients as { id: number; name: string }[]} isLoading={isLoadingClients} label="Instructing Client" tooltip="The primary client who is instructing this work. For joint instructions, you can add a secondary client below." />
        )} />
      )}
      <JointInstructionToggle form={form} />
      {form.watch("is_joint") && (
        <FormField control={form.control} name="secondary_client_id" render={({ field }) => (
          <ClientSelectField field={field} clients={clients as { id: number; name: string }[]} isLoading={isLoadingClients} label="Secondary Client" tooltip="The second party in a joint instruction, such as a co-owner, buyer, or trustee." excludeClientId={form.watch("client_id")} />
        )} />
      )}
      <StatusAndAddressFields form={form} />
    </div>
  )
}

function JobReferenceField({ form }: { form: ReturnType<typeof useForm<FormValues>> }) {
  return (
    <FormField control={form.control} name="name" render={({ field }) => (
      <FormItem>
        <div className="flex items-center gap-2">
          <FormLabel>Job Reference</FormLabel>
          <InfoTooltip content="A short, descriptive name for this job. Example: 'Smith Residence Survey' or 'Oak Street Development'" />
        </div>
        <FormControl><Input placeholder="e.g. Smith Residence Survey" {...field} /></FormControl>
        <FormDescription>This helps identify the job. A unique job number will be generated automatically.</FormDescription>
        <FormMessage />
      </FormItem>
    )} />
  )
}

function JointInstructionToggle({ form }: { form: ReturnType<typeof useForm<FormValues>> }) {
  return (
    <FormField control={form.control} name="is_joint" render={({ field }) => (
      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <FormLabel className="text-sm font-medium">Joint Instruction</FormLabel>
          </div>
          <FormDescription className="text-xs">Enable if this job involves two clients (e.g., buyer and seller, trustees)</FormDescription>
        </div>
        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
      </FormItem>
    )} />
  )
}

function StatusAndAddressFields({ form }: { form: ReturnType<typeof useForm<FormValues>> }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <FormField control={form.control} name="status" render={({ field }) => (
          <FormItem>
            <FormLabel>Job Status</FormLabel>
            <Select onValueChange={field.onChange} value={field.value ?? ""}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
              <SelectContent>
                {Object.values(JobStatus).map((status) => <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>)}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
      </div>
      <FormField control={form.control} name="address" render={({ field }) => (
        <FormItem>
          <div className="flex items-center gap-2">
            <FormLabel>Site Address</FormLabel>
            <InfoTooltip content="The physical address where the survey or work will take place. This can be different from the client's address." />
          </div>
          <FormControl><Textarea placeholder={"Enter the full site address...\ne.g. 123 Main Street\nLondon\nSW1A 1AA"} className="resize-none" rows={2} {...field} /></FormControl>
          <FormMessage />
        </FormItem>
      )} />
    </>
  )
}

function InstructionSection({ form, instructionTypes, isLoadingTypes }: {
  form: ReturnType<typeof useForm<FormValues>>; instructionTypes: unknown; isLoadingTypes: boolean
}) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-muted-foreground">First Instruction</h4>
      <FormField control={form.control} name="instruction_type_id" render={({ field }) => (
        <InstructionTypeField field={field} instructionTypes={instructionTypes as { id: number; name: string }[]} isLoading={isLoadingTypes} />
      )} />
    </div>
  )
}
