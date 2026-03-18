"use client"

import { Circle, Clock, Square, Timer } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useTimeTrackingModal } from "./use-time-tracking-modal"

interface TimeTrackingModalProps {
  instructionId: number
  instructionName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onTimeLogged?: (description: string, durationMinutes: number, timeEntryId?: number) => void
}

export function TimeTrackingModal({ instructionId, instructionName, open, onOpenChange, onTimeLogged }: TimeTrackingModalProps) {
  const state = useTimeTrackingModal({ instructionId, open, onOpenChange, onTimeLogged })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Timer className="h-5 w-5" />Log Time</DialogTitle>
          <DialogDescription>Track time for <span className="font-medium">{instructionName}</span></DialogDescription>
        </DialogHeader>
        {state.timerOnDifferentInstruction ? (
          <div className="py-4 text-center"><p className="text-sm text-muted-foreground">You have an active timer running for another instruction. Please stop it first.</p></div>
        ) : (
          <Tabs defaultValue="timer" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="timer">Timer</TabsTrigger>
              <TabsTrigger value="manual" disabled={state.isRecording}>Manual Entry</TabsTrigger>
            </TabsList>
            <TabsContent value="timer" className="space-y-4 pt-4">
              <TimerDisplay elapsedSeconds={state.elapsedSeconds} isRecording={state.isRecording} formatTime={state.formatTime} />
              <DescriptionInput value={state.description} onChange={state.setDescription} id="timer-description" />
              <TimerControls isRecording={state.isRecording} isStarting={state.isStarting} isStopping={state.isStopping} onStart={state.handleStartRecording} onStop={state.handleStopRecording} />
            </TabsContent>
            <TabsContent value="manual" className="space-y-4 pt-4">
              <DurationInput hours={state.manualHours} minutes={state.manualMinutes} onHoursChange={state.setManualHours} onMinutesChange={state.setManualMinutes} />
              <DescriptionInput value={state.manualDescription} onChange={state.setManualDescription} id="manual-description" />
              <DialogFooter>
                <Button onClick={state.handleManualSubmit} disabled={state.isLoggingManually} className="w-full gap-2"><Clock className="h-4 w-4" />Log Time</Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}

function TimerDisplay({ elapsedSeconds, isRecording, formatTime }: { elapsedSeconds: number; isRecording: boolean; formatTime: (s: number) => string }) {
  return (
    <div className="text-center">
      <div className="text-4xl font-mono font-bold tabular-nums">{formatTime(elapsedSeconds)}</div>
      {isRecording && (
        <div className="flex items-center justify-center gap-2 mt-2 text-red-500">
          <Circle className="h-3 w-3 fill-current animate-pulse" /><span className="text-sm font-medium">Recording</span>
        </div>
      )}
    </div>
  )
}

function DescriptionInput({ value, onChange, id }: { value: string; onChange: (v: string) => void; id: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Description (optional)</Label>
      <Textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder="What are you working on?" className="resize-none" rows={2} />
    </div>
  )
}

function TimerControls({ isRecording, isStarting, isStopping, onStart, onStop }: {
  isRecording: boolean; isStarting: boolean; isStopping: boolean; onStart: () => void; onStop: () => void
}) {
  return (
    <div className="flex justify-center gap-4">
      {!isRecording ? (
        <Button size="lg" onClick={onStart} disabled={isStarting} className="bg-red-600 hover:bg-red-700 text-white gap-2"><Circle className="h-4 w-4 fill-current" />Start Recording</Button>
      ) : (
        <Button size="lg" variant="destructive" onClick={onStop} disabled={isStopping} className="gap-2"><Square className="h-4 w-4 fill-current" />Stop & Log Time</Button>
      )}
    </div>
  )
}

function DurationInput({ hours, minutes, onHoursChange, onMinutesChange }: {
  hours: string; minutes: string; onHoursChange: (v: string) => void; onMinutesChange: (v: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label>Duration</Label>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Input type="number" min="0" value={hours} onChange={(e) => onHoursChange(e.target.value)} placeholder="0" />
          <span className="text-xs text-muted-foreground">hours</span>
        </div>
        <span className="text-lg font-medium">:</span>
        <div className="flex-1">
          <Input type="number" min="0" max="59" value={minutes} onChange={(e) => onMinutesChange(e.target.value)} placeholder="0" />
          <span className="text-xs text-muted-foreground">minutes</span>
        </div>
      </div>
    </div>
  )
}
