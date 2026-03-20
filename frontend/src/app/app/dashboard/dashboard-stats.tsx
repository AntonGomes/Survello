"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Briefcase, Building2, Camera, Activity, Target, TrendingUp, Clock, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { UpdateItem } from "./use-dashboard-data"

interface StatsCardsProps {
  jobStats: { total: number; active: number; completed: number; planned: number; recentlyActive: number }
  clientStats: { total: number; withActiveJobs: number }
  surveyStats: { total: number; thisMonth: number; totalPhotos: number }
  mostRecentJob: { id: number; name: string } | null
}

export function StatsCards({ jobStats, clientStats, surveyStats, mostRecentJob }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <ActiveJobsCard stats={jobStats} />
      <ClientsCard stats={clientStats} />
      <SurveysCard stats={surveyStats} />
      <RecentActivityCard recentlyActive={jobStats.recentlyActive} latestJob={mostRecentJob} />
    </div>
  )
}

function ActiveJobsCard({ stats }: { stats: StatsCardsProps["jobStats"] }) {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-950/20">
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5 text-blue-600" />Active Jobs</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-blue-600">{stats.active}</span>
          <span className="text-sm text-muted-foreground">of {stats.total} total</span>
        </div>
        <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
          <span>{stats.planned} planned</span><span>•</span><span>{stats.completed} completed</span>
        </div>
      </CardContent>
    </Card>
  )
}

function ClientsCard({ stats }: { stats: StatsCardsProps["clientStats"] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" />Clients</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">{stats.total}</span>
          {stats.withActiveJobs > 0 && <Badge variant="secondary" className="text-xs">{stats.withActiveJobs} with active work</Badge>}
        </div>
      </CardContent>
    </Card>
  )
}

function SurveysCard({ stats }: { stats: StatsCardsProps["surveyStats"] }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-1.5"><Camera className="h-3.5 w-3.5" />Surveys</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">{stats.total}</span>
          <span className="text-sm text-muted-foreground">total</span>
        </div>
        <div className="mt-2 flex gap-3 text-xs text-muted-foreground">
          <span>{stats.thisMonth} this month</span><span>•</span><span>{stats.totalPhotos} photos</span>
        </div>
      </CardContent>
    </Card>
  )
}

function RecentActivityCard({ recentlyActive, latestJob }: { recentlyActive: number; latestJob: { id: number; name: string } | null }) {
  return (
    <Card className="bg-gradient-to-br from-green-50 to-transparent dark:from-green-950/20">
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-1.5"><Activity className="h-3.5 w-3.5 text-green-600" />Recent Activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-green-600">{recentlyActive}</span>
          <span className="text-sm text-muted-foreground">jobs active this week</span>
        </div>
        {latestJob && <p className="mt-2 text-xs text-muted-foreground truncate">Latest: {latestJob.name}</p>}
      </CardContent>
    </Card>
  )
}

interface SecondaryStatsProps {
  hoursStats: { thisWeek: number; totalInstructions: number }
  allUpdates: UpdateItem[]
  mostRecentJob: { id: number; name: string } | null
}

export function SecondaryStats({ hoursStats, allUpdates, mostRecentJob }: SecondaryStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2"><CardDescription className="flex items-center gap-1.5"><Target className="h-3.5 w-3.5" />Instructions</CardDescription></CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{hoursStats.totalInstructions}</span>
            <span className="text-sm text-muted-foreground">total instructions</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">{hoursStats.thisWeek.toFixed(1)} hours tracked</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2"><CardDescription className="flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5" />Updates</CardDescription></CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{allUpdates.length}</span>
            <span className="text-sm text-muted-foreground">total entries</span>
          </div>
          {allUpdates.length > 0 && allUpdates[0] && (
            <p className="mt-2 text-xs text-muted-foreground">Latest {formatDistanceToNow(new Date(allUpdates[0].created_at), { addSuffix: true })}</p>
          )}
        </CardContent>
      </Card>
      {mostRecentJob && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2"><CardDescription className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-primary" />Continue Working</CardDescription></CardHeader>
          <CardContent>
            <Link href={`/app/jobs/${mostRecentJob.id}`}>
              <Button variant="ghost" className="w-full justify-between h-auto py-2 px-3 -mx-3">
                <div className="text-left">
                  <p className="font-medium truncate max-w-[200px]">{mostRecentJob.name}</p>
                  {allUpdates[0] && <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(allUpdates[0].created_at), { addSuffix: true })}</p>}
                </div>
                <ArrowRight className="h-4 w-4 text-primary" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
