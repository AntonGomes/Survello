"use client";

import { FeatureHeader } from "@/components/feature-header";
import { CreateJobDialog } from "@/components/create-job-dialog";
import { Loader2, Circle, CheckCircle2, Clock, Archive } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { readJobsOptions } from "@/client/@tanstack/react-query.gen";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { useRouter } from "next/navigation";

const jobStatusOptions = [
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
  const router = useRouter();

  const { data: jobs, isLoading: isLoadingJobs, isError: isErrorJobs } = useQuery({
    ...readJobsOptions({
      query: {
        offset: 0,
        limit: 100
      }
    })
  });

  return (
    <div className="space-y-6 h-full flex flex-col">
      <FeatureHeader 
        title="Jobs" 
        badge={null}
      />

      <div className="flex-1">
        {isLoadingJobs ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : isErrorJobs ? (
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
                options: jobStatusOptions,
              },
            ]}
            onRowClick={(row) => router.push(`/app/jobs/${row.id}`)}
            toolbarAction={<CreateJobDialog />}
          />
        )}
      </div>
    </div>
  );
}
