"use client"

import { Circle, Clock, Timer, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { type InstructionReadWithInstructionType } from "@/client"

export function getInstructionDisplayName(instruction: InstructionReadWithInstructionType | undefined | null) {
  if (!instruction) return "Instruction"
  return instruction.instruction_type?.name || "Instruction"
}

interface SelectInstructionStepProps {
  instructions: InstructionReadWithInstructionType[]
  selectedInstructionId: string
  onInstructionSelect: (id: string) => void
  selectedInstruction: InstructionReadWithInstructionType | null | undefined
  timerOnDifferentJob: boolean
  description: string
  onDescriptionChange: (v: string) => void
  activeTab: string
  onActiveTabChange: (v: string) => void
  manualHours: string
  onManualHoursChange: (v: string) => void
  manualMinutes: string
  onManualMinutesChange: (v: string) => void
  manualDescription: string
  onManualDescriptionChange: (v: string) => void
  isStarting: boolean
  isLoggingManually: boolean
  onStartRecording: () => void
  onManualSubmit: () => void
}

export function SelectInstructionStep(props: SelectInstructionStepProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Timer className="h-5 w-5" />Log Time
        </DialogTitle>
        <DialogDescription>Select an instruction and track your time</DialogDescription>
      </DialogHeader>

      {props.timerOnDifferentJob ? (
        <TimerActiveWarning />
      ) : (
        <div className="space-y-4 py-4">
          <InstructionSelector
            instructions={props.instructions}
            value={props.selectedInstructionId}
            onValueChange={props.onInstructionSelect}
          />
          {props.selectedInstruction && (
            <TimerManualTabs
              activeTab={props.activeTab}
              onActiveTabChange={props.onActiveTabChange}
              description={props.description}
              onDescriptionChange={props.onDescriptionChange}
              manualHours={props.manualHours}
              onManualHoursChange={props.onManualHoursChange}
              manualMinutes={props.manualMinutes}
              onManualMinutesChange={props.onManualMinutesChange}
              manualDescription={props.manualDescription}
              onManualDescriptionChange={props.onManualDescriptionChange}
              isStarting={props.isStarting}
              isLoggingManually={props.isLoggingManually}
              selectedInstructionId={props.selectedInstructionId}
              onStartRecording={props.onStartRecording}
              onManualSubmit={props.onManualSubmit}
            />
          )}
        </div>
      )}
    </>
  )
}

function TimerActiveWarning() {
  return (
    <div className="py-4 text-center">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Timer Active</AlertTitle>
        <AlertDescription>
          You have an active timer running for another job. Please stop it first using the header controls.
        </AlertDescription>
      </Alert>
    </div>
  )
}

function InstructionSelector({ instructions, value, onValueChange }: {
  instructions: InstructionReadWithInstructionType[]
  value: string
  onValueChange: (v: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label>Instruction</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger><SelectValue placeholder="Select an instruction..." /></SelectTrigger>
        <SelectContent>
          {instructions.map((instruction) => (
            <SelectItem key={instruction.id} value={instruction.id.toString()}>
              <div className="flex items-center gap-2">
                <span>{getInstructionDisplayName(instruction)}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

interface TimerManualTabsProps {
  activeTab: string
  onActiveTabChange: (v: string) => void
  description: string
  onDescriptionChange: (v: string) => void
  manualHours: string
  onManualHoursChange: (v: string) => void
  manualMinutes: string
  onManualMinutesChange: (v: string) => void
  manualDescription: string
  onManualDescriptionChange: (v: string) => void
  isStarting: boolean
  isLoggingManually: boolean
  selectedInstructionId: string
  onStartRecording: () => void
  onManualSubmit: () => void
}

function TimerManualTabs(props: TimerManualTabsProps) {
  return (
    <Tabs value={props.activeTab} onValueChange={props.onActiveTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="timer">Timer</TabsTrigger>
        <TabsTrigger value="manual">Manual Entry</TabsTrigger>
      </TabsList>
      <TabsContent value="timer" className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label htmlFor="timer-description">What are you working on?</Label>
          <Textarea id="timer-description" value={props.description} onChange={(e) => props.onDescriptionChange(e.target.value)} placeholder="Describe your work..." className="resize-none" rows={2} />
        </div>
        <Button size="lg" onClick={props.onStartRecording} disabled={props.isStarting || !props.selectedInstructionId} className="w-full bg-green-600 hover:bg-green-700 text-white gap-2">
          <Circle className="h-4 w-4 fill-current" />Start Recording
        </Button>
      </TabsContent>
      <TabsContent value="manual" className="space-y-4 pt-4">
        <ManualDurationInput hours={props.manualHours} onHoursChange={props.onManualHoursChange} minutes={props.manualMinutes} onMinutesChange={props.onManualMinutesChange} />
        <div className="space-y-2">
          <Label htmlFor="manual-description">What did you work on?</Label>
          <Textarea id="manual-description" value={props.manualDescription} onChange={(e) => props.onManualDescriptionChange(e.target.value)} placeholder="Describe your work..." className="resize-none" rows={2} />
        </div>
        <Button onClick={props.onManualSubmit} disabled={props.isLoggingManually || !props.selectedInstructionId} className="w-full gap-2">
          <Clock className="h-4 w-4" />Log Time
        </Button>
      </TabsContent>
    </Tabs>
  )
}

function ManualDurationInput({ hours, onHoursChange, minutes, onMinutesChange }: {
  hours: string; onHoursChange: (v: string) => void
  minutes: string; onMinutesChange: (v: string) => void
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
