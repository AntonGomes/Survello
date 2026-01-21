"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { 
  Building2, 
  MapPin, 
  FileText, 
  Briefcase, 
  Files,
  DollarSign,
  Clock,
  Camera,
  Calendar,
  User,
  FolderOpen,
  Image as ImageIcon,
  ChevronRight,
  Plus,
  Settings2,
  ChevronDown,
  Sparkles,
  Timer,
} from "lucide-react"
import Link from "next/link"
import { format, differenceInDays } from "date-fns"
import { Label, Pie, PieChart } from "recharts"

import { readJobOptions, readSurveysOptions, addJobUpdateMutation, updateProjectMutation, getCurrentTimerOptions } from "@/client/@tanstack/react-query.gen"
import { FeeType, ProjectStatus, UserRole } from "@/client"
import { FeatureHeader } from "@/components/feature-header"
import { CreateProjectDialog } from "@/components/create-project-dialog"
import { CreateSurveyDialog } from "@/components/create-survey-dialog"
import { UpdateFeed } from "@/components/update-feed"
import { EditProjectDialog } from "@/components/edit-project-dialog"
import { JobTimeTrackingModal } from "@/components/job-time-tracking-modal"
import { Spinner } from "@/components/ui/spinner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/context/auth-context"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// Chart config for project status donut chart
const statusChartConfig = {
  count: {
    label: "Projects",
  },
  planned: {
    label: "Planned",
    color: "hsl(215 16% 47%)", // slate-400
  },
  active: {
    label: "Active",
    color: "hsl(217 91% 60%)", // blue-500
  },
  completed: {
    label: "Completed",
    color: "hsl(142 71% 45%)", // green-500
  },
  archived: {
    label: "Archived",
    color: "hsl(220 9% 46%)", // gray-500
  },
} satisfies ChartConfig

// Weather condition labels for display
const weatherLabels: Record<string, string> = {
  sunny: "☀️ Sunny",
  partly_cloudy: "⛅ Partly Cloudy",
  cloudy: "☁️ Cloudy",
  overcast: "🌥️ Overcast",
  light_rain: "🌧️ Light Rain",
  rain: "🌧️ Rain",
  heavy_rain: "🌧️ Heavy Rain",
  showers: "🌦️ Showers",
  drizzle: "🌧️ Drizzle",
  thunderstorm: "⛈️ Thunderstorm",
  snow: "❄️ Snow",
  sleet: "🌨️ Sleet",
  hail: "🌨️ Hail",
  fog: "🌫️ Fog",
  mist: "🌫️ Mist",
  windy: "💨 Windy",
  clear: "🌙 Clear",
  frost: "🥶 Frost",
  hot: "🔥 Hot",
  cold: "❄️ Cold",
}

// Donut chart component for project status
function StatusPieChart({ 
  data
}: { 
  data: { status: string; count: number; fill: string }[]
}) {
  const total = useMemo(() => {
    return data.reduce((sum, d) => sum + d.count, 0)
  }, [data])
  
  // Filter out zero-count statuses
  const chartData = data.filter(d => d.count > 0)
  
  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-[100px] w-[100px] rounded-full bg-muted mx-auto">
        <span className="text-xs text-muted-foreground">No projects</span>
      </div>
    )
  }

  return (
    <ChartContainer
      config={statusChartConfig}
      className="mx-auto aspect-square h-[100px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="count"
          nameKey="status"
          innerRadius={30}
          outerRadius={45}
          strokeWidth={2}
        >
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-xl font-bold"
                    >
                      {total}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 14}
                      className="fill-muted-foreground text-[10px]"
                    >
                      total
                    </tspan>
                  </text>
                )
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}

export default function JobDetailPage() {
  const params = useParams<{ id: string }>()
  const jobId = parseInt(params.id)
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState("overview")
  const [expandedSurveys, setExpandedSurveys] = useState<Set<number>>(new Set())
  const [projectStatusFilter, setProjectStatusFilter] = useState<string>("all")
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false)
  const [selectedProjectIdForTime, setSelectedProjectIdForTime] = useState<number | undefined>(undefined)
  
  // Helper to open time modal with optional project pre-selected
  const openTimeModal = (projectId?: number) => {
    setSelectedProjectIdForTime(projectId)
    setIsTimeModalOpen(true)
  }
  
  const { data: job, isLoading, error } = useQuery({
    ...readJobOptions({ path: { job_id: jobId } })
  })

  // Check if there's an active timer for this job
  const { data: activeTimer } = useQuery({
    ...getCurrentTimerOptions(),
    refetchInterval: 1000 * 60, // Poll every minute
  })

  const hasActiveTimerForJob = activeTimer && job?.projects?.some(p => p.id === activeTimer.project_id)

  const { data: surveys, isLoading: isLoadingSurveys } = useQuery({
    ...readSurveysOptions({ query: { job_id: jobId } }),
    enabled: !!jobId,
  })

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

  const { mutate: updateProject } = useMutation({
    ...updateProjectMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: readJobOptions({ path: { job_id: jobId } }).queryKey,
      })
    },
    onError: () => {
      toast.error("Failed to update project")
    },
  })

  // Compute project status breakdown for pie chart
  const projectStatusData = useMemo(() => {
    if (!job?.projects) return []
    const counts: Record<string, number> = {
      planned: 0,
      active: 0,
      completed: 0,
      archived: 0,
    }
    job.projects.forEach(p => {
      const status = p.status || 'planned'
      counts[status] = (counts[status] || 0) + 1
    })
    return Object.entries(counts).map(([status, count]) => ({
      status,
      count,
      fill: `var(--color-${status})`,
    }))
  }, [job?.projects])

  // Compute total images from surveys
  const totalSurveyImages = useMemo(() => {
    if (!surveys) return 0
    return surveys.reduce((sum, s) => sum + (s.photo_count || 0), 0)
  }, [surveys])

  // Find most recent survey
  const mostRecentSurvey = useMemo(() => {
    if (!surveys || surveys.length === 0) return null
    return [...surveys].sort((a, b) => 
      new Date(b.conducted_date).getTime() - new Date(a.conducted_date).getTime()
    )[0]
  }, [surveys])

  // Compute most common weather across surveys
  const mostCommonWeather = useMemo(() => {
    if (!surveys || surveys.length === 0) return null
    const weatherCounts: Record<string, number> = {}
    surveys.forEach(s => {
      if (s.weather) {
        weatherCounts[s.weather] = (weatherCounts[s.weather] || 0) + 1
      }
    })
    const entries = Object.entries(weatherCounts)
    if (entries.length === 0) return null
    const sorted = entries.sort((a, b) => b[1] - a[1])
    const top = sorted[0]
    if (!top) return null
    return { weather: top[0], count: top[1] }
  }, [surveys])

  // Find next deadline (project with nearest deadline in future)
  const nextDeadlineProject = useMemo(() => {
    if (!job?.projects) return null
    const now = new Date()
    const projectsWithDeadlines = job.projects
      .filter(p => p.deadline && new Date(p.deadline) > now)
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime())
    return projectsWithDeadlines[0] || null
  }, [job?.projects])

  const handleAddUpdate = (text: string) => {
    if (!user) return
    addUpdate({
      path: { job_id: jobId },
      body: { text },
    })
  }

  const handleAddUpdateAsync = async (text: string) => {
    handleAddUpdate(text)
  }

  const toggleSurveyExpanded = (surveyId: number) => {
    setExpandedSurveys(prev => {
      const next = new Set(prev)
      if (next.has(surveyId)) {
        next.delete(surveyId)
      } else {
        next.add(surveyId)
      }
      return next
    })
  }

  // Filter projects by status
  const filteredProjects = useMemo(() => {
    if (!job?.projects) return []
    if (projectStatusFilter === "all") return job.projects
    return job.projects.filter(p => (p.status || "planned") === projectStatusFilter)
  }, [job?.projects, projectStatusFilter])

  // Handle status change for a project
  const handleProjectStatusChange = (projectId: number, newStatus: ProjectStatus) => {
    updateProject({
      path: { project_id: projectId },
      body: { status: newStatus },
    })
    toast.success(`Status updated to ${newStatus}`)
  }

  // Handle time logged from modal - adds to job updates
  const handleTimeLogged = (
    projectName: string, 
    description: string, 
    durationMinutes: number, 
    collaboratorNames?: string[]
  ) => {
    const hours = Math.floor(durationMinutes / 60)
    const mins = durationMinutes % 60
    const timeText = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
    let updateText = description 
      ? `**Time logged on ${projectName}: ${timeText}** — ${description}`
      : `**Time logged on ${projectName}: ${timeText}**`
    
    if (collaboratorNames && collaboratorNames.length > 0) {
      updateText += ` (with ${collaboratorNames.join(", ")})`
    }
    
    handleAddUpdate(updateText)
  }

  const isAdmin = user?.role === UserRole.ADMIN

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 h-full">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Job not found
      </div>
    )
  }

  const timelineUpdates = (job.updates || []) as import("@/components/update-feed").UpdateItem[]

  return (
    <div className="flex flex-col gap-6">
      <FeatureHeader
        title={job.name}
        breadcrumbs={[
            { label: "Jobs", href: "/app/jobs" },
            { label: job.name }
        ]}
      >
        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
            <Badge variant="outline" className="capitalize">
                {job.status}
            </Badge>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                <Link href={`/app/clients/${job.client.id}`} className="hover:underline">
                  {job.client.name}
                </Link>
            </div>
            {job.address && (
                <>
                    <Separator orientation="vertical" className="h-4" />
                    <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        <span>{job.address}</span>
                    </div>
                </>
            )}
        </div>
      </FeatureHeader>

      <div className="px-8 pb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start mb-6">
            <TabsTrigger value="overview" className="gap-2">
              <Building2 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="projects" className="gap-2">
              <Briefcase className="h-4 w-4" />
              Projects
            </TabsTrigger>
            <TabsTrigger value="surveys" className="gap-2">
              <Camera className="h-4 w-4" />
              Surveys
            </TabsTrigger>
            <TabsTrigger value="files" className="gap-2">
              <Files className="h-4 w-4" />
              Files
            </TabsTrigger>
            <TabsTrigger value="docgen" className="gap-2">
              <Sparkles className="h-4 w-4" />
              DocGen
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Overview Cards Grid - Full Width */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Hero Card - Job Details */}
              <Card className="lg:col-span-1">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium">Job Details</CardTitle>
                    <Badge variant="outline" className="capitalize">
                      {job.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Client */}
                  <div className="flex items-start gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground mb-0.5">Client</p>
                      <Link 
                        href={`/app/clients/${job.client.id}`}
                        className="text-sm font-medium text-primary hover:underline truncate block"
                      >
                        {job.client.name}
                      </Link>
                    </div>
                  </div>
                  
                  {/* Address */}
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground mb-0.5">Address</p>
                      <p className="text-sm font-medium">
                        {job.address || <span className="text-muted-foreground italic font-normal">Not set</span>}
                      </p>
                    </div>
                  </div>
                  
                  {/* Created Date */}
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground mb-0.5">Created</p>
                      <p className="text-sm font-medium">
                        {format(new Date(job.created_at), "d MMM yyyy")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Projects Status Card with Pie Chart & Next Deadline */}
              <Card className="lg:col-span-1">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium">Projects</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <StatusPieChart data={projectStatusData} />
                    <div className="space-y-1 flex-1">
                      {projectStatusData.filter(d => d.count > 0).map(d => {
                        const config = statusChartConfig[d.status as keyof typeof statusChartConfig]
                        const color = config && 'color' in config ? config.color : undefined
                        return (
                          <div key={d.status} className="flex items-center gap-2 text-sm">
                            <div 
                              className="w-2 h-2 rounded-full shrink-0" 
                              style={{ backgroundColor: color }} 
                            />
                            <span className="text-muted-foreground capitalize">{d.status}</span>
                            <span className="font-medium">{d.count}</span>
                          </div>
                        )
                      })}
                      {projectStatusData.every(d => d.count === 0) && (
                        <p className="text-sm text-muted-foreground italic">No projects yet</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Next Deadline */}
                  <div className="pt-3 border-t">
                    <div className="flex items-start gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground mb-0.5">Next Deadline</p>
                        {nextDeadlineProject ? (
                          <div>
                            <p className="text-sm font-medium">
                              {format(new Date(nextDeadlineProject.deadline!), "d MMM yyyy")}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {nextDeadlineProject.name}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No upcoming deadlines</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Surveys & Images Card */}
              <Card className="lg:col-span-1">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium">Surveys</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Survey Count */}
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <Camera className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                      <p className="text-2xl font-bold">{surveys?.length || 0}</p>
                      <p className="text-xs text-muted-foreground">Surveys</p>
                    </div>
                    
                    {/* Image Count */}
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <ImageIcon className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                      <p className="text-2xl font-bold">{totalSurveyImages}</p>
                      <p className="text-xs text-muted-foreground">Photos</p>
                    </div>
                  </div>
                  
                  {/* Most Recent Survey */}
                  {mostRecentSurvey && (
                    <div className="pt-3 border-t">
                      <div className="flex items-start gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-muted-foreground mb-0.5">Most Recent Survey</p>
                          <p className="text-sm font-medium">
                            {format(new Date(mostRecentSurvey.conducted_date), "d MMM yyyy")}
                          </p>
                          {mostRecentSurvey.conducted_by_user && (
                            <p className="text-xs text-muted-foreground">
                              by {mostRecentSurvey.conducted_by_user.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Two Column Layout: Left (Quick Actions) | Right (Updates) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Quick Actions */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Record Time Button */}
                  <Button
                    onClick={() => openTimeModal()}
                    variant="outline"
                    size="lg"
                    className={cn(
                      "h-auto py-4 flex-col gap-2 transition-all border-2",
                      hasActiveTimerForJob
                        ? "bg-red-50 hover:bg-red-100 text-red-700 border-red-300"
                        : "bg-red-50/50 hover:bg-red-100 text-red-600 border-red-300"
                    )}
                  >
                    {hasActiveTimerForJob ? (
                      <>
                        <div className="relative flex h-5 w-5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500"></span>
                        </div>
                        <span className="text-sm font-medium">Recording...</span>
                      </>
                    ) : (
                      <>
                        <Timer className="h-5 w-5" />
                        <span className="text-sm font-medium">Record Time</span>
                      </>
                    )}
                  </Button>

                  {/* Create Project Button */}
                  <CreateProjectDialog 
                    jobId={job.id} 
                    trigger={
                      <Button
                        variant="outline"
                        size="lg"
                        className="h-auto py-4 flex-col gap-2 w-full"
                      >
                        <Briefcase className="h-5 w-5" />
                        <span className="text-sm font-medium">New Project</span>
                      </Button>
                    }
                  />

                  {/* Create Survey Button */}
                  <CreateSurveyDialog 
                    jobId={job.id} 
                    trigger={
                      <Button
                        variant="outline"
                        size="lg"
                        className="h-auto py-4 flex-col gap-2 w-full"
                      >
                        <Camera className="h-5 w-5" />
                        <span className="text-sm font-medium">New Survey</span>
                      </Button>
                    }
                  />
                </div>
              </div>

              {/* Right Column - Updates */}
              <div className="lg:col-span-1">
                <UpdateFeed
                  updates={timelineUpdates}
                  currentUserId={user?.id ?? 0}
                  onAddUpdate={handleAddUpdateAsync}
                  isLoading={isAddingUpdate}
                  showDeleteButton={false}
                  maxInitialItems={10}
                />
              </div>
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-4">
            {/* Projects List Header with Status Filter */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold">All Projects</h3>
                <Select value={projectStatusFilter} onValueChange={setProjectStatusFilter}>
                  <SelectTrigger className="w-[140px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <CreateProjectDialog jobId={job.id} />
            </div>

            {/* Scrollable Projects List - max height on desktop, natural scroll on mobile */}
            {filteredProjects.length > 0 ? (
              <div className="space-y-4 lg:max-h-[calc(100vh-280px)] lg:overflow-y-auto lg:pr-2">
                {filteredProjects.map((project) => {
                  const isHourlyOrMixed = project.fee_type === FeeType.HOURLY || project.fee_type === FeeType.MIXED
                  const daysUntilDeadline = project.deadline 
                    ? differenceInDays(new Date(project.deadline), new Date()) 
                    : null
                  const isOverdue = daysUntilDeadline !== null && daysUntilDeadline < 0
                  const hoursUsed = project.actual_hours ?? 0
                  const hoursForecasted = project.forecasted_billable_hours ?? 0
                  const hoursPercent = hoursForecasted > 0 ? Math.min((hoursUsed / hoursForecasted) * 100, 100) : 0
                  
                  // Status styling
                  const statusStyles: Record<string, string> = {
                    planned: "bg-slate-100 text-slate-700",
                    active: "bg-blue-100 text-blue-700",
                    completed: "bg-green-100 text-green-700",
                    archived: "bg-gray-100 text-gray-700",
                  }
                  const currentStatus = project.status || "planned"
                  
                  return (
                    <Card key={project.id} className="overflow-hidden hover:border-primary/50 transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                          <Link href={`/app/projects/${project.id}`} className="min-w-0 flex-1 hover:opacity-80">
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle className="text-lg font-medium truncate">
                                {project.name}
                              </CardTitle>
                              <Badge variant="outline" className="shrink-0 text-xs font-normal">
                                {project.project_type?.name || "Project"}
                              </Badge>
                            </div>
                            <CardDescription className="line-clamp-2">
                              {project.description || "No description"}
                            </CardDescription>
                          </Link>
                          <div className="flex items-center gap-2 shrink-0">
                            {/* Status Dropdown */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className={cn("gap-1 h-7 px-2", statusStyles[currentStatus])}
                                >
                                  {currentStatus}
                                  <ChevronDown className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {Object.values(ProjectStatus).map((status) => (
                                  <DropdownMenuItem 
                                    key={status}
                                    onClick={() => handleProjectStatusChange(project.id, status)}
                                    className={cn(currentStatus === status && "bg-muted")}
                                  >
                                    <div className={cn(
                                      "w-2 h-2 rounded-full mr-2",
                                      status === "planned" && "bg-slate-400",
                                      status === "active" && "bg-blue-500",
                                      status === "completed" && "bg-green-500",
                                      status === "archived" && "bg-gray-400",
                                    )} />
                                    <span className="capitalize">{status}</span>
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                            
                            {/* Edit button - admin only */}
                            {isAdmin && (
                              <EditProjectDialog 
                                project={project} 
                                jobId={job.id}
                                trigger={
                                  <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <Settings2 className="h-4 w-4" />
                                  </Button>
                                }
                              />
                            )}
                            
                            {/* Record Time Button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => openTimeModal(project.id)}
                            >
                              <Timer className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 space-y-3">
                        {/* Project Info Row */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          {/* Deadline */}
                          {project.deadline && (
                            <div className={cn(
                              "flex items-center gap-1",
                              isOverdue && "text-red-600"
                            )}>
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{format(new Date(project.deadline), "d MMM yyyy")}</span>
                              {daysUntilDeadline !== null && (
                                <span className="text-xs opacity-60">
                                  ({isOverdue ? `${Math.abs(daysUntilDeadline)}d overdue` : `${daysUntilDeadline}d`})
                                </span>
                              )}
                            </div>
                          )}
                          
                          {/* Hours - for hourly projects */}
                          {isHourlyOrMixed && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{hoursUsed}h / {hoursForecasted}h</span>
                            </div>
                          )}
                          
                          {/* Rate - admin only */}
                          {isAdmin && isHourlyOrMixed && project.rate && project.rate > 0 && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3.5 w-3.5" />
                              <span>£{project.rate}/hr</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Hours Progress Bar - for hourly projects */}
                        {isHourlyOrMixed && hoursForecasted > 0 && (
                          <div className="space-y-1">
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  hoursPercent >= 100 ? "bg-red-500" : "bg-primary"
                                )}
                                style={{ width: `${hoursPercent}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : job.projects && job.projects.length > 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No projects match the selected filter.
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-12 text-center">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-medium mb-1">No projects yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first project for this job.
                </p>
                <CreateProjectDialog jobId={job.id} />
              </div>
            )}
          </TabsContent>

          {/* Surveys Tab */}
          <TabsContent value="surveys" className="space-y-4">
            {/* Surveys List Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">All Surveys</h2>
              <CreateSurveyDialog jobId={job.id} />
            </div>

            {/* Scrollable Surveys List - max height on desktop, natural scroll on mobile */}
            {isLoadingSurveys ? (
              <div className="flex justify-center py-12">
                <Spinner className="h-8 w-8" />
              </div>
            ) : surveys && surveys.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:max-h-[calc(100vh-240px)] lg:overflow-y-auto lg:pr-2">
                {surveys.map((survey) => (
                  <Link key={survey.id} href={`/app/surveys/${survey.id}`}>
                    <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <CardTitle className="text-base font-medium">
                              {format(new Date(survey.conducted_date), "EEEE, d MMMM yyyy")}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2">
                            {survey.photo_count !== undefined && survey.photo_count > 0 && (
                              <Badge variant="secondary">
                                {survey.photo_count} photos
                              </Badge>
                            )}
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                        {survey.project && (
                          <Badge variant="outline" className="w-fit mt-1">
                            {survey.project.name}
                          </Badge>
                        )}
                      </CardHeader>
                      <CardContent className="pt-0">
                        {(survey.site_notes || survey.notes) && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {survey.site_notes || survey.notes}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {(survey.conducted_by_user || survey.surveyor) && (
                            <div className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5" />
                              <span>{survey.conducted_by_user?.name || survey.surveyor?.name}</span>
                            </div>
                          )}
                          {survey.weather && (
                            <span>{survey.weather}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-12 text-center">
                <Camera className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-medium mb-1">No surveys yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Record your first site survey.
                </p>
                <CreateSurveyDialog jobId={job.id} />
              </div>
            )}
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Files</h2>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add File
              </Button>
            </div>

            <div className="space-y-4">
              {/* Job Files */}
              {job.files && job.files.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Job Files</h3>
                  <div className="rounded-md border">
                    <div className="divide-y">
                      {job.files.map((file) => (
                        <div key={file.id} className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors">
                          <FileText className="h-4 w-4 text-primary shrink-0" />
                          <span className="flex-1 truncate text-sm font-medium">{file.file_name}</span>
                          <Badge variant="outline" className="font-mono text-[10px] uppercase">
                            {file.role}
                          </Badge>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {file.size_bytes ? `${(file.size_bytes / 1024).toFixed(1)} KB` : "—"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Project Files */}
              {job.projects && job.projects.some(p => p.id) && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Project Files</h3>
                  <div className="rounded-md border divide-y">
                    {job.projects.map((project) => (
                      <div key={project.id} className="p-3">
                        <div className="flex items-center gap-2 text-sm">
                          <FolderOpen className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{project.name}</span>
                          <span className="text-muted-foreground text-xs">
                            (View in project)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Survey Images (as accordion folders) */}
              {surveys && surveys.some(s => (s.photo_count || 0) > 0) && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Survey Photos</h3>
                  <div className="rounded-md border divide-y">
                    {surveys.filter(s => (s.photo_count || 0) > 0).map((survey) => (
                      <Collapsible
                        key={survey.id}
                        open={expandedSurveys.has(survey.id)}
                        onOpenChange={() => toggleSurveyExpanded(survey.id)}
                      >
                        <CollapsibleTrigger className="flex items-center gap-3 p-3 w-full hover:bg-muted/50 transition-colors">
                          <ChevronRight 
                            className={cn(
                              "h-4 w-4 text-muted-foreground transition-transform",
                              expandedSurveys.has(survey.id) && "rotate-90"
                            )} 
                          />
                          <ImageIcon className="h-4 w-4 text-amber-500" />
                          <span className="flex-1 text-left text-sm font-medium">
                            Survey - {format(new Date(survey.conducted_date), "d MMM yyyy")}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {survey.photo_count} photos
                          </Badge>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="px-10 pb-3 text-sm text-muted-foreground">
                            <p>Photos will be displayed here once loaded.</p>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {(!job.files || job.files.length === 0) && 
               (!surveys || surveys.every(s => (s.photo_count || 0) === 0)) && (
                <div className="rounded-lg border border-dashed p-12 text-center">
                  <Files className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-medium mb-1">No files yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload files to this job.
                  </p>
                  <Button size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add File
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* DocGen Tab */}
          <TabsContent value="docgen" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI Document Generation
                </CardTitle>
                <CardDescription>
                  Generate professional reports and documentation using AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-dashed">
                  <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="font-medium mb-2">Generate Documents with AI</h3>
                  <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
                    Create professional reports by uploading context files (photos, notes) and a template. 
                    The AI will generate a completed document for you.
                  </p>
                  <Link href={`/app/generate?jobId=${job.id}`}>
                    <Button size="lg" className="gap-2">
                      <Sparkles className="h-4 w-4" />
                      Open Document Generator
                    </Button>
                  </Link>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Camera className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Survey Photos</span>
                    </div>
                    <p className="text-2xl font-bold">
                      {surveys?.reduce((sum, s) => sum + (s.photo_count || 0), 0) || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Available for context</p>
                  </div>
                  <div className="p-4 rounded-lg border bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Files className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Job Files</span>
                    </div>
                    <p className="text-2xl font-bold">{job.files?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">Available for context</p>
                  </div>
                  <div className="p-4 rounded-lg border bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Projects</span>
                    </div>
                    <p className="text-2xl font-bold">{job.projects?.length || 0}</p>
                    <p className="text-xs text-muted-foreground">For attaching outputs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Job Time Tracking Modal */}
      <JobTimeTrackingModal
        open={isTimeModalOpen}
        onOpenChange={setIsTimeModalOpen}
        jobId={job.id}
        projects={job.projects || []}
        onTimeLogged={handleTimeLogged}
        defaultProjectId={selectedProjectIdForTime}
      />
    </div>
  )
}
