"use client"

import { useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { readJobOptions, readSurveysOptions, addJobUpdateMutation, getCurrentTimerOptions } from "@/client/@tanstack/react-query.gen"
import { useAuth } from "@/context/auth-context"
import { toast } from "sonner"

const MS_PER_SECOND = 1000
const SECONDS_PER_MINUTE = 60
const MS_PER_MINUTE = MS_PER_SECOND * SECONDS_PER_MINUTE
const MINUTES_PER_HOUR = 60

export function useJobQueries(jobId: number) {
  const { data: job, isLoading, error } = useQuery({
    ...readJobOptions({ path: { job_id: jobId } })
  })

  const { data: activeTimer } = useQuery({
    ...getCurrentTimerOptions(),
    refetchInterval: MS_PER_MINUTE,
  })

  const { data: surveys, isLoading: isLoadingSurveys } = useQuery({
    ...readSurveysOptions({ query: { job_id: jobId } }),
    enabled: !!jobId,
  })

  return { job, isLoading, error, activeTimer, surveys, isLoadingSurveys }
}

export function useJobUpdates(jobId: number) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { mutate: addUpdate, isPending: isAddingUpdate } = useMutation({
    ...addJobUpdateMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: readJobOptions({ path: { job_id: jobId } }).queryKey,
      })
      toast.success("Update added")
    },
    onError: () => {
      toast.error("Failed to add update")
    },
  })

  const handleAddUpdate = (text: string) => {
    if (!user) return
    addUpdate({ path: { job_id: jobId }, body: { text } })
  }

  const handleAddUpdateAsync = async (text: string) => {
    handleAddUpdate(text)
  }

  return { handleAddUpdate, handleAddUpdateAsync, isAddingUpdate }
}

export function useJobComputedData(options: {
  instructions: Array<{ status?: string | null; deadline?: string | null; instruction_type?: { name?: string } | null }> | undefined
  surveys: Array<{ photo_count?: number | null; conducted_date?: string; conducted_by_user?: { name: string } | null }> | undefined
}) {
  const { instructions, surveys } = options

  const instructionStatusData = useMemo(() => {
    if (!instructions) return []
    const counts: Record<string, number> = { planned: 0, active: 0, completed: 0, archived: 0 }
    instructions.forEach(p => {
      const status = p.status || "planned"
      counts[status] = (counts[status] || 0) + 1
    })
    return Object.entries(counts).map(([status, count]) => ({
      status,
      count,
      fill: `var(--color-${status})`,
    }))
  }, [instructions])

  const totalSurveyImages = useMemo(() => {
    if (!surveys) return 0
    return surveys.reduce((sum, s) => sum + (s.photo_count || 0), 0)
  }, [surveys])

  const mostRecentSurvey = useMemo(() => {
    if (!surveys || surveys.length === 0) return null
    return [...surveys].sort((a, b) =>
      new Date(b.conducted_date ?? 0).getTime() - new Date(a.conducted_date ?? 0).getTime()
    )[0]
  }, [surveys])

  const nextDeadlineInstruction = useMemo(() => {
    if (!instructions) return null
    const now = new Date()
    const upcoming = instructions
      .filter(p => p.deadline && new Date(p.deadline) > now)
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    return upcoming[0] || null
  }, [instructions])

  return { instructionStatusData, totalSurveyImages, mostRecentSurvey, nextDeadlineInstruction }
}

export function useTimeLogging(handleAddUpdate: (text: string) => void) {
  return ({ instructionName, description, durationMinutes, collaboratorNames }: { instructionName: string; description: string; durationMinutes: number; collaboratorNames?: string[] }) => {
    const hours = Math.floor(durationMinutes / MINUTES_PER_HOUR)
    const mins = durationMinutes % MINUTES_PER_HOUR
    const timeText = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
    let updateText = description
      ? `**Time logged on ${instructionName}: ${timeText}** — ${description}`
      : `**Time logged on ${instructionName}: ${timeText}**`
    if (collaboratorNames && collaboratorNames.length > 0) {
      updateText += ` (with ${collaboratorNames.join(", ")})`
    }
    handleAddUpdate(updateText)
  }
}
