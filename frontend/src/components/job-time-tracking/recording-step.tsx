"use client"

import { Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const SECONDS_PER_HOUR = 3600
const SECONDS_PER_MINUTE = 60

function formatTime(seconds: number) {
  const hrs = Math.floor(seconds / SECONDS_PER_HOUR)
  const mins = Math.floor((seconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE)
  const secs = seconds % SECONDS_PER_MINUTE
  return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

interface RecordingStepProps {
  instructionName: string
  elapsedSeconds: number
  description: string
  onDescriptionChange: (v: string) => void
  isStopping: boolean
  onStop: () => void
}

export function RecordingStep(props: RecordingStepProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </div>
          Recording Time
        </DialogTitle>
        <DialogDescription>{props.instructionName}</DialogDescription>
      </DialogHeader>
      <div className="py-6 space-y-6">
        <div className="text-center">
          <div className="text-5xl font-mono font-bold tabular-nums">{formatTime(props.elapsedSeconds)}</div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="recording-description">Description</Label>
          <Textarea id="recording-description" value={props.description} onChange={(e) => props.onDescriptionChange(e.target.value)} placeholder="What are you working on?" className="resize-none" rows={2} />
        </div>
        <Button size="lg" variant="destructive" onClick={props.onStop} disabled={props.isStopping} className="w-full gap-2">
          <Square className="h-4 w-4 fill-current" />Stop Recording
        </Button>
      </div>
    </>
  )
}
