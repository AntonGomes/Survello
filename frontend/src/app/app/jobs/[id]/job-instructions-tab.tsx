"use client"

import { useMemo, useState } from "react"
import { Briefcase } from "lucide-react"

import { type InstructionReadWithInstructionType } from "@/client/types.gen"
import { CreateInstructionDialog } from "@/components/create-instruction-dialog"
import { InstructionCard } from "@/components/instruction-card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface InstructionsTabProps {
  jobId: number
  instructions: InstructionReadWithInstructionType[]

  onRecordTime: (instructionId?: number) => void
}

function EmptyInstructionsState({ jobId }: { jobId: number }) {
  return (
    <div className="rounded-lg border border-dashed p-12 text-center">
      <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
      <h3 className="font-medium mb-1">No instructions yet</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Create your first instruction for this job.
      </p>
      <CreateInstructionDialog jobId={jobId} />
    </div>
  )
}

export function InstructionsTab({ jobId, instructions, onRecordTime }: InstructionsTabProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredInstructions = useMemo(() => {
    if (statusFilter === "all") return instructions
    return instructions.filter(p => (p.status ?? "planned") === statusFilter)
  }, [instructions, statusFilter])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">All Instructions</h3>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CreateInstructionDialog jobId={jobId} />
      </div>

      {filteredInstructions.length > 0 ? (
        <div className="space-y-4 lg:max-h-[calc(100vh-280px)] lg:overflow-y-auto lg:pr-2">
          {filteredInstructions.map((instruction) => (
            <InstructionCard
              key={instruction.id}
              instruction={instruction}
              jobId={jobId}
              onRecordTime={onRecordTime}
            />
          ))}
        </div>
      ) : instructions.length > 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">No instructions match the selected filter.</p>
        </div>
      ) : (
        <EmptyInstructionsState jobId={jobId} />
      )}
    </div>
  )
}
