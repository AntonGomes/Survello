"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { 
  Briefcase,
  ChevronDown,
  ChevronRight,
  Calendar as CalendarIcon,
  FileText,
  Clock,
  User,
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

import { 
  readProjectOptions, 
  readJobOptions, 
  updateProjectMutation,
  addProjectUpdateMutation,
  deleteProjectUpdateMutation,
} from "@/client/@tanstack/react-query.gen"
import { FeatureHeader } from "@/components/feature-header"
import { Spinner } from "@/components/ui/spinner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProjectBillingCard } from "@/components/project-billing-card"
import { ProjectUpdateFeed, type ProjectUpdateItem } from "@/components/project-update-feed"
import { ProjectFiles } from "@/components/project-files"
import { TimeTrackingModal } from "@/components/time-tracking-modal"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useAuth } from "@/context/auth-context"
import { FeeType, UserRole } from "@/client/types.gen"
import { toast } from "sonner"

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>()
  const projectId = parseInt(params.id)
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  const [isBillingOpen, setIsBillingOpen] = useState(false)
  const [isFilesOpen, setIsFilesOpen] = useState(true)
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false)
  
  const { data: project, isLoading, error } = useQuery({
    ...readProjectOptions({ path: { project_id: projectId } }),
  })

  const { data: job } = useQuery({
    ...readJobOptions({ path: { job_id: project?.job_id ?? -1 } }),
    enabled: !!project?.job_id
  })

  const { mutate: updateProject, isPending: isUpdatingProject } = useMutation({
    ...updateProjectMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: readProjectOptions({ path: { project_id: projectId } }).queryKey,
      })
    },
    onError: () => {
      toast.error("Failed to update project")
    },
  })

  const { mutate: addUpdate, isPending: isAddingUpdate } = useMutation({
    ...addProjectUpdateMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: readProjectOptions({ path: { project_id: projectId } }).queryKey,
      })
      toast.success("Update added")
    },
    onError: () => {
      toast.error("Failed to add update")
    },
  })

  const { mutate: deleteUpdate } = useMutation({
    ...deleteProjectUpdateMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: readProjectOptions({ path: { project_id: projectId } }).queryKey,
      })
      toast.success("Update deleted")
    },
    onError: () => {
      toast.error("Failed to delete update")
    },
  })

  const handleAddUpdate = (text: string, timeEntryId?: number) => {
    addUpdate({
      path: { project_id: projectId },
      body: { text, time_entry_id: timeEntryId },
    })
  }

  const handleDeleteUpdate = (updateId: string) => {
    deleteUpdate({
      path: { project_id: projectId, update_id: updateId },
    })
  }

  const handleDescriptionChange = (description: string) => {
    updateProject({
      path: { project_id: projectId },
      body: { description },
    })
  }

  const handleTimeLogged = (description: string, durationMinutes: number, timeEntryId?: number) => {
    // Add an update about the time entry
    const hours = Math.floor(durationMinutes / 60)
    const mins = durationMinutes % 60
    const timeText = hours > 0 
      ? `${hours}h ${mins}m` 
      : `${mins}m`
    
    const updateText = description 
      ? `**Time logged: ${timeText}** — ${description}`
      : `**Time logged: ${timeText}**`
    
    handleAddUpdate(updateText, timeEntryId)
  }

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
  const isAssignedUser = project.lead_user_id === user?.id
  const isHourlyProject = project.fee_type === FeeType.HOURLY || project.fee_type === FeeType.MIXED

  // Parse updates from the project
  const updates: ProjectUpdateItem[] = (project.updates as unknown as ProjectUpdateItem[]) || []

  return (
    <div className="flex flex-col gap-6">
      <FeatureHeader
        title={project.name}
        breadcrumbs={[
            { label: "Jobs", href: "/app/jobs" },
            { label: job?.name || "Loading...", href: project.job_id ? `/app/jobs/${project.job_id}` : "#" },
            { label: project.name }
        ]}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
              <Badge variant="outline" className="capitalize">
                  {project.status || 'Planned'}
              </Badge>
              {project.deadline && (
                  <>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-1.5">
                      <CalendarIcon className="h-4 w-4" />
                      <span>Due {format(new Date(project.deadline), "MMM d, yyyy")}</span>
                  </div>
                  </>
              )}
              {project.lead_user_id && (
                  <>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-1.5">
                      <User className="h-4 w-4" />
                      <span>{isAssignedUser ? "Assigned to you" : "Assigned"}</span>
                  </div>
                  </>
              )}
              {project.job_id && (
                  <>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                      <Briefcase className="h-4 w-4" />
                      <Link href={`/app/jobs/${project.job_id}`}>
                          Back to Job
                      </Link>
                  </div>
                  </>
              )}
          </div>
          
          {/* Project Type Badge and Record Time - Top Right */}
          <div className="flex items-center gap-3">
            {isHourlyProject && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTimeModalOpen(true)}
                className="gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <Clock className="h-4 w-4" />
                Record Time
              </Button>
            )}
            <Badge variant="secondary" className="text-sm uppercase font-medium">
              {project.project_type?.name || "Project"}
            </Badge>
          </div>
        </div>
      </FeatureHeader>

      <div className="space-y-6 px-8 pb-8">
        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Updates Feed (2/3 width) */}
          <div className="lg:col-span-2">
            <div className="space-y-3">
              <ProjectUpdateFeed
                updates={updates}
                description={project.description ?? null}
                currentUserId={user?.id || 0}
                onAddUpdate={handleAddUpdate}
                onDeleteUpdate={handleDeleteUpdate}
                onDescriptionChange={handleDescriptionChange}
                isLoading={isUpdatingProject || isAddingUpdate}
              />
            </div>
          </div>

          {/* Right Column - Files */}
          <div className="space-y-6">
            <Collapsible open={isFilesOpen} onOpenChange={setIsFilesOpen}>
              <Card>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        Files
                      </span>
                      {isFilesOpen ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <ProjectFiles 
                      projectId={projectId} 
                      orgId={user?.org_id || 0}
                    />
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>
        </div>

        <Separator />

        {/* Billing Section - Only for Admins */}
        {isAdmin ? (
          <Collapsible open={isBillingOpen} onOpenChange={setIsBillingOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  Billing & Financials
                </h2>
                {isBillingOpen ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <ProjectBillingCard project={project} />
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <div className="text-sm text-muted-foreground italic">
            Billing information is only visible to administrators.
          </div>
        )}
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
