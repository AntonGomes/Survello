"use client"

import { useState, useEffect, useRef } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { startTimerMutation, stopTimerMutation, logTimeManuallyMutation, getCurrentTimerOptions, readInstructionOptions } from "@/client/@tanstack/react-query.gen"
import { toast } from "sonner"

const MS_PER_SECOND = 1000
const SECONDS_PER_MINUTE = 60
const SECONDS_PER_HOUR = 3600
const MINUTES_PER_HOUR = 60

interface UseTimeTrackingModalOptions {
  instructionId: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onTimeLogged?: (description: string, durationMinutes: number, timeEntryId?: number) => void
}

function useTimerState(instructionId: number) {
  const [isRecording, setIsRecording] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [description, setDescription] = useState("")
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const { data: activeTimer } = useQuery({ ...getCurrentTimerOptions(), refetchInterval: isRecording ? MS_PER_SECOND : false })

  useEffect(() => {
    if (isRecording) { intervalRef.current = setInterval(() => setElapsedSeconds((prev) => prev + 1), MS_PER_SECOND) }
    else if (intervalRef.current) { clearInterval(intervalRef.current) }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isRecording])

  useEffect(() => {
    if (activeTimer && activeTimer.instruction_id === instructionId && activeTimer.start_time) {
      setIsRecording(true)
      setElapsedSeconds(Math.floor((Date.now() - new Date(activeTimer.start_time).getTime()) / MS_PER_SECOND))
    }
  }, [activeTimer, instructionId])

  const timerOnDifferentInstruction = !!activeTimer && activeTimer.instruction_id !== instructionId

  return { isRecording, setIsRecording, elapsedSeconds, setElapsedSeconds, description, setDescription, timerOnDifferentInstruction }
}

function formatTime(seconds: number) {
  const hrs = Math.floor(seconds / SECONDS_PER_HOUR)
  const mins = Math.floor((seconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE)
  const secs = seconds % SECONDS_PER_MINUTE
  return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

function useModalMutations({ timer, instructionId, onTimeLogged, onOpenChange }: { timer: ReturnType<typeof useTimerState>; instructionId: number; onTimeLogged: UseTimeTrackingModalOptions["onTimeLogged"]; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient()
  const invalidate = () => { queryClient.invalidateQueries({ queryKey: readInstructionOptions({ path: { instruction_id: instructionId } }).queryKey }) }

  const { mutate: startTimer, isPending: isStarting } = useMutation({
    ...startTimerMutation(),
    onSuccess: () => { timer.setIsRecording(true); timer.setElapsedSeconds(0); toast.success("Timer started") },
    onError: () => { toast.error("Failed to start timer") },
  })

  const { mutate: stopTimer, isPending: isStopping } = useMutation({
    ...stopTimerMutation(),
    onSuccess: (data) => {
      timer.setIsRecording(false); timer.setElapsedSeconds(0); timer.setDescription("")
      queryClient.invalidateQueries({ queryKey: getCurrentTimerOptions().queryKey }); invalidate()
      toast.success(`Logged ${data.duration_minutes} minutes`)
      if (onTimeLogged && data.duration_minutes) onTimeLogged(timer.description, data.duration_minutes, data.id)
      onOpenChange(false)
    },
    onError: () => { toast.error("Failed to stop timer") },
  })

  return { startTimer, stopTimer, isStarting, isStopping, invalidate }
}

export function useTimeTrackingModal({ instructionId, onOpenChange, onTimeLogged }: UseTimeTrackingModalOptions) {
  const timer = useTimerState(instructionId)
  const [manualHours, setManualHours] = useState("")
  const [manualMinutes, setManualMinutes] = useState("")
  const [manualDescription, setManualDescription] = useState("")
  const muts = useModalMutations({ timer, instructionId, onTimeLogged, onOpenChange })

  const { mutate: logManually, isPending: isLoggingManually } = useMutation({
    ...logTimeManuallyMutation(),
    onSuccess: (data) => {
      muts.invalidate()
      const totalMinutes = parseInt(manualHours || "0") * MINUTES_PER_HOUR + parseInt(manualMinutes || "0")
      toast.success(`Logged ${totalMinutes} minutes`)
      if (onTimeLogged) onTimeLogged(manualDescription, totalMinutes, data.id)
      setManualHours(""); setManualMinutes(""); setManualDescription(""); onOpenChange(false)
    },
    onError: () => { toast.error("Failed to log time") },
  })

  const handleStartRecording = () => { muts.startTimer({ body: { instruction_id: instructionId, description: timer.description || undefined } }) }
  const handleStopRecording = () => { muts.stopTimer({ query: { description: timer.description || undefined } }) }
  const handleManualSubmit = () => {
    const totalMinutes = parseInt(manualHours || "0") * MINUTES_PER_HOUR + parseInt(manualMinutes || "0")
    if (totalMinutes <= 0) { toast.error("Please enter a valid duration"); return }
    logManually({ body: { instruction_id: instructionId, duration_minutes: totalMinutes, description: manualDescription || undefined } })
  }

  return {
    isRecording: timer.isRecording, elapsedSeconds: timer.elapsedSeconds, description: timer.description, setDescription: timer.setDescription,
    manualHours, setManualHours, manualMinutes, setManualMinutes, manualDescription, setManualDescription,
    isStarting: muts.isStarting, isStopping: muts.isStopping, isLoggingManually,
    formatTime, handleStartRecording, handleStopRecording, handleManualSubmit, timerOnDifferentInstruction: timer.timerOnDifferentInstruction,
  }
}
