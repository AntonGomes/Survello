"use client"

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
  User
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

import { readJobOptions, readSurveysOptions, addJobUpdateMutation } from "@/client/@tanstack/react-query.gen"
import { FeatureHeader } from "@/components/feature-header"
import { CreateProjectDialog } from "@/components/create-project-dialog"
import { CreateSurveyDialog } from "@/components/create-survey-dialog"
import { UpdatesTimeline } from "@/components/updates-timeline"
import { Spinner } from "@/components/ui/spinner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/context/auth-context"
import { toast } from "sonner"

export default function JobDetailPage() {
  const params = useParams<{ id: string }>()
  const jobId = parseInt(params.id)
  const { user } = useAuth()
  const queryClient = useQueryClient()
  
  const { data: job, isLoading, error } = useQuery({
    ...readJobOptions({ path: { job_id: jobId } })
  })

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

  const handleAddUpdate = (text: string) => {
    if (!user) return
    addUpdate({
      path: { job_id: jobId },
      body: { text },
    })
  }

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

  // Transform updates for the timeline
  const timelineUpdates = (job.updates || []).map((update) => {
    const u = update as Record<string, unknown>
    const userData = u.user as { id?: number; name?: string } | undefined
    return {
      text: String(u.text || ''),
      user_id: userData?.id ?? 0,
      user_name: userData?.name ?? 'Unknown',
      created_at: String(u.timestamp || new Date().toISOString()),
    }
  })

  const handleAddUpdateAsync = async (text: string) => {
    handleAddUpdate(text)
  }

  return (
    <div className="flex flex-col gap-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-8 pb-8">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-8">
          {/* Projects Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-muted-foreground" />
                Projects
              </h2>
              <CreateProjectDialog jobId={job.id} />
            </div>
            
            {job.projects && job.projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {job.projects.map((project) => (
                  <Link key={project.id} href={`/app/projects/${project.id}`} className="block h-full">
                  <Card className="group hover:border-primary/50 transition-colors cursor-pointer h-full">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base font-medium truncate pr-4">
                            {project.name}
                          </CardTitle>
                          <Badge variant="secondary" className="scale-90 capitalize">
                            {project.status || 'Planned'}
                          </Badge>
                        </div>
                        <CardDescription className="line-clamp-2 text-xs">
                          {project.description || "No description provided"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center justify-between border-b border-border/50 pb-2">
                              <span className="flex items-center gap-1.5 text-xs">
                                  <DollarSign className="h-3.5 w-3.5" /> Rate
                              </span>
                              <span className="font-medium text-foreground">
                                  {project.rate ? `£${project.rate}/hr` : '—'}
                              </span>
                          </div>
                          <div className="flex items-center justify-between pt-1">
                              <span className="flex items-center gap-1.5 text-xs">
                                  <Clock className="h-3.5 w-3.5" /> Forecast
                              </span>
                              <span className="font-medium text-foreground">
                                  {project.forecasted_billable_hours ?? 0} hrs
                              </span>
                          </div>
                        </div>
                      </CardContent>
                  </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground bg-muted/20">
                No projects linked to this job yet.
              </div>
            )}
          </div>

          <Separator />

          {/* Surveys Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
                <Camera className="h-5 w-5 text-muted-foreground" />
                Surveys
              </h2>
              <CreateSurveyDialog jobId={job.id} />
            </div>

            {isLoadingSurveys ? (
              <div className="flex justify-center py-8">
                <Spinner className="h-6 w-6" />
              </div>
            ) : surveys && surveys.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {surveys.map((survey) => (
                  <Card key={survey.id} className="bg-muted/30">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <CardTitle className="text-sm font-medium">
                            {format(new Date(survey.date), "EEEE, d MMMM yyyy")}
                          </CardTitle>
                        </div>
                        {survey.photo_count !== undefined && survey.photo_count > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {survey.photo_count} photos
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {survey.surveyor && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>{survey.surveyor.name}</span>
                          </div>
                        )}
                        {survey.notes && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {survey.notes}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground bg-muted/20">
                No surveys recorded yet.
              </div>
            )}
          </div>

          <Separator />

          {/* Files Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
                <Files className="h-5 w-5 text-muted-foreground" />
                Files
              </h2>
              <Button variant="outline" size="sm">Upload File</Button>
            </div>

            {job.files && job.files.length > 0 ? (
              <div className="rounded-md border">
                <div className="grid grid-cols-[1fr_auto_auto] gap-4 p-3 bg-muted/40 font-medium text-xs text-muted-foreground border-b">
                  <div className="pl-2">Name</div>
                  <div>Role</div>
                  <div className="pr-2">Size</div>
                </div>
                <div className="divide-y">
                  {job.files.map((file) => (
                    <div key={file.id} className="grid grid-cols-[1fr_auto_auto] gap-4 p-3 text-sm hover:bg-muted/50 transition-colors items-center">
                      <div className="flex items-center gap-3 pl-2 max-w-full overflow-hidden">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <span className="truncate font-medium">{file.file_name}</span>
                      </div>
                      <div>
                          <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider">
                              {file.role}
                          </Badge>
                      </div>
                      <div className="text-muted-foreground text-xs pr-2 tabular-nums">
                        {file.size_bytes ? `${(file.size_bytes / 1024).toFixed(1)} KB` : "—"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground bg-muted/20">
                No files uploaded for this job.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Updates Timeline */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Updates</h2>
          <UpdatesTimeline
            updates={timelineUpdates}
            onAddUpdate={handleAddUpdateAsync}
            isLoading={isAddingUpdate}
          />
        </div>
      </div>
    </div>
  )
}
