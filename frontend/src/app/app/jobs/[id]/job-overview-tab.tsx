"use client"

import { Building2, MapPin, Calendar, Clock, Camera } from "lucide-react"
import { Image as ImageIcon } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UpdateFeed, type UpdateItem } from "@/components/update-feed"
import { StatusPieChart, statusChartConfig } from "./status-pie-chart"
import { QuickActions } from "./job-quick-actions"

interface JobDetailsCardProps {
  job: { status?: string | null; client: { id: number; name: string }; address?: string | null; created_at: string }
}

function JobDetailsCard({ job }: JobDetailsCardProps) {
  return (
    <Card className="lg:col-span-1">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Job Details</CardTitle>
          <Badge variant="outline" className="capitalize">{job.status ?? "planned"}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <DetailRow icon={Building2} label="Client">
          <Link href={`/app/clients/${job.client.id}`} className="text-sm font-medium text-primary hover:underline truncate block">
            {job.client.name}
          </Link>
        </DetailRow>
        <DetailRow icon={MapPin} label="Address">
          <p className="text-sm font-medium">
            {job.address || <span className="text-muted-foreground italic font-normal">Not set</span>}
          </p>
        </DetailRow>
        <DetailRow icon={Calendar} label="Created">
          <p className="text-sm font-medium">{format(new Date(job.created_at), "d MMM yyyy")}</p>
        </DetailRow>
      </CardContent>
    </Card>
  )
}

function DetailRow({ icon: Icon, label, children }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        {children}
      </div>
    </div>
  )
}

interface InstructionsSummaryCardProps {
  instructionStatusData: { status: string; count: number; fill: string }[]
  nextDeadlineInstruction: { deadline?: string | null; instruction_type?: { name?: string } | null } | null
}

function InstructionsSummaryCard({ instructionStatusData, nextDeadlineInstruction }: InstructionsSummaryCardProps) {
  return (
    <Card className="lg:col-span-1">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Instructions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <StatusPieChart data={instructionStatusData} />
          <StatusLegend data={instructionStatusData} />
        </div>
        <div className="pt-3 border-t">
          <DetailRow icon={Clock} label="Next Deadline">
            {nextDeadlineInstruction ? (
              <div>
                <p className="text-sm font-medium">{format(new Date(nextDeadlineInstruction.deadline!), "d MMM yyyy")}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {nextDeadlineInstruction.instruction_type?.name || "Instruction"}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No upcoming deadlines</p>
            )}
          </DetailRow>
        </div>
      </CardContent>
    </Card>
  )
}

function StatusLegend({ data }: { data: { status: string; count: number }[] }) {
  const activeData = data.filter(d => d.count > 0)

  if (activeData.length === 0) {
    return <p className="text-sm text-muted-foreground italic">No instructions yet</p>
  }

  return (
    <div className="space-y-1 flex-1">
      {activeData.map(d => {
        const config = statusChartConfig[d.status as keyof typeof statusChartConfig]
        const color = config && "color" in config ? config.color : undefined
        return (
          <div key={d.status} className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
            <span className="text-muted-foreground capitalize">{d.status}</span>
            <span className="font-medium">{d.count}</span>
          </div>
        )
      })}
    </div>
  )
}

interface SurveysSummaryCardProps {
  surveyCount: number
  totalImages: number
  mostRecentSurvey: { conducted_date?: string; conducted_by_user?: { name: string } | null } | null | undefined
}

function SurveysSummaryCard({ surveyCount, totalImages, mostRecentSurvey }: SurveysSummaryCardProps) {
  return (
    <Card className="lg:col-span-1">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">Surveys</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <StatBlock icon={Camera} value={surveyCount} label="Surveys" />
          <StatBlock icon={ImageIcon} value={totalImages} label="Photos" />
        </div>
        {mostRecentSurvey && mostRecentSurvey.conducted_date && (
          <div className="pt-3 border-t">
            <DetailRow icon={Calendar} label="Most Recent Survey">
              <p className="text-sm font-medium">{format(new Date(mostRecentSurvey.conducted_date), "d MMM yyyy")}</p>
              {mostRecentSurvey.conducted_by_user && (
                <p className="text-xs text-muted-foreground">by {mostRecentSurvey.conducted_by_user.name}</p>
              )}
            </DetailRow>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function StatBlock({ icon: Icon, value, label }: {
  icon: React.ComponentType<{ className?: string }>
  value: number
  label: string
}) {
  return (
    <div className="text-center p-3 rounded-lg bg-muted/50">
      <Icon className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

export interface OverviewTabProps {
  job: {
    id: number
    status?: string | null
    client: { id: number; name: string }
    address?: string | null
    created_at: string
    updates?: unknown[] | null
  }
  instructionStatusData: { status: string; count: number; fill: string }[]
  nextDeadlineInstruction: { deadline?: string | null; instruction_type?: { name?: string } | null } | null
  surveyCount: number
  totalSurveyImages: number
  mostRecentSurvey: { conducted_date?: string; conducted_by_user?: { name: string } | null } | null | undefined
  hasActiveTimer: boolean
  onOpenTimeModal: () => void
  timelineUpdates: UpdateItem[]
  currentUserId: number
  onAddUpdate: (text: string) => Promise<void>
  isAddingUpdate: boolean
}

export function OverviewTab(props: OverviewTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <JobDetailsCard job={props.job} />
        <InstructionsSummaryCard
          instructionStatusData={props.instructionStatusData}
          nextDeadlineInstruction={props.nextDeadlineInstruction}
        />
        <SurveysSummaryCard
          surveyCount={props.surveyCount}
          totalImages={props.totalSurveyImages}
          mostRecentSurvey={props.mostRecentSurvey}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <QuickActions jobId={props.job.id} hasActiveTimer={props.hasActiveTimer} onOpenTimeModal={props.onOpenTimeModal} />
        </div>
        <div className="lg:col-span-1">
          <UpdateFeed
            updates={props.timelineUpdates}
            currentUserId={props.currentUserId}
            onAddUpdate={props.onAddUpdate}
            isLoading={props.isAddingUpdate}
            showDeleteButton={false}
            maxInitialItems={10}
          />
        </div>
      </div>
    </div>
  )
}
