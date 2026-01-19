"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { 
  Briefcase,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FileText,
  Calendar as CalendarIcon,
  StickyNote
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

import { 
  readProjectOptions, 
  readJobOptions, 
  readTasksOptions,
  updateProjectMutation 
} from "@/client/@tanstack/react-query.gen"
import { FeatureHeader } from "@/components/feature-header"
import { Spinner } from "@/components/ui/spinner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProjectBillingCard } from "@/components/project-billing-card"
import { KanbanBoard } from "@/components/kanban-board"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { toast } from "sonner"

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>()
  const projectId = parseInt(params.id)
  const queryClient = useQueryClient()
  
  const [notesValue, setNotesValue] = useState<string | null>(null)
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [isBillingOpen, setIsBillingOpen] = useState(false)
  
  const { data: project, isLoading, error } = useQuery({
    ...readProjectOptions({ path: { project_id: projectId } }),
  })

  const { data: job } = useQuery({
    ...readJobOptions({ path: { job_id: project?.job_id ?? -1 } }),
    enabled: !!project?.job_id
  })

  const { data: tasks, isLoading: isLoadingTasks } = useQuery({
    ...readTasksOptions({ query: { project_id: projectId } }),
    enabled: !!projectId,
  })

  const { mutate: updateProject, isPending: isUpdatingProject } = useMutation({
    ...updateProjectMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: readProjectOptions({ path: { project_id: projectId } }).queryKey,
      })
      setIsEditingNotes(false)
      toast.success("Notes saved")
    },
    onError: () => {
      toast.error("Failed to save notes")
    },
  })

  // Initialize notes value from project data
  if (project && notesValue === null) {
    setNotesValue(project.notes || "")
  }

  const handleSaveNotes = () => {
    updateProject({
      path: { project_id: projectId },
      body: { notes: notesValue || null },
    })
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

  return (
    <div className="flex flex-col gap-8">
      <FeatureHeader
        title={project.name}
        breadcrumbs={[
            { label: "Jobs", href: "/app/jobs" },
            { label: job?.name || "Loading...", href: project.job_id ? `/app/jobs/${project.job_id}` : "#" },
            { label: project.name }
        ]}
      >
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
      </FeatureHeader>

      <div className="space-y-8 px-8 pb-8">
        {/* Overview Section */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Description Card */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {project.description || "No description provided."}
              </p>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Tasks</span>
                <span className="font-medium">{tasks?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Fee Type</span>
                <span className="font-medium capitalize">{project.fee_type}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Rate</span>
                <span className="font-medium">
                  {project.rate ? `£${project.rate}/hr` : "—"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Tasks Section (Kanban) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-muted-foreground" />
              Tasks
            </h2>
          </div>

          {isLoadingTasks ? (
            <div className="flex justify-center py-8">
              <Spinner className="h-6 w-6" />
            </div>
          ) : (
            <KanbanBoard projectId={projectId} tasks={tasks || []} />
          )}
        </div>

        <Separator />

        {/* Notes Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
              <StickyNote className="h-5 w-5 text-muted-foreground" />
              Notes
            </h2>
            {!isEditingNotes && (
              <Button variant="outline" size="sm" onClick={() => setIsEditingNotes(true)}>
                Edit Notes
              </Button>
            )}
          </div>

          {isEditingNotes ? (
            <div className="space-y-3">
              <Textarea
                value={notesValue || ""}
                onChange={(e) => setNotesValue(e.target.value)}
                placeholder="Add notes about this project..."
                className="min-h-[150px]"
              />
              <div className="flex gap-2">
                <Button onClick={handleSaveNotes} disabled={isUpdatingProject}>
                  {isUpdatingProject ? "Saving..." : "Save Notes"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setNotesValue(project.notes || "")
                    setIsEditingNotes(false)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border p-4 bg-muted/20 min-h-[100px]">
              {project.notes ? (
                <p className="text-sm whitespace-pre-wrap">{project.notes}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No notes yet.</p>
              )}
            </div>
          )}
        </div>

        <Separator />

        {/* Billing Section (Collapsible) */}
        <Collapsible open={isBillingOpen} onOpenChange={setIsBillingOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
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
      </div>
    </div>
  )
}
