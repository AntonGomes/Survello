"use client"

import { useState } from "react"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { format, differenceInDays } from "date-fns"
import { Calendar, Clock, ChevronRight, Timer } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { updateInstructionMutation, readJobOptions, getInstructionTimeEntriesOptions } from "@/client/@tanstack/react-query.gen"
import { InstructionStatus, type InstructionReadWithInstructionType } from "@/client/types.gen"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

import { CardHeaderContent } from "./card-header"

const MINUTES_PER_HOUR = 60
const MAX_VISIBLE_ENTRIES = 5

interface InstructionCardProps {
  instruction: InstructionReadWithInstructionType
  jobId: number
  onRecordTime: (instructionId: number) => void
}

export function InstructionCard({ instruction, jobId, onRecordTime }: InstructionCardProps) {
  const queryClient = useQueryClient()
  const [isExpanded, setIsExpanded] = useState(false)
  const [deadlineCalendarOpen, setDeadlineCalendarOpen] = useState(false)

  const currentStatus = instruction.status || "planned"
  const displayName = instruction.instruction_type?.name || "Instruction"
  const daysUntilDeadline = instruction.deadline ? differenceInDays(new Date(instruction.deadline), new Date()) : null
  const isOverdue = daysUntilDeadline !== null && daysUntilDeadline < 0

  const { data: timeEntries = [] } = useQuery({ ...getInstructionTimeEntriesOptions({ path: { instruction_id: instruction.id } }), enabled: isExpanded })
  const totalMinutes = timeEntries.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0)
  const totalHours = totalMinutes / MINUTES_PER_HOUR

  const { mutate: updateInstruction } = useMutation({
    ...updateInstructionMutation(),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: readJobOptions({ path: { job_id: jobId } }).queryKey }) },
    onError: () => { toast.error("Failed to update instruction") },
  })

  const handleStatusChange = (newStatus: InstructionStatus) => {
    updateInstruction({ path: { instruction_id: instruction.id }, body: { status: newStatus } })
    toast.success(`Status updated to ${newStatus}`)
  }

  const handleDeadlineChange = (date: Date | undefined) => {
    updateInstruction({ path: { instruction_id: instruction.id }, body: { deadline: date ? format(date, "yyyy-MM-dd") : null } })
    setDeadlineCalendarOpen(false)
    toast.success(date ? `Deadline set to ${format(date, "d MMM yyyy")}` : "Deadline removed")
  }

  const handleSaveDescription = (desc: string) => {
    updateInstruction({ path: { instruction_id: instruction.id }, body: { description: desc } })
  }

  return (
    <Card className="overflow-hidden border-l-4 border-l-muted-foreground/20 transition-all duration-200 hover:shadow-md hover:border-primary/30">
      <CardHeader className="pb-3">
        <CardHeaderContent instruction={instruction} jobId={jobId} displayName={displayName} currentStatus={currentStatus} onStatusChange={handleStatusChange} onSaveDescription={handleSaveDescription} />
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <ActionBar instruction={instruction} daysUntilDeadline={daysUntilDeadline} isOverdue={isOverdue} totalMinutes={totalMinutes} totalHours={totalHours} deadlineCalendarOpen={deadlineCalendarOpen} setDeadlineCalendarOpen={setDeadlineCalendarOpen} onDeadlineChange={handleDeadlineChange} onRecordTime={() => onRecordTime(instruction.id)} />
        <TimeEntriesCollapsible isExpanded={isExpanded} setIsExpanded={setIsExpanded} timeEntries={timeEntries} />
      </CardContent>
    </Card>
  )
}

function ActionBar({ instruction, daysUntilDeadline, isOverdue, totalMinutes, totalHours, deadlineCalendarOpen, setDeadlineCalendarOpen, onDeadlineChange, onRecordTime }: {
  instruction: InstructionReadWithInstructionType; daysUntilDeadline: number | null; isOverdue: boolean
  totalMinutes: number; totalHours: number; deadlineCalendarOpen: boolean
  setDeadlineCalendarOpen: (v: boolean) => void; onDeadlineChange: (d: Date | undefined) => void; onRecordTime: () => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
      <DeadlinePicker instruction={instruction} daysUntilDeadline={daysUntilDeadline} isOverdue={isOverdue} open={deadlineCalendarOpen} onOpenChange={setDeadlineCalendarOpen} onSelect={onDeadlineChange} />
      <Button variant="ghost" size="sm" className="h-7 px-2 gap-1" onClick={onRecordTime}><Timer className="h-3.5 w-3.5" /><span>Record Time</span></Button>
      {totalMinutes > 0 && <div className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /><span>{totalHours.toFixed(1)}h tracked</span></div>}
    </div>
  )
}

function DeadlinePicker({ instruction, daysUntilDeadline, isOverdue, open, onOpenChange, onSelect }: {
  instruction: InstructionReadWithInstructionType; daysUntilDeadline: number | null; isOverdue: boolean
  open: boolean; onOpenChange: (v: boolean) => void; onSelect: (d: Date | undefined) => void
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className={cn("h-7 px-2 gap-1", isOverdue && "text-red-600")}>
          <Calendar className="h-3.5 w-3.5" />
          {instruction.deadline ? (
            <span>{format(new Date(instruction.deadline), "d MMM yyyy")}{daysUntilDeadline !== null && <span className="ml-1 text-xs">({isOverdue ? `${Math.abs(daysUntilDeadline)}d overdue` : `${daysUntilDeadline}d`})</span>}</span>
          ) : <span>Set deadline</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <CalendarComponent mode="single" selected={instruction.deadline ? new Date(instruction.deadline) : undefined} onSelect={onSelect} initialFocus />
        {instruction.deadline && <div className="p-2 border-t"><Button variant="ghost" size="sm" className="w-full text-muted-foreground" onClick={() => onSelect(undefined)}>Remove deadline</Button></div>}
      </PopoverContent>
    </Popover>
  )
}

function TimeEntriesCollapsible({ isExpanded, setIsExpanded, timeEntries }: {
  isExpanded: boolean; setIsExpanded: (v: boolean) => void
  timeEntries: Array<{ id: number; start_time?: string | null; duration_minutes?: number | null; description?: string | null }>
}) {
  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2 -ml-2 text-muted-foreground">
          <ChevronRight className={cn("h-3.5 w-3.5 mr-1 transition-transform", isExpanded && "rotate-90")} />
          {timeEntries.length > 0 ? `${timeEntries.length} time entries` : "No time entries"}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        {timeEntries.length > 0 ? (
          <div className="space-y-2 pl-4 border-l-2 border-muted">
            {timeEntries.slice(0, MAX_VISIBLE_ENTRIES).map((entry) => (
              <div key={entry.id} className="text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{entry.start_time ? format(new Date(entry.start_time), "d MMM yyyy, HH:mm") : "\u2014"}</span>
                  <span className="font-medium">{entry.duration_minutes ? `${Math.floor(entry.duration_minutes / MINUTES_PER_HOUR)}h ${entry.duration_minutes % MINUTES_PER_HOUR}m` : "In progress"}</span>
                </div>
                {entry.description && <p className="text-muted-foreground text-xs mt-0.5">{entry.description}</p>}
              </div>
            ))}
            {timeEntries.length > MAX_VISIBLE_ENTRIES && <p className="text-xs text-muted-foreground">+{timeEntries.length - MAX_VISIBLE_ENTRIES} more entries</p>}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground pl-4">No time has been recorded yet.</p>
        )}
      </CollapsibleContent>
    </Collapsible>
  )
}
