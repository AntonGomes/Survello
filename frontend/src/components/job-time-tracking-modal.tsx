"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Circle, Clock, Square, Timer, Users, AlertTriangle, Check } from "lucide-react"

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  startTimerMutation,
  stopTimerMutation,
  logTimeManuallyMutation,
  getCurrentTimerOptions,
  readJobOptions,
  updateProjectMutation,
  readOrgOptions,
} from "@/client/@tanstack/react-query.gen"
import { FeeType, type ProjectRead } from "@/client"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface JobTimeTrackingModalProps {
  jobId: number
  projects: ProjectRead[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onTimeLogged?: (projectName: string, description: string, durationMinutes: number, collaboratorNames?: string[]) => void
  defaultProjectId?: number
}

type ModalStep = "select-project" | "confirm-billing" | "recording" | "stopped-collaborators"

export function JobTimeTrackingModal({
  jobId,
  projects,
  open,
  onOpenChange,
  onTimeLogged,
  defaultProjectId,
}: JobTimeTrackingModalProps) {
  const queryClient = useQueryClient()

  // Modal step state
  const [step, setStep] = useState<ModalStep>("select-project")
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    defaultProjectId ? defaultProjectId.toString() : ""
  )
  const [description, setDescription] = useState("")
  
  // Timer state
  const [isRecording, setIsRecording] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Manual entry state
  const [manualHours, setManualHours] = useState("")
  const [manualMinutes, setManualMinutes] = useState("")
  const [manualDescription, setManualDescription] = useState("")
  const [activeTab, setActiveTab] = useState<string>("timer")

  // Collaborators state
  const [selectedCollaborators, setSelectedCollaborators] = useState<number[]>([])
  const [stoppedDuration, setStoppedDuration] = useState<number>(0)
  const [stoppedDescription, setStoppedDescription] = useState<string>("")
  const [stoppedProjectId, setStoppedProjectId] = useState<number | null>(null)

  // Fetch org users for collaborator selection
  const { data: org } = useQuery({
    ...readOrgOptions(),
  })

  // Check if there's an active timer
  const { data: activeTimer } = useQuery({
    ...getCurrentTimerOptions(),
    refetchInterval: isRecording ? 1000 : false,
  })

  const selectedProject = useMemo(() => {
    if (!selectedProjectId) return null
    return projects.find(p => p.id.toString() === selectedProjectId)
  }, [selectedProjectId, projects])

  const isHourlyOrMixed = selectedProject?.fee_type === FeeType.HOURLY || selectedProject?.fee_type === FeeType.MIXED

  // Update project mutation for changing fee type
  const { mutate: updateProject, isPending: isUpdatingProject } = useMutation({
    ...updateProjectMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: readJobOptions({ path: { job_id: jobId } }).queryKey,
      })
      toast.success("Project billing updated to hourly")
      setStep("select-project")
      // After updating, proceed with recording
      handleStartRecordingConfirmed()
    },
    onError: () => {
      toast.error("Failed to update project billing")
    },
  })

  // Start timer mutation
  const { mutate: startTimer, isPending: isStarting } = useMutation({
    ...startTimerMutation(),
    onSuccess: () => {
      setIsRecording(true)
      setElapsedSeconds(0)
      setStep("recording")
      toast.success("Timer started")
    },
    onError: () => {
      toast.error("Timer already running or failed to start. Please stop it first.")
    },
  })

  // Stop timer mutation
  const { mutate: stopTimer, isPending: isStopping } = useMutation({
    ...stopTimerMutation(),
    onSuccess: (data) => {
      setIsRecording(false)
      setElapsedSeconds(0)
      
      // Store stopped data for collaborator selection
      setStoppedDuration(data.duration_minutes || 0)
      setStoppedDescription(description || data.description || "")
      setStoppedProjectId(data.project_id || null)
      
      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: getCurrentTimerOptions().queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: readJobOptions({ path: { job_id: jobId } }).queryKey,
      })

      // Move to collaborator selection step
      setStep("stopped-collaborators")
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
        queryKey: readJobOptions({ path: { job_id: jobId } }).queryKey,
      })

      const totalMinutes = parseInt(manualHours || "0") * 60 + parseInt(manualMinutes || "0")
      
      // Store stopped data for collaborator selection
      setStoppedDuration(totalMinutes)
      setStoppedDescription(manualDescription)
      setStoppedProjectId(data.project_id || null)
      
      // Move to collaborator selection step
      setStep("stopped-collaborators")
    },
    onError: () => {
      toast.error("Failed to log time")
    },
  })

  // Mutation for logging collaborator time
  const { mutate: logCollaboratorTime, isPending: isLoggingCollaborator } = useMutation({
    ...logTimeManuallyMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: readJobOptions({ path: { job_id: jobId } }).queryKey,
      })
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

  // Check if we already have an active timer
  useEffect(() => {
    if (activeTimer && activeTimer.start_time) {
      const timerProjectId = activeTimer.project_id
      const isForThisJob = projects.some(p => p.id === timerProjectId)
      
      if (isForThisJob) {
        setIsRecording(true)
        setSelectedProjectId(timerProjectId?.toString() || "")
        setStep("recording")
        // Calculate elapsed from start_time
        const startTime = new Date(activeTimer.start_time).getTime()
        const now = Date.now()
        setElapsedSeconds(Math.floor((now - startTime) / 1000))
      }
    }
  }, [activeTimer, projects])

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      // Only reset if not recording
      if (!isRecording) {
        setStep("select-project")
        setSelectedProjectId(defaultProjectId ? defaultProjectId.toString() : "")
        setDescription("")
        setManualHours("")
        setManualMinutes("")
        setManualDescription("")
        setSelectedCollaborators([])
        setActiveTab("timer")
      }
    }
  }, [open, isRecording, defaultProjectId])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleProjectSelect = (projectId: string) => {
    setSelectedProjectId(projectId)
  }

  const handleStartRecording = () => {
    if (!selectedProject) {
      toast.error("Please select a project first")
      return
    }

    // Check if project is hourly/mixed
    if (!isHourlyOrMixed) {
      setStep("confirm-billing")
      return
    }

    handleStartRecordingConfirmed()
  }

  const handleStartRecordingConfirmed = () => {
    if (!selectedProject) return
    
    startTimer({
      body: {
        project_id: selectedProject.id,
        description: description || undefined,
      },
    })
  }

  const handleConvertToHourly = () => {
    if (!selectedProject) return
    
    updateProject({
      path: { project_id: selectedProject.id },
      body: { fee_type: FeeType.HOURLY },
    })
  }

  const handleStopRecording = () => {
    stopTimer({
      query: { description: description || undefined },
    })
  }

  const handleManualSubmit = () => {
    if (!selectedProject) {
      toast.error("Please select a project first")
      return
    }

    // Check if project is hourly/mixed
    if (!isHourlyOrMixed) {
      setStep("confirm-billing")
      return
    }

    const hours = parseInt(manualHours || "0")
    const minutes = parseInt(manualMinutes || "0")
    const totalMinutes = hours * 60 + minutes

    if (totalMinutes <= 0) {
      toast.error("Please enter a valid duration")
      return
    }

    logManually({
      body: {
        project_id: selectedProject.id,
        duration_minutes: totalMinutes,
        description: manualDescription || undefined,
      },
    })
  }

  const handleFinishWithCollaborators = async () => {
    const projectName = projects.find(p => p.id === stoppedProjectId)?.name || "Project"
    
    // Log time for each collaborator
    if (selectedCollaborators.length > 0 && stoppedProjectId) {
      for (let i = 0; i < selectedCollaborators.length; i++) {
        // Note: This logs time under current user, not collaborator
        // For proper multi-user logging, backend would need enhancement
        logCollaboratorTime({
          body: {
            project_id: stoppedProjectId,
            duration_minutes: stoppedDuration,
            description: stoppedDescription ? `${stoppedDescription} (with collaborators)` : "Collaborative work",
          },
        })
      }
    }

    // Get collaborator names
    const collaboratorNames = org?.users
      ?.filter(u => selectedCollaborators.includes(u.id))
      .map(u => u.name || u.email) || []

    toast.success(`Logged ${stoppedDuration} minutes`)
    
    if (onTimeLogged) {
      onTimeLogged(projectName, stoppedDescription, stoppedDuration, collaboratorNames.length > 0 ? collaboratorNames : undefined)
    }

    // Reset and close
    setStep("select-project")
    setSelectedProjectId("")
    setDescription("")
    setManualHours("")
    setManualMinutes("")
    setManualDescription("")
    setSelectedCollaborators([])
    onOpenChange(false)
  }

  const handleSkipCollaborators = () => {
    const projectName = projects.find(p => p.id === stoppedProjectId)?.name || "Project"
    
    toast.success(`Logged ${stoppedDuration} minutes`)
    
    if (onTimeLogged) {
      onTimeLogged(projectName, stoppedDescription, stoppedDuration)
    }

    // Reset and close
    setStep("select-project")
    setSelectedProjectId("")
    setDescription("")
    setManualHours("")
    setManualMinutes("")
    setManualDescription("")
    setSelectedCollaborators([])
    onOpenChange(false)
  }

  const toggleCollaborator = (userId: number) => {
    setSelectedCollaborators(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  // Check if timer is running for a different job
  const timerOnDifferentJob = activeTimer && !projects.some(p => p.id === activeTimer.project_id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {/* Step: Select Project */}
        {step === "select-project" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Timer className="h-5 w-5" />
                Log Time
              </DialogTitle>
              <DialogDescription>
                Select a project and track your time
              </DialogDescription>
            </DialogHeader>

            {timerOnDifferentJob ? (
              <div className="py-4 text-center">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Timer Active</AlertTitle>
                  <AlertDescription>
                    You have an active timer running for another job. Please stop it first using the header controls.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                {/* Project Selection */}
                <div className="space-y-2">
                  <Label>Project</Label>
                  <Select value={selectedProjectId} onValueChange={handleProjectSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project..." />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id.toString()}>
                          <div className="flex items-center gap-2">
                            <span>{project.name}</span>
                            {(project.fee_type === FeeType.HOURLY || project.fee_type === FeeType.MIXED) && (
                              <span className="text-xs text-muted-foreground">(hourly)</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedProject && (
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="timer">Timer</TabsTrigger>
                      <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                    </TabsList>

                    <TabsContent value="timer" className="space-y-4 pt-4">
                      {/* Description */}
                      <div className="space-y-2">
                        <Label htmlFor="timer-description">What are you working on?</Label>
                        <Textarea
                          id="timer-description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Describe your work..."
                          className="resize-none"
                          rows={2}
                        />
                      </div>

                      <Button
                        size="lg"
                        onClick={handleStartRecording}
                        disabled={isStarting || !selectedProjectId}
                        className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
                      >
                        <Circle className="h-4 w-4 fill-current" />
                        Start Recording
                      </Button>
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
                        <Label htmlFor="manual-description">What did you work on?</Label>
                        <Textarea
                          id="manual-description"
                          value={manualDescription}
                          onChange={(e) => setManualDescription(e.target.value)}
                          placeholder="Describe your work..."
                          className="resize-none"
                          rows={2}
                        />
                      </div>

                      <Button
                        onClick={handleManualSubmit}
                        disabled={isLoggingManually || !selectedProjectId}
                        className="w-full gap-2"
                      >
                        <Clock className="h-4 w-4" />
                        Log Time
                      </Button>
                    </TabsContent>
                  </Tabs>
                )}
              </div>
            )}
          </>
        )}

        {/* Step: Confirm Billing Change */}
        {step === "confirm-billing" && selectedProject && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Change Billing Type?
              </DialogTitle>
              <DialogDescription>
                <span className="font-medium">{selectedProject.name}</span> is currently set to <span className="font-medium">{selectedProject.fee_type}</span> billing.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Time tracking requires hourly billing</AlertTitle>
                <AlertDescription>
                  To track time on this project, you need to change its billing type to hourly. Would you like to proceed?
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep("select-project")}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConvertToHourly}
                  disabled={isUpdatingProject}
                  className="flex-1"
                >
                  {isUpdatingProject ? "Updating..." : "Change to Hourly"}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Step: Recording */}
        {step === "recording" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </div>
                Recording Time
              </DialogTitle>
              <DialogDescription>
                {selectedProject?.name || activeTimer?.project_name}
              </DialogDescription>
            </DialogHeader>

            <div className="py-6 space-y-6">
              {/* Timer Display */}
              <div className="text-center">
                <div className="text-5xl font-mono font-bold tabular-nums">
                  {formatTime(elapsedSeconds)}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="recording-description">Description</Label>
                <Textarea
                  id="recording-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What are you working on?"
                  className="resize-none"
                  rows={2}
                />
              </div>

              <Button
                size="lg"
                variant="destructive"
                onClick={handleStopRecording}
                disabled={isStopping}
                className="w-full gap-2"
              >
                <Square className="h-4 w-4 fill-current" />
                Stop Recording
              </Button>
            </div>
          </>
        )}

        {/* Step: Collaborators */}
        {step === "stopped-collaborators" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Add Collaborators
              </DialogTitle>
              <DialogDescription>
                Did anyone else work on this with you?
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="text-center text-sm text-muted-foreground mb-4">
                <span className="font-medium text-foreground">{stoppedDuration}</span> minutes logged
                {stoppedDescription && (
                  <p className="mt-1 italic">&quot;{stoppedDescription}&quot;</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Select team members who also worked on this:</Label>
                <ScrollArea className="h-[200px] rounded-md border p-2">
                  <div className="space-y-2">
                    {org?.users?.map((orgUser) => (
                      <div
                        key={orgUser.id}
                        className={cn(
                          "flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors",
                          selectedCollaborators.includes(orgUser.id) 
                            ? "bg-primary/10" 
                            : "hover:bg-muted"
                        )}
                        onClick={() => toggleCollaborator(orgUser.id)}
                      >
                        <Checkbox
                          checked={selectedCollaborators.includes(orgUser.id)}
                          onCheckedChange={() => toggleCollaborator(orgUser.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {orgUser.name || orgUser.email}
                          </p>
                          {orgUser.name && (
                            <p className="text-xs text-muted-foreground truncate">
                              {orgUser.email}
                            </p>
                          )}
                        </div>
                        {selectedCollaborators.includes(orgUser.id) && (
                          <Check className="h-4 w-4 text-primary shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <DialogFooter className="flex gap-2 sm:gap-0">
                <Button
                  variant="ghost"
                  onClick={handleSkipCollaborators}
                  className="flex-1"
                >
                  Skip
                </Button>
                <Button
                  onClick={handleFinishWithCollaborators}
                  disabled={isLoggingCollaborator}
                  className="flex-1"
                >
                  {selectedCollaborators.length > 0 
                    ? `Add ${selectedCollaborators.length} collaborator${selectedCollaborators.length > 1 ? 's' : ''}`
                    : "Done"
                  }
                </Button>
              </DialogFooter>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
