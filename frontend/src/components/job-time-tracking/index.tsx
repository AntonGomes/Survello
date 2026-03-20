"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { type InstructionReadWithInstructionType } from "@/client"
import { toast } from "sonner"

import { useTimeTrackingState } from "./use-time-tracking"
import { SelectInstructionStep, getInstructionDisplayName } from "./select-instruction-step"
import { RecordingStep } from "./recording-step"
import { CollaboratorsStep } from "./collaborators-step"

const MINUTES_PER_HOUR = 60

interface JobTimeTrackingModalProps {
  jobId: number
  instructions: InstructionReadWithInstructionType[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onTimeLogged?: (opts: { instructionName: string; description: string; durationMinutes: number; collaboratorNames?: string[] }) => void
  defaultInstructionId?: number
}

function useModalActions(props: JobTimeTrackingModalProps, state: ReturnType<typeof useTimeTrackingState>) {
  const resetAndClose = () => {
    state.setStep("select-instruction"); state.setSelectedInstructionId(""); state.setDescription("")
    state.setManualHours(""); state.setManualMinutes(""); state.setManualDescription(""); state.setSelectedCollaborators([])
    props.onOpenChange(false)
  }

  const finishAndClose = (collaboratorNames?: string[]) => {
    const name = getInstructionDisplayName(props.instructions.find(p => p.id === state.stoppedInstructionId))
    toast.success(`Logged ${state.stoppedDuration} minutes`)
    props.onTimeLogged?.({ instructionName: name, description: state.stoppedDescription, durationMinutes: state.stoppedDuration, collaboratorNames })
    resetAndClose()
  }

  const handleStartRecording = () => {
    if (!state.selectedInstruction) { toast.error("Please select an instruction first"); return }
    state.startTimer({ body: { instruction_id: state.selectedInstruction.id, description: state.description || undefined } })
  }

  const handleStopRecording = () => { state.stopTimer({ query: { description: state.description || undefined } }) }

  const handleManualSubmit = () => {
    if (!state.selectedInstruction) { toast.error("Please select an instruction first"); return }
    const totalMinutes = parseInt(state.manualHours || "0") * MINUTES_PER_HOUR + parseInt(state.manualMinutes || "0")
    if (totalMinutes <= 0) { toast.error("Please enter a valid duration"); return }
    state.logManually({ body: { instruction_id: state.selectedInstruction.id, duration_minutes: totalMinutes, description: state.manualDescription || undefined } })
  }

  const handleFinishWithCollaborators = async () => {
    if (state.selectedCollaborators.length > 0 && state.stoppedInstructionId) {
      state.selectedCollaborators.forEach(() => {
        state.logCollaboratorTime({ body: { instruction_id: state.stoppedInstructionId!, duration_minutes: state.stoppedDuration, description: state.stoppedDescription ? `${state.stoppedDescription} (with collaborators)` : "Collaborative work" } })
      })
    }
    const names = state.org?.users?.filter(u => state.selectedCollaborators.includes(u.id)).map(u => u.name || u.email) || []
    finishAndClose(names.length > 0 ? names : undefined)
  }

  const toggleCollaborator = (userId: number) => {
    state.setSelectedCollaborators(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId])
  }

  return { handleStartRecording, handleStopRecording, handleManualSubmit, handleFinishWithCollaborators, toggleCollaborator, finishAndClose }
}

export function JobTimeTrackingModal(props: JobTimeTrackingModalProps) {
  const state = useTimeTrackingState(props)
  const actions = useModalActions(props, state)

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {state.step === "select-instruction" && (
          <SelectInstructionStep instructions={props.instructions} selectedInstructionId={state.selectedInstructionId} onInstructionSelect={state.setSelectedInstructionId}
            selectedInstruction={state.selectedInstruction} timerOnDifferentJob={!!state.timerOnDifferentJob} description={state.description} onDescriptionChange={state.setDescription}
            activeTab={state.activeTab} onActiveTabChange={state.setActiveTab} manualHours={state.manualHours} onManualHoursChange={state.setManualHours}
            manualMinutes={state.manualMinutes} onManualMinutesChange={state.setManualMinutes} manualDescription={state.manualDescription} onManualDescriptionChange={state.setManualDescription}
            isStarting={state.isStarting} isLoggingManually={state.isLoggingManually} onStartRecording={actions.handleStartRecording} onManualSubmit={actions.handleManualSubmit} />
        )}
        {state.step === "recording" && (
          <RecordingStep instructionName={getInstructionDisplayName(state.selectedInstruction) || (state.activeTimer as { instruction_name?: string })?.instruction_name || ""}
            elapsedSeconds={state.elapsedSeconds} description={state.description} onDescriptionChange={state.setDescription} isStopping={state.isStopping} onStop={actions.handleStopRecording} />
        )}
        {state.step === "stopped-collaborators" && (
          <CollaboratorsStep stoppedDuration={state.stoppedDuration} stoppedDescription={state.stoppedDescription} orgUsers={state.org?.users || []}
            selectedCollaborators={state.selectedCollaborators} onToggleCollaborator={actions.toggleCollaborator} onFinish={actions.handleFinishWithCollaborators}
            onSkip={() => actions.finishAndClose()} isLogging={state.isLoggingCollaborator} />
        )}
      </DialogContent>
    </Dialog>
  )
}
