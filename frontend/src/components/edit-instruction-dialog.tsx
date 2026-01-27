"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { Loader2, Settings2, CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

import { 
  updateInstructionMutation, 
  readJobOptions,
  readInstructionTypesOptions,
} from "@/client/@tanstack/react-query.gen"
import { FeeType, InstructionStatus, type InstructionReadWithInstructionType } from "@/client/types.gen"
import { toast } from "sonner"

const formSchema = z.object({
  name: z.string().min(2, "Instruction name must be at least 2 characters"),
  description: z.string().optional().or(z.literal("")),
  status: z.nativeEnum(InstructionStatus),
  fee_type: z.nativeEnum(FeeType),
  rate: z.number().min(0).optional(),
  forecasted_billable_hours: z.number().min(0).optional(),
  contingency_percentage: z.number().min(0).max(100).optional(),
  deadline: z.date().optional().nullable(),
})

interface EditInstructionDialogProps {
  instruction: InstructionReadWithInstructionType
  jobId: number
  trigger?: React.ReactNode
}

export function EditInstructionDialog({ instruction, jobId, trigger }: EditInstructionDialogProps) {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: instructionTypes } = useQuery({
    ...readInstructionTypesOptions(),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: instruction.name,
      description: instruction.description || "",
      status: instruction.status || InstructionStatus.PLANNED,
      fee_type: instruction.fee_type || FeeType.FIXED,
      rate: instruction.rate || 0,
      forecasted_billable_hours: instruction.forecasted_billable_hours || 0,
      contingency_percentage: instruction.contingency_percentage || 0,
      deadline: instruction.deadline ? new Date(instruction.deadline) : null,
    },
  })

  // Reset form when dialog opens with fresh instruction data
  useEffect(() => {
    if (open) {
      form.reset({
        name: instruction.name,
        description: instruction.description || "",
        status: instruction.status || InstructionStatus.PLANNED,
        fee_type: instruction.fee_type || FeeType.FIXED,
        rate: instruction.rate || 0,
        forecasted_billable_hours: instruction.forecasted_billable_hours || 0,
        contingency_percentage: instruction.contingency_percentage || 0,
        deadline: instruction.deadline ? new Date(instruction.deadline) : null,
      })
    }
  }, [open, instruction, form])

  const { mutate: updateInstruction, isPending } = useMutation({
    ...updateInstructionMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: readJobOptions({ path: { job_id: jobId } }).queryKey,
      })
      toast.success("Instruction updated")
      setOpen(false)
    },
    onError: () => {
      toast.error("Failed to update instruction")
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateInstruction({
      path: { instruction_id: instruction.id },
      body: {
        name: values.name,
        description: values.description || null,
        status: values.status,
        fee_type: values.fee_type,
        rate: values.rate,
        forecasted_billable_hours: values.forecasted_billable_hours,
        contingency_percentage: values.contingency_percentage,
        deadline: values.deadline ? format(values.deadline, "yyyy-MM-dd") : null,
      },
    })
  }

  const showRateField = form.watch("fee_type") === FeeType.HOURLY || form.watch("fee_type") === FeeType.MIXED
  const showHoursField = form.watch("fee_type") === FeeType.HOURLY || form.watch("fee_type") === FeeType.MIXED
  const showContingency = form.watch("fee_type") === FeeType.MIXED

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings2 className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Instruction</DialogTitle>
          <DialogDescription>
            Update instruction details. {instruction.instruction_type?.name && `Type: ${instruction.instruction_type.name}`}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instruction Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      rows={3}
                      placeholder="Add an instruction description..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(InstructionStatus).map((status) => (
                          <SelectItem key={status} value={status} className="capitalize">
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Deadline */}
              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deadline</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "d MMM yyyy") : "Set deadline"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Fee Type */}
            <FormField
              control={form.control}
              name="fee_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fee Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={FeeType.FIXED}>Fixed Fee</SelectItem>
                      <SelectItem value={FeeType.HOURLY}>Hourly</SelectItem>
                      <SelectItem value={FeeType.MIXED}>Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(showRateField || showHoursField) && (
              <div className="grid grid-cols-2 gap-4">
                {showRateField && (
                  <FormField
                    control={form.control}
                    name="rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hourly Rate (£)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {showHoursField && (
                  <FormField
                    control={form.control}
                    name="forecasted_billable_hours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Forecasted Hours</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.5"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}

            {showContingency && (
              <FormField
                control={form.control}
                name="contingency_percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contingency (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="1"
                        max="100"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
