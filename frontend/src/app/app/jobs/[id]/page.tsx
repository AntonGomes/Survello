"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Building2, MapPin, Briefcase, Files, Camera, Sparkles } from "lucide-react"
import Link from "next/link"

import { UserRole, type JobReadDetail } from "@/client"
import { FeatureHeader } from "@/components/feature-header"
import { JobTimeTrackingModal } from "@/components/job-time-tracking-modal"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/context/auth-context"
import type { UpdateItem } from "@/components/update-feed"

import { useJobQueries, useJobUpdates, useJobComputedData, useTimeLogging } from "./use-job-detail"
import { OverviewTab } from "./job-overview-tab"
import { InstructionsTab } from "./job-instructions-tab"
import { SurveysTab } from "./job-surveys-tab"
import { FilesTab } from "./job-files-tab"
import { DocGenTab } from "./job-docgen-tab"

function JobHeaderMeta({ job }: {
  job: { status?: string | null; client: { id: number; name: string }; address?: string | null }
}) {
  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
      <Badge variant="outline" className="capitalize">{job.status ?? "planned"}</Badge>
      <Separator orientation="vertical" className="h-4" />
      <div className="flex items-center gap-1.5">
        <Building2 className="h-4 w-4" />
        <Link href={`/app/clients/${job.client.id}`} className="hover:underline">{job.client.name}</Link>
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
  )
}

export default function JobDetailPage() {
  const params = useParams<{ id: string }>()
  const jobId = parseInt(params.id)
  const { user } = useAuth()

  const [activeTab, setActiveTab] = useState("overview")
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false)
  const [selectedInstructionId, setSelectedInstructionId] = useState<number | undefined>(undefined)

  const queries = useJobQueries(jobId)
  const updates = useJobUpdates(jobId)
  const computed = useJobComputedData({
    instructions: queries.job?.instructions,
    surveys: queries.surveys as SurveyComputeInput[] | undefined,
  })
  const handleTimeLogged = useTimeLogging(updates.handleAddUpdate)

  const openTimeModal = (instructionId?: number) => {
    setSelectedInstructionId(instructionId)
    setIsTimeModalOpen(true)
  }

  if (queries.isLoading) {
    return <div className="flex items-center justify-center p-8 h-full"><Spinner className="h-8 w-8" /></div>
  }

  if (queries.error || !queries.job) {
    return <div className="p-8 text-center text-muted-foreground">Job not found</div>
  }

  const job = queries.job

  return (
    <JobDetailLayout
      job={job} surveys={queries.surveys} isLoadingSurveys={queries.isLoadingSurveys}
      activeTab={activeTab} onTabChange={setActiveTab} computed={computed}
      hasActiveTimer={!!queries.activeTimer && !!job.instructions?.some(p => p.id === queries.activeTimer?.instruction_id)}
      isAdmin={user?.role === UserRole.ADMIN} openTimeModal={openTimeModal}
      updates={updates} currentUserId={user?.id ?? 0}
      isTimeModalOpen={isTimeModalOpen} setIsTimeModalOpen={setIsTimeModalOpen}
      handleTimeLogged={handleTimeLogged} selectedInstructionId={selectedInstructionId}
    />
  )
}

type SurveyComputeInput = { photo_count?: number | null; conducted_date?: string; conducted_by_user?: { name: string } | null }

interface JobDetailLayoutProps {
  job: JobReadDetail
  surveys: unknown[] | undefined
  isLoadingSurveys: boolean
  activeTab: string
  onTabChange: (tab: string) => void
  computed: ReturnType<typeof useJobComputedData>
  hasActiveTimer: boolean
  isAdmin: boolean
  openTimeModal: (id?: number) => void
  updates: ReturnType<typeof useJobUpdates>
  currentUserId: number
  isTimeModalOpen: boolean
  setIsTimeModalOpen: (open: boolean) => void
  handleTimeLogged: (opts: { instructionName: string; description: string; durationMinutes: number; collaboratorNames?: string[] }) => void
  selectedInstructionId: number | undefined
}

function JobDetailLayout(props: JobDetailLayoutProps) {
  const job = props.job
  const timelineUpdates = (job.updates ?? []) as UpdateItem[]
  const surveyArray = (props.surveys ?? []) as Array<{ photo_count?: number }>
  const photoCount = surveyArray.reduce((sum, s) => sum + (s.photo_count ?? 0), 0)

  return (
    <div className="flex flex-col gap-6">
      <FeatureHeader title={job.name} breadcrumbs={[{ label: "Jobs", href: "/app/jobs" }, { label: job.name }]}>
        <JobHeaderMeta job={job} />
      </FeatureHeader>
      <div className="px-8 pb-8">
        <JobDetailTabs
          activeTab={props.activeTab} onTabChange={props.onTabChange} job={job} surveys={props.surveys}
          isLoadingSurveys={props.isLoadingSurveys} computed={props.computed} hasActiveTimer={props.hasActiveTimer}
          isAdmin={props.isAdmin} openTimeModal={props.openTimeModal} timelineUpdates={timelineUpdates}
          currentUserId={props.currentUserId} onAddUpdate={props.updates.handleAddUpdateAsync}
          isAddingUpdate={props.updates.isAddingUpdate} photoCount={photoCount}
        />
      </div>
      <JobTimeTrackingModal
        open={props.isTimeModalOpen} onOpenChange={props.setIsTimeModalOpen} jobId={job.id}
        instructions={job.instructions} onTimeLogged={props.handleTimeLogged}
        defaultInstructionId={props.selectedInstructionId}
      />
    </div>
  )
}

interface JobDetailTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
  job: JobReadDetail
  surveys: unknown[] | undefined
  isLoadingSurveys: boolean
  computed: ReturnType<typeof useJobComputedData>
  hasActiveTimer: boolean
  isAdmin: boolean
  openTimeModal: (id?: number) => void
  timelineUpdates: UpdateItem[]
  currentUserId: number
  onAddUpdate: (text: string) => Promise<void>
  isAddingUpdate: boolean
  photoCount: number
}

function OverviewTabWrapper(props: JobDetailTabsProps) {
  return (
    <OverviewTab job={props.job as OverviewTabJobType} instructionStatusData={props.computed.instructionStatusData}
      nextDeadlineInstruction={props.computed.nextDeadlineInstruction as NextDeadlineType} surveyCount={props.surveys?.length ?? 0}
      totalSurveyImages={props.computed.totalSurveyImages} mostRecentSurvey={props.computed.mostRecentSurvey as MostRecentSurveyType}
      hasActiveTimer={props.hasActiveTimer} onOpenTimeModal={() => props.openTimeModal()} timelineUpdates={props.timelineUpdates}
      currentUserId={props.currentUserId} onAddUpdate={props.onAddUpdate} isAddingUpdate={props.isAddingUpdate} />
  )
}

function JobDetailTabs(props: JobDetailTabsProps) {
  return (
    <Tabs value={props.activeTab} onValueChange={props.onTabChange} className="w-full">
      <TabsList className="w-full justify-start mb-6">
        <TabsTrigger value="overview" className="gap-2"><Building2 className="h-4 w-4" />Overview</TabsTrigger>
        <TabsTrigger value="instructions" className="gap-2"><Briefcase className="h-4 w-4" />Instructions</TabsTrigger>
        <TabsTrigger value="surveys" className="gap-2"><Camera className="h-4 w-4" />Surveys</TabsTrigger>
        <TabsTrigger value="files" className="gap-2"><Files className="h-4 w-4" />Files</TabsTrigger>
        <TabsTrigger value="docgen" className="gap-2"><Sparkles className="h-4 w-4" />DocGen</TabsTrigger>
      </TabsList>
      <TabsContent value="overview"><OverviewTabWrapper {...props} /></TabsContent>
      <TabsContent value="instructions" className="space-y-4"><InstructionsTab jobId={props.job.id} instructions={props.job.instructions} onRecordTime={props.openTimeModal} /></TabsContent>
      <TabsContent value="surveys" className="space-y-4"><SurveysTab jobId={props.job.id} surveys={props.surveys as SurveyType[]} isLoading={props.isLoadingSurveys} /></TabsContent>
      <TabsContent value="files" className="space-y-4"><FilesTab files={props.job.files as FileType[]} instructions={props.job.instructions as InstructionFileType[]} surveys={(props.surveys ?? []) as SurveyFileType[]} /></TabsContent>
      <TabsContent value="docgen" className="space-y-6"><DocGenTab jobId={props.job.id} photoCount={props.photoCount} fileCount={props.job.files.length} instructionCount={props.job.instructions.length} /></TabsContent>
    </Tabs>
  )
}

type OverviewTabJobType = {
  id: number; status?: string | null; client: { id: number; name: string }
  address?: string | null; created_at: string; updates?: unknown[] | null
}
type NextDeadlineType = { deadline?: string | null; instruction_type?: { name?: string } | null } | null
type MostRecentSurveyType = { conducted_date?: string; conducted_by_user?: { name: string } | null } | null | undefined
type SurveyType = {
  id: number; conducted_date: string; photo_count?: number; instruction?: { name: string }
  site_notes?: string; notes?: string; conducted_by_user?: { name: string }; surveyor?: { name: string }; weather?: string
}
type FileType = { id: number; file_name: string; role?: string; size_bytes?: number }
type InstructionFileType = { id: number; instruction_type?: { name?: string } }
type SurveyFileType = { id: number; conducted_date: string; photo_count?: number }
