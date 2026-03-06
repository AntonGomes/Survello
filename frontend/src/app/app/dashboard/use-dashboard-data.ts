"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { subDays, isAfter } from "date-fns"
import { readJobsOptions, readClientsOptions, readSurveysOptions } from "@/client/@tanstack/react-query.gen"

const RECENT_ACTIVITY_DAYS = 7
const UPDATES_PER_PAGE = 10

export { UPDATES_PER_PAGE }

interface UpdateItem {
  id: string
  update_type: string
  text: string
  author_id: number
  author_name: string | null
  author_initials: string | null
  created_at: string
  job_id: number
  job_name: string
  source_project_name?: string | null
}

export type { UpdateItem }

export function useDashboardQueries() {
  const { data: jobs, isLoading: isLoadingJobs } = useQuery({ ...readJobsOptions({ query: { limit: 100, offset: 0 } }) })
  const { data: clients, isLoading: isLoadingClients } = useQuery({ ...readClientsOptions() })
  const { data: surveys, isLoading: isLoadingSurveys } = useQuery({ ...readSurveysOptions({}) })
  return { jobs, clients, surveys, isLoading: isLoadingJobs || isLoadingClients || isLoadingSurveys }
}

export function useJobStats(jobs: Array<{ status?: string | null; updates?: unknown[] | null }> | undefined) {
  return useMemo(() => {
    if (!jobs) return { total: 0, active: 0, completed: 0, planned: 0, recentlyActive: 0 }
    const sevenDaysAgo = subDays(new Date(), RECENT_ACTIVITY_DAYS)
    return {
      total: jobs.length,
      active: jobs.filter(j => j.status === "active").length,
      completed: jobs.filter(j => j.status === "completed").length,
      planned: jobs.filter(j => j.status === "planned").length,
      recentlyActive: jobs.filter(j => {
        const updates = (j.updates || []) as { created_at: string }[]
        return updates.some(u => isAfter(new Date(u.created_at), sevenDaysAgo))
      }).length,
    }
  }, [jobs])
}

export function useClientStats(clients: Array<{ id: number }> | undefined, jobs: Array<{ status?: string | null; client: { id: number } }> | undefined) {
  return useMemo(() => {
    if (!clients) return { total: 0, withActiveJobs: 0 }
    const activeIds = new Set(jobs?.filter(j => j.status === "active").map(j => j.client.id) || [])
    return { total: clients.length, withActiveJobs: clients.filter(c => activeIds.has(c.id)).length }
  }, [clients, jobs])
}

export function useSurveyStats(surveys: Array<{ conducted_date?: string; photo_count?: number | null }> | undefined) {
  return useMemo(() => {
    if (!surveys) return { total: 0, thisMonth: 0, totalPhotos: 0 }
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    return {
      total: surveys.length,
      thisMonth: surveys.filter(s => s.conducted_date && isAfter(new Date(s.conducted_date), startOfMonth)).length,
      totalPhotos: surveys.reduce((sum, s) => sum + (s.photo_count || 0), 0),
    }
  }, [surveys])
}

export function useAllUpdates(jobs: Array<{ id: number; name: string; updates?: unknown[] | null; instructions?: unknown[] | null }> | undefined) {
  const allUpdates = useMemo(() => {
    if (!jobs) return []
    const updates: UpdateItem[] = []
    jobs.forEach(job => {
      const jobUpdates = (job.updates || []) as Omit<UpdateItem, "job_id" | "job_name">[]
      jobUpdates.forEach(u => updates.push({ ...u, job_id: job.id, job_name: job.name }))
    })
    return updates.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [jobs])

  const hoursStats = useMemo(() => {
    if (!jobs) return { thisWeek: 0, totalInstructions: 0 }
    return { thisWeek: 0, totalInstructions: jobs.flatMap(j => j.instructions || []).length }
  }, [jobs])

  const mostRecentJob = useMemo(() => {
    if (!jobs || allUpdates.length === 0) return null
    const recentUpdate = allUpdates[0]
    if (!recentUpdate) return null
    return jobs.find(j => j.id === recentUpdate.job_id) || null
  }, [allUpdates, jobs])

  return { allUpdates, hoursStats, mostRecentJob }
}
