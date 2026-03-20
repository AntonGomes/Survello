"use client"

import { useState } from "react"
import Link from "next/link"
import { Briefcase, Building2, Camera, FileText } from "lucide-react"

import { FeatureHeader } from "@/components/feature-header"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

import { useDashboardQueries, useJobStats, useClientStats, useSurveyStats, useAllUpdates } from "./use-dashboard-data"
import { StatsCards, SecondaryStats } from "./dashboard-stats"
import { ActivityFeed } from "./activity-feed"

function QuickLinks() {
  return (
    <div className="flex flex-wrap gap-3 px-8">
      <Link href="/app/jobs"><Button variant="outline" className="gap-2"><Briefcase className="h-4 w-4" />View Jobs</Button></Link>
      <Link href="/app/clients"><Button variant="outline" className="gap-2"><Building2 className="h-4 w-4" />View Clients</Button></Link>
      <Link href="/app/surveys"><Button variant="outline" className="gap-2"><Camera className="h-4 w-4" />View Surveys</Button></Link>
      <Link href="/app/templates"><Button variant="outline" className="gap-2"><FileText className="h-4 w-4" />Templates</Button></Link>
    </div>
  )
}

export default function DashboardPage() {
  const [updatesPage, setUpdatesPage] = useState(0)
  const { jobs, clients, surveys, isLoading } = useDashboardQueries()
  const jobStats = useJobStats(jobs)
  const clientStats = useClientStats(clients, jobs)
  const surveyStats = useSurveyStats(surveys)
  const { allUpdates, hoursStats, mostRecentJob } = useAllUpdates(jobs)

  if (isLoading) {
    return <div className="flex items-center justify-center p-8 h-full"><Spinner className="h-8 w-8" /></div>
  }

  return (
    <div className="space-y-6">
      <FeatureHeader title="Dashboard" subtitle="Overview of your work and recent activity" badge={null} />
      <QuickLinks />
      <div className="px-8 pb-8 space-y-6">
        <StatsCards jobStats={jobStats} clientStats={clientStats} surveyStats={surveyStats} mostRecentJob={mostRecentJob} />
        <SecondaryStats hoursStats={hoursStats} allUpdates={allUpdates} mostRecentJob={mostRecentJob} />
        <ActivityFeed allUpdates={allUpdates} updatesPage={updatesPage} onPageChange={setUpdatesPage} />
      </div>
    </div>
  )
}
