"use client"

import { useState, useEffect, useRef } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Circle, Clock, Square, Timer } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  startTimerMutation,
  stopTimerMutation,
  logTimeManuallyMutation,
  getCurrentTimerOptions,
  readProjectOptions,
} from "@/client/@tanstack/react-query.gen"
import { toast } from "sonner"

interface TimeTrackingModalProps {
  projectId: number
  projectName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onTimeLogged?: (description: string, durationMinutes: number, timeEntryId?: number) => void
}

export function TimeTrackingModal({
  projectId,
  projectName,
  open,
  onOpenChange,
  onTimeLogged,
}: TimeTrackingModalProps) {
  const queryClient = useQueryClient()

  // Timer state
  const [isRecording, setIsRecording] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [description, setDescription] = useState("")
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Manual entry state
  const [manualHours, setManualHours] = useState("")
  const [manualMinutes, setManualMinutes] = useState("")
  const [manualDescription, setManualDescription] = useState("")

  // Check if there's an active timer
  const { data: activeTimer } = useQuery({
    ...getCurrentTimerOptions(),
    refetchInterval: isRecording ? 1000 : false,
  })

  // Start timer mutation
  const { mutate: startTimer, isPending: isStarting } = useMutation({
    ...startTimerMutation(),
    onSuccess: () => {
      setIsRecording(true)
      setElapsedSeconds(0)
      toast.success("Timer started")
    },
    onError: () => {
      toast.error("Failed to start timer")
    },
  })

  // Stop timer mutation
  const { mutate: stopTimer, isPending: isStopping } = useMutation({
    ...stopTimerMutation(),
    onSuccess: (data) => {
      setIsRecording(false)
      setElapsedSeconds(0)
      setDescription("")
      
      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: getCurrentTimerOptions().queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: readProjectOptions({ path: { project_id: projectId } }).queryKey,
      })

      toast.success(`Logged ${data.duration_minutes} minutes`)
      
      if (onTimeLogged && data.duration_minutes) {
        onTimeLogged(description, data.duration_minutes, data.id)
      }
      
      onOpenChange(false)
    },
    onError: () => {
      toast.error("Failed to stop timer")
    },
  })

  // Manual time entry mutation
  const { mutate: logManually, isPending: isLoggingManually } = useMutation({
    ...logTimeManuallyMutation(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: readProjectOptions({ path: { project_id: projectId } }).queryKey,
      })

      const totalMinutes = parseInt(manualHours || "0") * 60 + parseInt(manualMinutes || "0")
      toast.success(`Logged ${totalMinutes} minutes`)
      
      if (onTimeLogged) {
        onTimeLogged(manualDescription, totalMinutes, data.id)
      }

      setManualHours("")
      setManualMinutes("")
      setManualDescription("")
      onOpenChange(false)
    },
    onError: () => {
      toast.error("Failed to log time")
    },
  })

  // Timer effect
  useEffect(() => {
    if (isRecording) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1)
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRecording])

  // Check if we already have an active timer for this project
  useEffect(() => {
    if (activeTimer && activeTimer.project_id === projectId && activeTimer.start_time) {
      setIsRecording(true)
      // Calculate elapsed from start_time
      const startTime = new Date(activeTimer.start_time).getTime()
      const now = Date.now()
      setElapsedSeconds(Math.floor((now - startTime) / 1000))
    }
  }, [activeTimer, projectId])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleStartRecording = () => {
    startTimer({
      body: {
        project_id: projectId,
        description: description || undefined,
      },
    })
  }

  const handleStopRecording = () => {
    stopTimer({
      query: { description: description || undefined },
    })
  }

  const handleManualSubmit = () => {
    const hours = parseInt(manualHours || "0")
    const minutes = parseInt(manualMinutes || "0")
    const totalMinutes = hours * 60 + minutes

    if (totalMinutes <= 0) {
      toast.error("Please enter a valid duration")
      return
    }

    logManually({
      body: {
        project_id: projectId,
        duration_minutes: totalMinutes,
        description: manualDescription || undefined,
      },
    })
  }

  // Check if timer is running for a different project
  const timerOnDifferentProject = activeTimer && activeTimer.project_id !== projectId

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Log Time
          </DialogTitle>
          <DialogDescription>
            Track time for <span className="font-medium">{projectName}</span>
          </DialogDescription>
        </DialogHeader>

        {timerOnDifferentProject ? (
          <div className="py-4 text-center">
            <p className="text-sm text-muted-foreground">
              You have an active timer running for another project. Please stop
              it first.
            </p>
          </div>
        ) : (
          <Tabs defaultValue={isRecording ? "timer" : "timer"} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="timer">Timer</TabsTrigger>
              <TabsTrigger value="manual" disabled={isRecording}>
                Manual Entry
              </TabsTrigger>
            </TabsList>

            <TabsContent value="timer" className="space-y-4 pt-4">
              {/* Timer Display */}
              <div className="text-center">
                <div className="text-4xl font-mono font-bold tabular-nums">
                  {formatTime(elapsedSeconds)}
                </div>
                {isRecording && (
                  <div className="flex items-center justify-center gap-2 mt-2 text-red-500">
                    <Circle className="h-3 w-3 fill-current animate-pulse" />
                    <span className="text-sm font-medium">Recording</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="timer-description">Description (optional)</Label>
                <Textarea
                  id="timer-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What are you working on?"
                  className="resize-none"
                  rows={2}
                />
              </div>

              {/* Timer Controls */}
              <div className="flex justify-center gap-4">
                {!isRecording ? (
                  <Button
                    size="lg"
                    onClick={handleStartRecording}
                    disabled={isStarting}
                    className="bg-red-600 hover:bg-red-700 text-white gap-2"
                  >
                    <Circle className="h-4 w-4 fill-current" />
                    Start Recording
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant="destructive"
                    onClick={handleStopRecording}
                    disabled={isStopping}
                    className="gap-2"
                  >
                    <Square className="h-4 w-4 fill-current" />
                    Stop & Log Time
                  </Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="manual" className="space-y-4 pt-4">
              {/* Duration Input */}
              <div className="space-y-2">
                <Label>Duration</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      min="0"
                      value={manualHours}
                      onChange={(e) => setManualHours(e.target.value)}
                      placeholder="0"
                    />
                    <span className="text-xs text-muted-foreground">hours</span>
                  </div>
                  <span className="text-lg font-medium">:</span>
                  <div className="flex-1">
                    <Input
                      type="number"
                      min="0"
                      max="59"
                      value={manualMinutes}
                      onChange={(e) => setManualMinutes(e.target.value)}
                      placeholder="0"
                    />
                    <span className="text-xs text-muted-foreground">minutes</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="manual-description">Description (optional)</Label>
                <Textarea
                  id="manual-description"
                  value={manualDescription}
                  onChange={(e) => setManualDescription(e.target.value)}
                  placeholder="What did you work on?"
                  className="resize-none"
                  rows={2}
                />
              </div>

              <DialogFooter>
                <Button
                  onClick={handleManualSubmit}
                  disabled={isLoggingManually}
                  className="w-full gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Log Time
                </Button>
              </DialogFooter>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}
