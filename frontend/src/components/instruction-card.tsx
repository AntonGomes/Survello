"use client"

import { useState } from "react"
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import { format, differenceInDays } from "date-fns"
import {
  Calendar,
  Clock,
  ChevronRight,
  Settings2,
  Timer,
  Check,
  X,
  Pencil,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EditInstructionDialog } from "@/components/edit-instruction-dialog"

import { 
  updateInstructionMutation,
  readJobOptions,
  getInstructionTimeEntriesOptions,
} from "@/client/@tanstack/react-query.gen"
import { InstructionStatus, type InstructionReadWithInstructionType } from "@/client/types.gen"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface InstructionCardProps {
  instruction: InstructionReadWithInstructionType
  jobId: number
  isAdmin: boolean
  onRecordTime: (instructionId: number) => void
}

const statusStyles: Record<string, string> = {
  planned: "bg-slate-100 text-slate-700",
  active: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  archived: "bg-gray-100 text-gray-700",
}

export function InstructionCard({ instruction, jobId, isAdmin, onRecordTime }: InstructionCardProps) {
  const queryClient = useQueryClient()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [editedDescription, setEditedDescription] = useState(instruction.description || "")
  const [deadlineCalendarOpen, setDeadlineCalendarOpen] = useState(false)

  const currentStatus = instruction.status || "planned"
  
  // Get display name from instruction type
  const displayName = instruction.instruction_type?.name || "Instruction"
  
  // Calculate deadline info
  const daysUntilDeadline = instruction.deadline 
    ? differenceInDays(new Date(instruction.deadline), new Date()) 
    : null
  const isOverdue = daysUntilDeadline !== null && daysUntilDeadline < 0

  // Fetch time entries when expanded
  const { data: timeEntries = [] } = useQuery({
    ...getInstructionTimeEntriesOptions({ path: { instruction_id: instruction.id } }),
    enabled: isExpanded,
  })

  // Calculate total hours from time entries
  const totalMinutes = timeEntries.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0)
  const totalHours = totalMinutes / 60

  const { mutate: updateInstruction } = useMutation({
    ...updateInstructionMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: readJobOptions({ path: { job_id: jobId } }).queryKey,
      })
      setIsEditingDescription(false)
    },
    onError: () => {
      toast.error("Failed to update instruction")
    },
  })

  const handleStatusChange = (newStatus: InstructionStatus) => {
    updateInstruction({
      path: { instruction_id: instruction.id },
      body: { status: newStatus },
    })
    toast.success(`Status updated to ${newStatus}`)
  }

  const handleDeadlineChange = (date: Date | undefined) => {
    updateInstruction({
      path: { instruction_id: instruction.id },
      body: { deadline: date ? format(date, "yyyy-MM-dd") : null },
    })
    setDeadlineCalendarOpen(false)
    if (date) {
      toast.success(`Deadline set to ${format(date, "d MMM yyyy")}`)
    } else {
      toast.success("Deadline removed")
    }
  }

  const handleSaveDescription = () => {
    updateInstruction({
      path: { instruction_id: instruction.id },
      body: { description: editedDescription },
    })
  }

  return (
    <Card className="overflow-hidden border-l-4 border-l-muted-foreground/20 transition-all duration-200 hover:shadow-md hover:border-primary/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              {instruction.instruction_number && (
                <Badge variant="outline" className="text-xs font-mono shrink-0">
                  {instruction.instruction_number}
                </Badge>
              )}
              <CardTitle className="text-lg font-medium truncate">
                {displayName}
              </CardTitle>
            </div>
            
            {/* Inline-editable description */}
            {isEditingDescription ? (
              <div className="flex gap-2 items-start mt-2">
                <Textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className="min-h-[60px] text-sm"
                  placeholder="Add a description..."
                  autoFocus
                />
                <div className="flex flex-col gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-green-600"
                    onClick={handleSaveDescription}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-muted-foreground"
                    onClick={() => {
                      setIsEditingDescription(false)
                      setEditedDescription(instruction.description || "")
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                className="group flex items-start gap-2 cursor-pointer"
                onClick={() => {
                  setEditedDescription(instruction.description || "")
                  setIsEditingDescription(true)
                }}
              >
                <CardDescription className="line-clamp-2 flex-1">
                  {instruction.description || "Click to add description..."}
                </CardDescription>
                <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {/* Status Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn("gap-1 h-7 px-2 capitalize", statusStyles[currentStatus])}
                >
                  {currentStatus}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {Object.values(InstructionStatus).map((status) => (
                  <DropdownMenuItem 
                    key={status} 
                    onClick={() => handleStatusChange(status)}
                    className="capitalize"
                  >
                    {status}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Settings/Edit Menu */}
            <EditInstructionDialog 
              instruction={instruction} 
              jobId={jobId}
              trigger={
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Settings2 className="h-4 w-4" />
                </Button>
              }
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {/* Quick Stats Row */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {/* Deadline */}
          <Popover open={deadlineCalendarOpen} onOpenChange={setDeadlineCalendarOpen}>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  "h-7 px-2 gap-1",
                  isOverdue && "text-red-600"
                )}
              >
                <Calendar className="h-3.5 w-3.5" />
                {instruction.deadline ? (
                  <span>
                    {format(new Date(instruction.deadline), "d MMM yyyy")}
                    {daysUntilDeadline !== null && (
                      <span className="ml-1 text-xs">
                        ({isOverdue ? `${Math.abs(daysUntilDeadline)}d overdue` : `${daysUntilDeadline}d`})
                      </span>
                    )}
                  </span>
                ) : (
                  <span>Set deadline</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={instruction.deadline ? new Date(instruction.deadline) : undefined}
                onSelect={handleDeadlineChange}
                initialFocus
              />
              {instruction.deadline && (
                <div className="p-2 border-t">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-muted-foreground"
                    onClick={() => handleDeadlineChange(undefined)}
                  >
                    Remove deadline
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
          
          {/* Record Time Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 gap-1"
            onClick={() => onRecordTime(instruction.id)}
          >
            <Timer className="h-3.5 w-3.5" />
            <span>Record Time</span>
          </Button>

          {/* Hours tracked */}
          {totalMinutes > 0 && (
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{totalHours.toFixed(1)}h tracked</span>
            </div>
          )}
        </div>

        {/* Expandable Time Entries Section */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2 -ml-2 text-muted-foreground">
              <ChevronRight className={cn(
                "h-3.5 w-3.5 mr-1 transition-transform",
                isExpanded && "rotate-90"
              )} />
              {timeEntries.length > 0 ? `${timeEntries.length} time entries` : "No time entries"}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            {timeEntries.length > 0 ? (
              <div className="space-y-2 pl-4 border-l-2 border-muted">
                {timeEntries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {entry.start_time ? format(new Date(entry.start_time), "d MMM yyyy, HH:mm") : "—"}
                      </span>
                      <span className="font-medium">
                        {entry.duration_minutes ? `${Math.floor(entry.duration_minutes / 60)}h ${entry.duration_minutes % 60}m` : "In progress"}
                      </span>
                    </div>
                    {entry.description && (
                      <p className="text-muted-foreground text-xs mt-0.5">{entry.description}</p>
                    )}
                  </div>
                ))}
                {timeEntries.length > 5 && (
                  <p className="text-xs text-muted-foreground">
                    +{timeEntries.length - 5} more entries
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground pl-4">
                No time has been recorded yet.
              </p>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}
