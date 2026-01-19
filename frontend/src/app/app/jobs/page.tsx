"use client";

import { FeatureHeader } from "@/components/feature-header";
import { CreateJobDialog } from "@/components/create-job-dialog";
import { CreateQuoteDialog } from "@/components/create-quote-dialog";
import { Loader2, Circle, CheckCircle2, Clock, Archive, FileText, Send, CheckCheck, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { readJobsOptions, readQuotesOptions, convertQuoteMutation } from "@/client/@tanstack/react-query.gen";
import { DataTable } from "@/components/data-table";
import { columns } from "./columns";
import { createQuoteColumns } from "./quote-columns";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getStalenessRowClass } from "@/lib/staleness";
import { QuoteRead, QuoteStatus } from "@/client";
import { toast } from "sonner";

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

const quoteStatusOptions = [
  {
    label: "Draft",
    value: QuoteStatus.DRAFT,
    icon: FileText,
  },
  {
    label: "Sent",
    value: QuoteStatus.SENT,
    icon: Send,
  },
  {
    label: "Accepted",
    value: QuoteStatus.ACCEPTED,
    icon: CheckCheck,
  },
  {
    label: "Declined",
    value: QuoteStatus.DECLINED,
    icon: X,
  },
];

export default function JobsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: jobs, isLoading: isLoadingJobs, isError: isErrorJobs } = useQuery({
    ...readJobsOptions({
      query: {
        offset: 0,
        limit: 100
      }
    })
  });

  const { data: quotes, isLoading: isLoadingQuotes, isError: isErrorQuotes } = useQuery({
    ...readQuotesOptions({
      query: {
        offset: 0,
        limit: 100
      }
    })
  });

  const { mutate: convertQuote } = useMutation({
    ...convertQuoteMutation(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: readQuotesOptions().queryKey });
      queryClient.invalidateQueries({ queryKey: readJobsOptions().queryKey });
      toast.success("Quote converted to job successfully");
      // Navigate to the new job
      if (data && typeof data === 'object' && 'id' in data) {
        router.push(`/app/jobs/${data.id}`);
      }
    },
    onError: () => {
      toast.error("Failed to convert quote to job");
    },
  });

  const handleConvertQuote = (quote: QuoteRead) => {
    convertQuote({ path: { quote_id: quote.id } });
  };

  const quoteColumns = createQuoteColumns({
    onConvert: handleConvertQuote,
  });

  // Count active quotes (not declined)
  const activeQuotesCount = quotes?.filter(q => q.status !== QuoteStatus.DECLINED && !q.converted_job_id).length || 0;

  return (
    <div className="space-y-6 h-full flex flex-col">
      <FeatureHeader 
        title="Jobs" 
        badge={null}
      >
        <CreateQuoteDialog />
        <CreateJobDialog />
      </FeatureHeader>

      <Tabs defaultValue="jobs" className="flex-1 flex flex-col">
        <TabsList>
          <TabsTrigger value="jobs">
            Jobs
            {jobs && jobs.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                {jobs.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="quotes">
            Quotes
            {activeQuotesCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                {activeQuotesCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="flex-1 mt-4">
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
            />
          )}
        </TabsContent>

        <TabsContent value="quotes" className="flex-1 mt-4">
          {isLoadingQuotes ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : isErrorQuotes ? (
            <div className="text-center py-12 text-destructive border rounded-lg border-dashed border-destructive/50 bg-destructive/10">
              Failed to load quotes. Please try again later.
            </div>
          ) : (
            <DataTable 
              columns={quoteColumns} 
              data={quotes || []} 
              searchKey="name"
              facetedFilters={[
                {
                  columnId: "status",
                  title: "Status",
                  options: quoteStatusOptions,
                },
              ]}
              getRowClassName={(row) => getStalenessRowClass(row.updated_at) || undefined}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
