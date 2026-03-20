"use client"

import Link from "next/link"
import { Briefcase, MapPin } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreateJobDialog } from "@/components/create-job-dialog"

interface Job {
  id: number
  name: string
  status?: string | null
  address?: string | null
}

interface ClientJobsSectionProps {
  clientId: number
  jobs: Job[] | undefined
}

export function ClientJobsSection({ clientId, jobs }: ClientJobsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-muted-foreground" />Jobs ({jobs?.length ?? 0})
        </h2>
        <CreateJobDialog initialClientId={clientId} trigger={<Button variant="outline" size="sm">Create Job</Button>} />
      </div>

      {jobs && jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => <JobCard key={job.id} job={job} />)}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground bg-muted/20">
          No jobs found for this client. Create a new job to get started.
        </div>
      )}
    </div>
  )
}

function JobCard({ job }: { job: Job }) {
  const statusClass = job.status === "active" ? "border-blue-500 text-blue-600"
    : job.status === "completed" ? "border-green-500 text-green-600" : ""

  return (
    <Link href={`/app/jobs/${job.id}`} className="block">
      <Card className="hover:border-primary/50 transition-colors">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base truncate">{job.name}</CardTitle>
            <Badge variant="outline" className={`scale-90 capitalize ${statusClass}`}>{job.status || "planned"}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Job #{job.id}</span>
            {job.address && <div className="flex items-center gap-1"><MapPin className="h-3 w-3" /><span className="truncate max-w-[150px]">{job.address}</span></div>}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
