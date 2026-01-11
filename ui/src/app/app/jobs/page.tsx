"use client";

import { FeatureHeader } from "@/components/feature-header";
import { CreateJobDialog } from "@/components/create-job-dialog";
import { Loader2, Circle, CheckCircle2, Clock, Archive } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getJobsOptions } from "@/client/@tanstack/react-query.gen";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";

const statusOptions = [
  {
    label: "Planned",
    value: "planned",
    icon: Clock,
  },
  {
    label: "Active",
    value: "active",
    icon: Circle,
  },
  {
    label: "Completed",
    value: "completed",
    icon: CheckCircle2,
  },
  {
    label: "Archived",
    value: "archived",
    icon: Archive,
  },
];

export default function JobsPage() {
  const { data: jobs, isLoading, isError } = useQuery({
    ...getJobsOptions({
      query: {
        start: 0,
        end: 100 // Fetch more for client-side table features
      }
    })
  });

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <FeatureHeader 
          title="Jobs History" 
          description="Manage and track your document generation tasks."
        />
        <div className="flex items-center gap-2">
          <CreateJobDialog />
        </div>
      </div>

      <div className="flex-1">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <div className="text-center py-12 text-destructive border rounded-lg border-dashed border-destructive/50 bg-destructive/10">
            Failed to load jobs. Please try again later.
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={jobs || []} 
            searchKey="name"
            facetedFilters={[
              {
                columnId: "status",
                title: "Status",
                options: statusOptions,
              },
            ]}
          />
        )}
      </div>
    </div>
  );
}
