"use client"

import { Timer, Briefcase, Camera } from "lucide-react"

import { Button } from "@/components/ui/button"
import { CreateInstructionDialog } from "@/components/create-instruction-dialog"
import { CreateSurveyDialog } from "@/components/create-survey-dialog"
import { cn } from "@/lib/utils"

interface QuickActionsProps {
  jobId: number
  hasActiveTimer: boolean
  onOpenTimeModal: () => void
}

export function QuickActions({ jobId, hasActiveTimer, onOpenTimeModal }: QuickActionsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <TimerButton hasActiveTimer={hasActiveTimer} onClick={onOpenTimeModal} />
      <CreateInstructionDialog
        jobId={jobId}
        trigger={
          <Button variant="outline" size="lg" className="h-auto py-4 flex-col gap-2 w-full">
            <Briefcase className="h-5 w-5" /><span className="text-sm font-medium">New Instruction</span>
          </Button>
        }
      />
      <CreateSurveyDialog
        jobId={jobId}
        trigger={
          <Button variant="outline" size="lg" className="h-auto py-4 flex-col gap-2 w-full">
            <Camera className="h-5 w-5" /><span className="text-sm font-medium">New Survey</span>
          </Button>
        }
      />
    </div>
  )
}

function TimerButton({ hasActiveTimer, onClick }: { hasActiveTimer: boolean; onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      size="lg"
      className={cn(
        "h-auto py-4 flex-col gap-2 transition-all border-2",
        hasActiveTimer
          ? "bg-red-50 hover:bg-red-100 text-red-700 border-red-300"
          : "bg-red-50/50 hover:bg-red-100 text-red-600 border-red-300"
      )}
    >
      {hasActiveTimer ? (
        <>
          <div className="relative flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500"></span>
          </div>
          <span className="text-sm font-medium">Recording...</span>
        </>
      ) : (
        <><Timer className="h-5 w-5" /><span className="text-sm font-medium">Record Time</span></>
      )}
    </Button>
  )
}
