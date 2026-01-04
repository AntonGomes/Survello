"use client";

import { FeatureHeader } from "@/components/feature-header";
import { JobCard } from "@/components/job-card";
import { CreateJobDialog } from "@/components/create-job-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getJobsOptions } from "@/client/@tanstack/react-query.gen";

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const { data: jobs, isLoading, isError } = useQuery({
    ...getJobsOptions({
      query: {
        start: page * pageSize,
        end: (page + 1) * pageSize
      }
    })
  });

  // Client-side filtering for now (ideal: move to backend search param)
  const filteredJobs = (jobs || []).filter(job => 
    job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.client?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <FeatureHeader 
          title="Jobs History" 
          description="Manage and track your document generation tasks."
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs or clients..."
            className="pl-9 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" title="Filter">
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
        <div className="ml-auto">
          <CreateJobDialog />
        </div>
      </div>
      
      {/* Job List */}
      <div className="flex-1 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-destructive border rounded-lg border-dashed border-destructive/50 bg-destructive/10">
            Failed to load jobs. Please try again later.
          </div>
        ) : filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
            No jobs found matching your search.
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 py-4">
        <Button 
          variant="outline" 
          size="sm" 
          disabled={page === 0 || isLoading}
          onClick={() => setPage(p => Math.max(0, p - 1))}
        >
          Previous
        </Button>
        <div className="text-sm text-muted-foreground">Page {page + 1}</div>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={!jobs || jobs.length < pageSize || isLoading}
          onClick={() => setPage(p => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
