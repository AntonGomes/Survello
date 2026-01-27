"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { formatDistanceToNow, subDays, isAfter } from "date-fns"
import { 
  Briefcase, 
  Building2, 
  Clock, 
  TrendingUp, 
  Camera,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Activity,
  Target,
  FileText,
} from "lucide-react"

import { readJobsOptions, readClientsOptions, readSurveysOptions } from "@/client/@tanstack/react-query.gen"
import { FeatureHeader } from "@/components/feature-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"

// Update item type for the unified feed
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

// Items per page for pagination
const UPDATES_PER_PAGE = 10

export default function DashboardPage() {
  const [updatesPage, setUpdatesPage] = useState(0)

  // Fetch all jobs
  const { data: jobs, isLoading: isLoadingJobs } = useQuery({
    ...readJobsOptions({ query: { limit: 100, offset: 0 } }),
  })

  // Fetch all clients
  const { data: clients, isLoading: isLoadingClients } = useQuery({
    ...readClientsOptions(),
  })

  // Fetch all surveys
  const { data: surveys, isLoading: isLoadingSurveys } = useQuery({
    ...readSurveysOptions({}),
  })

  // Compute job statistics
  const jobStats = useMemo(() => {
    if (!jobs) return { total: 0, active: 0, completed: 0, planned: 0, recentlyActive: 0 }
    
    const now = new Date()
    const sevenDaysAgo = subDays(now, 7)
    
    return {
      total: jobs.length,
      active: jobs.filter(j => j.status === "active").length,
      completed: jobs.filter(j => j.status === "completed").length,
      planned: jobs.filter(j => j.status === "planned").length,
      // Count jobs with updates in last 7 days
      recentlyActive: jobs.filter(j => {
        const updates = (j.updates || []) as { created_at: string }[]
        return updates.some(u => isAfter(new Date(u.created_at), sevenDaysAgo))
      }).length,
    }
  }, [jobs])

  // Compute client statistics
  const clientStats = useMemo(() => {
    if (!clients) return { total: 0, withActiveJobs: 0 }
    
    const activeJobClientIds = new Set(
      jobs?.filter(j => j.status === "active").map(j => j.client.id) || []
    )
    
    return {
      total: clients.length,
      withActiveJobs: clients.filter(c => activeJobClientIds.has(c.id)).length,
    }
  }, [clients, jobs])

  // Compute survey statistics
  const surveyStats = useMemo(() => {
    if (!surveys) return { total: 0, thisMonth: 0, totalPhotos: 0 }
    
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    return {
      total: surveys.length,
      thisMonth: surveys.filter(s => isAfter(new Date(s.conducted_date), startOfMonth)).length,
      totalPhotos: surveys.reduce((sum, s) => sum + (s.photo_count || 0), 0),
    }
  }, [surveys])

  // Compute hours tracked this week
  const hoursStats = useMemo(() => {
    if (!jobs) return { thisWeek: 0, totalInstructions: 0 }
    
    const allInstructions = jobs.flatMap(j => j.instructions || [])
    const totalHours = allInstructions.reduce((sum, p) => sum + (p.actual_hours || 0), 0)
    
    return {
      thisWeek: totalHours, // For now, showing total - backend would need time entries query for proper weekly stats
      totalInstructions: allInstructions.length,
    }
  }, [jobs])

  // Aggregate all updates from all jobs into a single timeline
  const allUpdates = useMemo(() => {
    if (!jobs) return []
    
    const updates: UpdateItem[] = []
    
    jobs.forEach(job => {
      const jobUpdates = (job.updates || []) as {
        id: string
        update_type: string
        text: string
        author_id: number
        author_name: string | null
        author_initials: string | null
        created_at: string
        source_project_name?: string | null
      }[]
      
      jobUpdates.forEach(update => {
        updates.push({
          ...update,
          job_id: job.id,
          job_name: job.name,
        })
      })
    })
    
    // Sort by created_at descending (most recent first)
    return updates.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }, [jobs])

  // Paginate updates
  const paginatedUpdates = useMemo(() => {
    const start = updatesPage * UPDATES_PER_PAGE
    return allUpdates.slice(start, start + UPDATES_PER_PAGE)
  }, [allUpdates, updatesPage])

  const totalPages = Math.ceil(allUpdates.length / UPDATES_PER_PAGE)

  // Get most recently updated job
  const mostRecentJob = useMemo(() => {
    if (!jobs || allUpdates.length === 0) return null
    const recentUpdate = allUpdates[0]
    if (!recentUpdate) return null
    return jobs.find(j => j.id === recentUpdate.job_id) || null
  }, [allUpdates, jobs])

  // Format relative time
  const formatRelativeTime = (dateStr: string) => {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
  }

  // Get initials for avatar
  const getInitials = (name: string | null, authorInitials: string | null) => {
    if (authorInitials) return authorInitials
    if (!name) return "?"
    return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
  }

  const isLoading = isLoadingJobs || isLoadingClients || isLoadingSurveys

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 h-full">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <FeatureHeader 
        title="Dashboard" 
        subtitle="Overview of your work and recent activity"
        badge={null}
      />

      {/* Quick Actions Bar */}
      <div className="flex flex-wrap gap-3 px-8">
        <Link href="/app/jobs">
          <Button variant="outline" className="gap-2">
            <Briefcase className="h-4 w-4" />
            View Jobs
          </Button>
        </Link>
        <Link href="/app/clients">
          <Button variant="outline" className="gap-2">
            <Building2 className="h-4 w-4" />
            View Clients
          </Button>
        </Link>
        <Link href="/app/surveys">
          <Button variant="outline" className="gap-2">
            <Camera className="h-4 w-4" />
            View Surveys
          </Button>
        </Link>
        <Link href="/app/templates">
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </Button>
        </Link>
      </div>

      <div className="px-8 pb-8 space-y-6">
        {/* Summary Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Active Jobs */}
          <Card className="bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/20">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-blue-600" />
                Active Jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-blue-600">{jobStats.active}</span>
                <span className="text-sm text-muted-foreground">
                  of {jobStats.total} total
                </span>
              </div>
              <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                <span>{jobStats.planned} planned</span>
                <span>•</span>
                <span>{jobStats.completed} completed</span>
              </div>
            </CardContent>
          </Card>

          {/* Clients */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                Clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{clientStats.total}</span>
                {clientStats.withActiveJobs > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {clientStats.withActiveJobs} with active work
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Surveys This Month */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <Camera className="h-3.5 w-3.5" />
                Surveys
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{surveyStats.total}</span>
                <span className="text-sm text-muted-foreground">total</span>
              </div>
              <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
                <span>{surveyStats.thisMonth} this month</span>
                <span>•</span>
                <span>{surveyStats.totalPhotos} photos</span>
              </div>
            </CardContent>
          </Card>

          {/* Activity Indicator */}
          <Card className="bg-gradient-to-br from-green-50 to-transparent dark:from-green-950/20">
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-green-600" />
                Recent Activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-green-600">{jobStats.recentlyActive}</span>
                <span className="text-sm text-muted-foreground">
                  jobs active this week
                </span>
              </div>
              {mostRecentJob && (
                <p className="mt-2 text-xs text-muted-foreground truncate">
                  Latest: {mostRecentJob.name}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Projects Overview */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5" />
                Instructions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{hoursStats.totalInstructions}</span>
                <span className="text-sm text-muted-foreground">total instructions</span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {hoursStats.thisWeek.toFixed(1)} hours tracked
              </div>
            </CardContent>
          </Card>

          {/* Total Updates */}
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5" />
                Updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{allUpdates.length}</span>
                <span className="text-sm text-muted-foreground">total entries</span>
              </div>
              {allUpdates.length > 0 && allUpdates[0] && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Latest {formatRelativeTime(allUpdates[0].created_at)}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Jump to Recent Job */}
          {mostRecentJob && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  Continue Working
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/app/jobs/${mostRecentJob.id}`}>
                  <Button variant="ghost" className="w-full justify-between h-auto py-2 px-3 -mx-3">
                    <div className="text-left">
                      <p className="font-medium truncate max-w-[200px]">{mostRecentJob.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {allUpdates[0] && formatRelativeTime(allUpdates[0].created_at)}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Unified Updates Timeline */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-muted-foreground" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Latest updates across all jobs
                </CardDescription>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUpdatesPage(p => Math.max(0, p - 1))}
                    disabled={updatesPage === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {updatesPage + 1} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setUpdatesPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={updatesPage >= totalPages - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {paginatedUpdates.length > 0 ? (
              <div className="space-y-4">
                {paginatedUpdates.map((update, index) => (
                  <div key={update.id || index} className="flex gap-3">
                    {/* Avatar */}
                    <div className="shrink-0">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                        {getInitials(update.author_name, update.author_initials)}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm">
                            <span className="font-medium">{update.author_name || "Unknown"}</span>
                            <span className="text-muted-foreground"> • </span>
                            <Link 
                              href={`/app/jobs/${update.job_id}`}
                              className="text-primary hover:underline"
                            >
                              {update.job_name}
                            </Link>
                            {update.source_project_name && (
                              <span className="text-muted-foreground">
                                {" "}→ {update.source_project_name}
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground mt-0.5 break-words">
                            {update.text}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatRelativeTime(update.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Activity className="h-12 w-12 mb-4 opacity-20" />
                <p>No activity found.</p>
                <p className="text-sm">Updates from your jobs will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
