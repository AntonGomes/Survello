"use client"

import { useState, useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { 
  Briefcase,
  Calendar as CalendarIcon,
  Clock,
  Square,
  Sparkles,
  ChevronDown,
  Settings2,
  Timer,
  ArrowLeft,
  Pencil,
  Check,
  X,
  FileText,
} from "lucide-react"
import Link from "next/link"
import { format, differenceInDays, differenceInBusinessDays, addDays, eachWeekOfInterval } from "date-fns"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { 
  readProjectOptions, 
  readJobOptions, 
  updateProjectMutation,
  getProjectTimeEntriesOptions,
} from "@/client/@tanstack/react-query.gen"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TimeTrackingModal } from "@/components/time-tracking-modal"
import { EditProjectDialog } from "@/components/edit-project-dialog"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { useAuth } from "@/context/auth-context"
import { FeeType, UserRole, ProjectStatus } from "@/client/types.gen"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// Hours chart config for area chart with overlaid lines
const hoursChartConfig = {
  actual: {
    label: "Hours Worked",
    color: "var(--chart-1)",
  },
  expected: {
    label: "Expected Progress",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>()
  const projectId = parseInt(params.id)
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false)
  const [deadlineCalendarOpen, setDeadlineCalendarOpen] = useState(false)
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [editedDescription, setEditedDescription] = useState("")
  
  const { data: project, isLoading, error } = useQuery({
    ...readProjectOptions({ path: { project_id: projectId } }),
  })

  const { data: job } = useQuery({
    ...readJobOptions({ path: { job_id: project?.job_id ?? -1 } }),
    enabled: !!project?.job_id
  })

  // Fetch time entries for this project
  const { data: timeEntries = [] } = useQuery({
    ...getProjectTimeEntriesOptions({ path: { project_id: projectId } }),
  })

  const { mutate: updateProject, isPending: isUpdatingProject } = useMutation({
    ...updateProjectMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: readProjectOptions({ path: { project_id: projectId } }).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: getProjectTimeEntriesOptions({ path: { project_id: projectId } }).queryKey,
      })
      setIsEditingDescription(false)
    },
    onError: () => {
      toast.error("Failed to update project")
    },
  })

  const handleStatusChange = (newStatus: ProjectStatus) => {
    updateProject({
      path: { project_id: projectId },
      body: { status: newStatus },
    })
    toast.success(`Status changed to ${newStatus}`)
  }

  const handleDeadlineChange = (date: Date | undefined) => {
    updateProject({
      path: { project_id: projectId },
      body: { deadline: date ? format(date, "yyyy-MM-dd") : null },
    })
    setDeadlineCalendarOpen(false)
    if (date) {
      toast.success(`Deadline set to ${format(date, "d MMM yyyy")}`)
    } else {
      toast.success("Deadline removed")
    }
  }

  const handleSaveDescription = () => {
    updateProject({
      path: { project_id: projectId },
      body: { description: editedDescription },
    })
  }

  const handleStartEditingDescription = () => {
    setEditedDescription(project?.description || "")
    setIsEditingDescription(true)
  }

  const handleTimeLogged = () => {
    // Refresh the time entries and project data
    queryClient.invalidateQueries({
      queryKey: getProjectTimeEntriesOptions({ path: { project_id: projectId } }).queryKey,
    })
    queryClient.invalidateQueries({
      queryKey: readProjectOptions({ path: { project_id: projectId } }).queryKey,
    })
  }

  // Generate chart data for hours progress with overlayed lines
  const hoursChartData = useMemo(() => {
    if (!project?.deadline) return []
    
    const startDate = new Date(project.created_at)
    const deadline = new Date(project.deadline)
    const now = new Date()
    const forecasted = project.forecasted_billable_hours || 0
    const actual = project.actual_hours || 0
    
    if (forecasted === 0) return []
    
    // Generate weekly data points from start to deadline
    const weeks = eachWeekOfInterval({ start: startDate, end: deadline })
    const totalDays = Math.max(differenceInBusinessDays(deadline, startDate), 1)
    
    return weeks.map((weekStart, index) => {
      const daysPassed = differenceInBusinessDays(weekStart, startDate)
      const expectedProgress = Math.min((daysPassed / totalDays) * forecasted, forecasted)
      
      // Only show actual data up to current date
      const isInPast = weekStart <= now
      const actualAtPoint = isInPast 
        ? (index === weeks.length - 1 || addDays(weekStart, 7) > now) 
          ? actual 
          : Math.min(expectedProgress * (actual / (forecasted * (differenceInBusinessDays(now, startDate) / totalDays) || 1)), actual)
        : null
      
      return {
        week: format(weekStart, "MMM d"),
        actual: isInPast ? (index === weeks.length - 1 && now < deadline ? actual : actualAtPoint) : null,
        expected: Math.round(expectedProgress * 10) / 10,
      }
    })
  }, [project])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 h-full">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Project not found
      </div>
    )
  }

  const isAdmin = user?.role === UserRole.ADMIN
  const isHourlyProject = project.fee_type === FeeType.HOURLY || project.fee_type === FeeType.MIXED
  
  // Hours progress calculation
  const forecastedHours = project.forecasted_billable_hours || 0
  const actualHours = project.actual_hours || 0
  const isOverBudget = actualHours > forecastedHours && forecastedHours > 0
  
  // Deadline calculation
  const daysUntilDeadline = project.deadline 
    ? differenceInDays(new Date(project.deadline), new Date()) 
    : null
  const isOverdue = daysUntilDeadline !== null && daysUntilDeadline < 0

  // Status options
  const statusOptions = [
    { value: ProjectStatus.PLANNED, label: "Planned", color: "bg-slate-100 text-slate-700" },
    { value: ProjectStatus.ACTIVE, label: "Active", color: "bg-blue-100 text-blue-700" },
    { value: ProjectStatus.COMPLETED, label: "Completed", color: "bg-green-100 text-green-700" },
    { value: ProjectStatus.ARCHIVED, label: "Archived", color: "bg-gray-100 text-gray-700" },
  ] as const
  
  const currentStatus = statusOptions.find(s => s.value === project.status) ?? statusOptions[0]!

  return (
    <div className="container py-6 max-w-7xl">
      {/* Header with back navigation */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={project.job_id ? `/app/jobs/${project.job_id}` : "/app/jobs"}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">{project.name}</h1>
            <Badge variant="secondary" className="text-sm uppercase font-medium">
              {project.project_type?.name || "Project"}
            </Badge>
          </div>
          {job && (
            <p className="text-muted-foreground">
              <Link
                href={`/app/jobs/${job.id}`}
                className="hover:underline"
              >
                {job.name}
              </Link>
              {job.client && ` • ${job.client.name}`}
            </p>
          )}
        </div>
        
        {/* Record Time Button */}
        {isHourlyProject && (
          <Button
            onClick={() => setIsTimeModalOpen(true)}
            variant="outline"
            size="sm"
            className="gap-2 bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
          >
            <div className="h-4 w-4 bg-white rounded-sm flex items-center justify-center border border-red-200">
              <Square className="h-2 w-2 fill-red-500 text-red-500" />
            </div>
            Record Time
          </Button>
        )}
      </div>

      {/* Main content - two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Project details */}
        <div className="lg:col-span-1 space-y-6">
          {/* Project Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status */}
              <div className="flex items-center gap-3">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className={cn("gap-1 h-7 px-2 -ml-2", currentStatus.color)}>
                        {currentStatus.label}
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {statusOptions.map((status) => (
                        <DropdownMenuItem 
                          key={status.value}
                          onClick={() => handleStatusChange(status.value)}
                          className={cn(project.status === status.value && "bg-muted")}
                        >
                          <div className={cn("w-2 h-2 rounded-full mr-2", status.color.replace("text-", "bg-").split(" ")[0])} />
                          {status.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Deadline */}
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Deadline</p>
                  <Popover open={deadlineCalendarOpen} onOpenChange={setDeadlineCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={cn(
                          "gap-2 h-7 px-2 -ml-2",
                          isOverdue ? "text-red-600" : ""
                        )}
                      >
                        {project.deadline ? (
                          <>
                            {format(new Date(project.deadline), "d MMM yyyy")}
                            <span className="text-xs opacity-60">
                              {isOverdue ? `(${Math.abs(daysUntilDeadline!)}d overdue)` : `(${daysUntilDeadline}d)`}
                            </span>
                          </>
                        ) : (
                          <span className="text-muted-foreground">Set deadline</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={project.deadline ? new Date(project.deadline) : undefined}
                        onSelect={handleDeadlineChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Billing Type */}
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Billing Type</p>
                  <p className="font-medium capitalize">{project.fee_type}</p>
                </div>
              </div>

              {/* Hours Info - for hourly projects */}
              {isHourlyProject && (
                <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className={cn("text-2xl font-semibold", isOverBudget && "text-red-600")}>
                        {actualHours.toFixed(1)}
                      </p>
                      <p className="text-sm text-muted-foreground">Hours Worked</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-semibold">{forecastedHours}</p>
                      <p className="text-sm text-muted-foreground">Forecasted</p>
                    </div>
                  </div>
                </>
              )}

              {/* Admin: Edit Financials */}
              {isAdmin && job && (
                <>
                  <Separator />
                  <EditProjectDialog 
                    project={project}
                    jobId={job.id}
                    trigger={
                      <Button variant="outline" size="sm" className="w-full gap-1.5">
                        <Settings2 className="h-3.5 w-3.5" />
                        Edit Project Settings
                      </Button>
                    }
                  />
                </>
              )}
            </CardContent>
          </Card>

          {/* Description Card - with inline editing */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">Description</CardTitle>
              {!isEditingDescription && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleStartEditingDescription}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {isEditingDescription ? (
                <div className="space-y-2">
                  <Textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    rows={4}
                    className="resize-none"
                    placeholder="Add a description..."
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingDescription(false)}
                      disabled={isUpdatingProject}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveDescription}
                      disabled={isUpdatingProject}
                    >
                      {isUpdatingProject ? (
                        <Spinner className="h-4 w-4 mr-1" />
                      ) : (
                        <Check className="h-4 w-4 mr-1" />
                      )}
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                  {project.description || "No description."}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column - Chart, Time Entries, DocGen */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hours Progress Chart - Only show if deadline exists */}
          {project.deadline && forecastedHours > 0 && hoursChartData.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium">Hours Progress</CardTitle>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-2 rounded-sm" style={{ backgroundColor: "var(--color-actual)" }} />
                      <span>Hours Worked</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-2 rounded-sm" style={{ backgroundColor: "var(--color-expected)" }} />
                      <span>Expected</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ChartContainer config={hoursChartConfig} className="h-[200px] w-full">
                  <AreaChart
                    accessibilityLayer
                    data={hoursChartData}
                    margin={{ left: -20, right: 12 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="week"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => value.slice(0, 6)}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickCount={4}
                      tickFormatter={(value) => `${value}h`}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Area
                      dataKey="expected"
                      type="monotone"
                      fill="var(--color-expected)"
                      fillOpacity={0.2}
                      stroke="var(--color-expected)"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                    />
                    <Area
                      dataKey="actual"
                      type="monotone"
                      fill="var(--color-actual)"
                      fillOpacity={0.4}
                      stroke="var(--color-actual)"
                      strokeWidth={2}
                      connectNulls
                    />
                  </AreaChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )}

          {/* Recent Time Entries Log */}
          {timeEntries.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Timer className="h-4 w-4" />
                    Recent Time Entries
                  </CardTitle>
                  <span className="text-xs text-muted-foreground">
                    {timeEntries.length} {timeEntries.length === 1 ? "entry" : "entries"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {timeEntries.slice(0, 10).map((entry) => {
                  const hours = entry.duration_minutes ? Math.floor(entry.duration_minutes / 60) : 0
                  const mins = entry.duration_minutes ? entry.duration_minutes % 60 : 0
                  const timeText = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
                  
                  return (
                    <div key={entry.id} className="flex items-start justify-between py-2 border-b border-border/50 last:border-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <Badge variant="secondary" className="text-xs">
                            {timeText}
                          </Badge>
                          {entry.start_time && (
                            <>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-muted-foreground text-xs">
                                {format(new Date(entry.start_time), "d MMM, HH:mm")}
                              </span>
                            </>
                          )}
                        </div>
                        {entry.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2 ml-5">
                            {entry.description}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
                {timeEntries.length > 10 && (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    + {timeEntries.length - 10} more entries
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Doc Gen CTA */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-100">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-green-900 text-sm">Generate Document</p>
                    <p className="text-xs text-green-700/70">Create professional reports using AI</p>
                  </div>
                </div>
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Generate
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Time Tracking Modal */}
      <TimeTrackingModal
        projectId={projectId}
        projectName={project.name}
        open={isTimeModalOpen}
        onOpenChange={setIsTimeModalOpen}
        onTimeLogged={handleTimeLogged}
      />
    </div>
  )
}
