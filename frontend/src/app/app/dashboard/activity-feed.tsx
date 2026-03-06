"use client"

import { useMemo } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Activity, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { UpdateItem } from "./use-dashboard-data"
import { UPDATES_PER_PAGE } from "./use-dashboard-data"

function getInitials(name: string | null, authorInitials: string | null) {
  if (authorInitials) return authorInitials
  if (!name) return "?"
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
}

interface ActivityFeedProps {
  allUpdates: UpdateItem[]
  updatesPage: number
  onPageChange: (page: number) => void
}

export function ActivityFeed({ allUpdates, updatesPage, onPageChange }: ActivityFeedProps) {
  const totalPages = Math.ceil(allUpdates.length / UPDATES_PER_PAGE)
  const paginatedUpdates = useMemo(() => {
    const start = updatesPage * UPDATES_PER_PAGE
    return allUpdates.slice(start, start + UPDATES_PER_PAGE)
  }, [allUpdates, updatesPage])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2"><Activity className="h-5 w-5 text-muted-foreground" />Recent Activity</CardTitle>
            <CardDescription>Latest updates across all jobs</CardDescription>
          </div>
          {totalPages > 1 && (
            <PaginationControls page={updatesPage} totalPages={totalPages} onPageChange={onPageChange} />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {paginatedUpdates.length > 0 ? (
          <div className="space-y-4">
            {paginatedUpdates.map((update, index) => (
              <UpdateRow key={update.id || index} update={update} />
            ))}
          </div>
        ) : (
          <EmptyActivity />
        )}
      </CardContent>
    </Card>
  )
}

function PaginationControls({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => onPageChange(Math.max(0, page - 1))} disabled={page === 0}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm text-muted-foreground">{page + 1} / {totalPages}</span>
      <Button variant="outline" size="sm" onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

function UpdateRow({ update }: { update: UpdateItem }) {
  return (
    <div className="flex gap-3">
      <div className="shrink-0">
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
          {getInitials(update.author_name, update.author_initials)}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm">
              <span className="font-medium">{update.author_name || "Unknown"}</span>
              <span className="text-muted-foreground"> • </span>
              <Link href={`/app/jobs/${update.job_id}`} className="text-primary hover:underline">{update.job_name}</Link>
              {update.source_project_name && <span className="text-muted-foreground"> → {update.source_project_name}</span>}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5 break-words">{update.text}</p>
          </div>
          <span className="text-xs text-muted-foreground shrink-0">{formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}</span>
        </div>
      </div>
    </div>
  )
}

function EmptyActivity() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
      <Activity className="h-12 w-12 mb-4 opacity-20" />
      <p>No activity found.</p>
      <p className="text-sm">Updates from your jobs will appear here.</p>
    </div>
  )
}
