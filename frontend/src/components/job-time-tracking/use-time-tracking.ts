"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { startTimerMutation, stopTimerMutation, logTimeManuallyMutation, getCurrentTimerOptions, readJobOptions, readOrgOptions } from "@/client/@tanstack/react-query.gen"
import { type InstructionReadWithInstructionType } from "@/client"
import { toast } from "sonner"

const MS_PER_SECOND = 1000
const MINUTES_PER_HOUR = 60

export type ModalStep = "select-instruction" | "recording" | "stopped-collaborators"

interface TimeTrackingOptions {
  jobId: number
  instructions: InstructionReadWithInstructionType[]
  open: boolean
  defaultInstructionId?: number
  onTimeLogged?: (opts: { instructionName: string; description: string; durationMinutes: number; collaboratorNames?: string[] }) => void
  onOpenChange: (open: boolean) => void
}

function useFormState(defaultInstructionId?: number) {
  const [step, setStep] = useState<ModalStep>("select-instruction")
  const [selectedInstructionId, setSelectedInstructionId] = useState<string>(defaultInstructionId ? defaultInstructionId.toString() : "")
  const [description, setDescription] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [manualHours, setManualHours] = useState("")
  const [manualMinutes, setManualMinutes] = useState("")
  const [manualDescription, setManualDescription] = useState("")
  const [activeTab, setActiveTab] = useState<string>("timer")
  const [selectedCollaborators, setSelectedCollaborators] = useState<number[]>([])
  const [stoppedDuration, setStoppedDuration] = useState(0)
  const [stoppedDescription, setStoppedDescription] = useState("")
  const [stoppedInstructionId, setStoppedInstructionId] = useState<number | null>(null)

  return {
    step, setStep, selectedInstructionId, setSelectedInstructionId, description, setDescription,
    isRecording, setIsRecording, elapsedSeconds, setElapsedSeconds, intervalRef,
    manualHours, setManualHours, manualMinutes, setManualMinutes, manualDescription, setManualDescription,
    activeTab, setActiveTab, selectedCollaborators, setSelectedCollaborators,
    stoppedDuration, setStoppedDuration, stoppedDescription, setStoppedDescription,
    stoppedInstructionId, setStoppedInstructionId,
  }
}

function useStartMutation(state: ReturnType<typeof useFormState>) {
  return useMutation({
    ...startTimerMutation(),
    onSuccess: () => { state.setIsRecording(true); state.setElapsedSeconds(0); state.setStep("recording"); toast.success("Timer started") },
    onError: () => { toast.error("Timer already running or failed to start. Please stop it first.") },
  })
}

function useStopMutation(state: ReturnType<typeof useFormState>, jobId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    ...stopTimerMutation(),
    onSuccess: (data) => {
      state.setIsRecording(false); state.setElapsedSeconds(0)
      state.setStoppedDuration(data.duration_minutes || 0)
      state.setStoppedDescription(state.description || data.description || "")
      state.setStoppedInstructionId(data.instruction_id || null)
      queryClient.invalidateQueries({ queryKey: getCurrentTimerOptions().queryKey })
      queryClient.invalidateQueries({ queryKey: readJobOptions({ path: { job_id: jobId } }).queryKey })
      state.setStep("stopped-collaborators")
    },
    onError: () => { toast.error("Failed to stop timer") },
  })
}

function useManualMutation(state: ReturnType<typeof useFormState>, jobId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    ...logTimeManuallyMutation(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: readJobOptions({ path: { job_id: jobId } }).queryKey })
      const totalMinutes = parseInt(state.manualHours || "0") * MINUTES_PER_HOUR + parseInt(state.manualMinutes || "0")
      state.setStoppedDuration(totalMinutes)
      state.setStoppedDescription(state.manualDescription)
      state.setStoppedInstructionId(data.instruction_id || null)
      state.setStep("stopped-collaborators")
    },
    onError: () => { toast.error("Failed to log time") },
  })
}

function useCollabMutation(jobId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    ...logTimeManuallyMutation(),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: readJobOptions({ path: { job_id: jobId } }).queryKey }) },
  })
}

export function useTimeTrackingState(opts: TimeTrackingOptions) {
  const state = useFormState(opts.defaultInstructionId)
  const { data: org } = useQuery({ ...readOrgOptions() })
  const { data: activeTimer } = useQuery({ ...getCurrentTimerOptions(), refetchInterval: state.isRecording ? MS_PER_SECOND : false })

  const selectedInstruction = useMemo(() => {
    if (!state.selectedInstructionId) return null
    return opts.instructions.find(p => p.id.toString() === state.selectedInstructionId)
  }, [state.selectedInstructionId, opts.instructions])

  const startMut = useStartMutation(state)
  const stopMut = useStopMutation(state, opts.jobId)
  const manualMut = useManualMutation(state, opts.jobId)
  const collabMut = useCollabMutation(opts.jobId)

  useTimerInterval({ isRecording: state.isRecording, intervalRef: state.intervalRef, setElapsedSeconds: state.setElapsedSeconds })
  useSyncActiveTimer({ activeTimer, instructions: opts.instructions, setIsRecording: state.setIsRecording, setSelectedInstructionId: state.setSelectedInstructionId, setStep: state.setStep, setElapsedSeconds: state.setElapsedSeconds })
  useResetOnClose({ open: opts.open, isRecording: state.isRecording, defaultInstructionId: opts.defaultInstructionId, setStep: state.setStep, setSelectedInstructionId: state.setSelectedInstructionId, setDescription: state.setDescription, setManualHours: state.setManualHours, setManualMinutes: state.setManualMinutes, setManualDescription: state.setManualDescription, setSelectedCollaborators: state.setSelectedCollaborators, setActiveTab: state.setActiveTab })

  const timerOnDifferentJob = activeTimer && !opts.instructions.some(p => p.id === activeTimer.instruction_id)

  return {
    ...state, org, activeTimer, selectedInstruction, timerOnDifferentJob,
    startTimer: startMut.mutate, stopTimer: stopMut.mutate, logManually: manualMut.mutate, logCollaboratorTime: collabMut.mutate,
    isStarting: startMut.isPending, isStopping: stopMut.isPending, isLoggingManually: manualMut.isPending, isLoggingCollaborator: collabMut.isPending,
  }
}

function useTimerInterval({ isRecording, intervalRef, setElapsedSeconds }: Pick<ReturnType<typeof useFormState>, "isRecording" | "intervalRef" | "setElapsedSeconds">) {
  useEffect(() => {
    if (isRecording) { intervalRef.current = setInterval(() => { setElapsedSeconds((prev: number) => prev + 1) }, MS_PER_SECOND) }
    else if (intervalRef.current) { clearInterval(intervalRef.current) }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isRecording, intervalRef, setElapsedSeconds])
}

function useSyncActiveTimer({ activeTimer, instructions, setIsRecording, setSelectedInstructionId, setStep, setElapsedSeconds }: {
  activeTimer: unknown; instructions: InstructionReadWithInstructionType[]
  setIsRecording: (v: boolean) => void; setSelectedInstructionId: (v: string) => void
  setStep: (v: ModalStep) => void; setElapsedSeconds: (v: number) => void
}) {
  useEffect(() => {
    const timer = activeTimer as { start_time?: string; instruction_id?: number } | undefined
    if (!timer?.start_time) return
    const isForThisJob = instructions.some(p => p.id === timer.instruction_id)
    if (!isForThisJob) return
    setIsRecording(true)
    setSelectedInstructionId(timer.instruction_id?.toString() || "")
    setStep("recording")
    setElapsedSeconds(Math.floor((Date.now() - new Date(timer.start_time).getTime()) / MS_PER_SECOND))
  }, [activeTimer, instructions, setIsRecording, setSelectedInstructionId, setStep, setElapsedSeconds])
}

function useResetOnClose({ open, isRecording, defaultInstructionId, setStep, setSelectedInstructionId, setDescription, setManualHours, setManualMinutes, setManualDescription, setSelectedCollaborators, setActiveTab }: {
  open: boolean; isRecording: boolean; defaultInstructionId?: number
  setStep: (v: ModalStep) => void; setSelectedInstructionId: (v: string) => void; setDescription: (v: string) => void
  setManualHours: (v: string) => void; setManualMinutes: (v: string) => void; setManualDescription: (v: string) => void
  setSelectedCollaborators: (v: number[]) => void; setActiveTab: (v: string) => void
}) {
  useEffect(() => {
    if (open || isRecording) return
    setStep("select-instruction")
    setSelectedInstructionId(defaultInstructionId ? defaultInstructionId.toString() : "")
    setDescription(""); setManualHours(""); setManualMinutes(""); setManualDescription("")
    setSelectedCollaborators([]); setActiveTab("timer")
  }, [open, isRecording, defaultInstructionId, setStep, setSelectedInstructionId, setDescription, setManualHours, setManualMinutes, setManualDescription, setSelectedCollaborators, setActiveTab])
}
