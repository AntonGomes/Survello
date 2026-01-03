"use client";

import { FeatureHeader } from "@/components/feature-header";
import { JobCard } from "@/components/job-card";
import { CreateJobDialog } from "@/components/create-job-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { components } from "@/types/api.generated";

type Job = components["schemas"]["JobRead"];

// Mock data matching the generated schema
const MOCK_JOBS: Job[] = [
  { 
    id: 1, 
    name: "Q4 Financial Report", 
    status: "completed", 
    created_at: "2025-12-20T10:00:00Z", 
    updated_at: "2025-12-20T10:05:00Z",
    created_by_user_id: 1,
    client: { id: 101, name: "Acme Corp", contacts: [] } 
  },
  { 
    id: 2, 
    name: "Employee Handbook v2", 
    status: "processing", 
    created_at: "2026-01-02T09:30:00Z", 
    updated_at: "2026-01-02T09:30:00Z",
    created_by_user_id: 1,
    client: { id: 102, name: "Globex", contacts: [] } 
  },
  { 
    id: 3, 
    name: "Invoice Batch #99", 
    status: "pending", 
    created_at: "2026-01-01T14:20:00Z", 
    updated_at: "2026-01-01T14:20:00Z",
    created_by_user_id: 1,
    client: { id: 103, name: "Soylent Corp", contacts: [] } 
  },
];

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter logic (move to backend query params in real implementation)
  const filteredJobs = MOCK_JOBS.filter(job => 
    job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 h-full flex flex-col">

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
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
            No jobs found matching your search.
          </div>
        )}
      </div>

      {/* Pagination (Simple implementation) */}
      <div className="flex items-center justify-center gap-2 py-4">
        <Button variant="outline" size="sm" disabled>Previous</Button>
        <div className="text-sm text-muted-foreground">Page 1 of 1</div>
        <Button variant="outline" size="sm" disabled>Next</Button>
      </div>
    </div>
  );
}
