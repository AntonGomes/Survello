"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
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
} from "@/client/@tanstack/react-query.gen"
import { InstructionStatus, type InstructionReadWithInstructionType } from "@/client/types.gen"
import { toast } from "sonner"

const formSchema = z.object({
  description: z.string().optional().or(z.literal("")),
  status: z.nativeEnum(InstructionStatus),
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: instruction.description || "",
      status: instruction.status || InstructionStatus.PLANNED,
      deadline: instruction.deadline ? new Date(instruction.deadline) : null,
    },
  })

  // Reset form when dialog opens with fresh instruction data
  useEffect(() => {
    if (open) {
      form.reset({
        description: instruction.description || "",
        status: instruction.status || InstructionStatus.PLANNED,
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
        description: values.description || null,
        status: values.status,
        deadline: values.deadline ? format(values.deadline, "yyyy-MM-dd") : null,
      },
    })
  }

  // Get display name from instruction type
  const displayName = instruction.instruction_type?.name || "Instruction"

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
          <DialogTitle>Edit {displayName}</DialogTitle>
          <DialogDescription>
            Update instruction details
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={InstructionStatus.PLANNED}>Planned</SelectItem>
                        <SelectItem value={InstructionStatus.ACTIVE}>Active</SelectItem>
                        <SelectItem value={InstructionStatus.COMPLETED}>Completed</SelectItem>
                        <SelectItem value={InstructionStatus.ARCHIVED}>Archived</SelectItem>
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
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
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
