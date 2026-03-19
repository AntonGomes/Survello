"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  FileText,
  Inbox,
} from "lucide-react";
import Link from "next/link";

import { ErrorAlert } from "@/components/error-alert";
import { FeatureHeader } from "@/components/feature-header";
import {
  DilapsUploadGrid,
  LinkedJobBanner,
} from "@/app/app/generate/upload-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useDilapsGeneration } from "@/hooks/use-dilaps-generation";
import { useAuth } from "@/context/auth-context";
import { listDilapsRuns, type DilapsRunRead } from "@/lib/dilaps-api";

type UploadFiles = {
  leaseFile: File | null;
  leaseDocFiles: File[];
  siteNoteFiles: File[];
  surveyImageFiles: File[];
  miscFiles: File[];
};

const EMPTY_UPLOAD_FILES: UploadFiles = {
  leaseFile: null,
  leaseDocFiles: [],
  siteNoteFiles: [],
  surveyImageFiles: [],
  miscFiles: [],
};

const IN_PROGRESS_STATUSES = new Set(["idle", "embedding", "sectioning", "analyzing"]);
const RUNS_POLL_INTERVAL_MS = 5000;

function useJobIdFromParams() {
  const searchParams = useSearchParams();
  const param = searchParams.get("jobId");
  return param ? parseInt(param) : undefined;
}

function useTabFromParams() {
  const searchParams = useSearchParams();
  return searchParams.get("tab") === "reports" ? "reports" : "new";
}

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function StatusBadge({ run }: { run: DilapsRunRead }) {
  if (run.status === "completed") {
    return (
      <Badge className="bg-accent/15 text-accent border-accent/30">
        <CheckCircle2 className="h-3 w-3" />
        Completed
      </Badge>
    );
  }
  if (run.status === "error") {
    return (
      <Badge variant="destructive">
        <AlertCircle className="h-3 w-3" />
        Failed
      </Badge>
    );
  }
  return (
    <Badge className="bg-primary/15 text-primary border-primary/30">
      <Loader2 className="h-3 w-3 animate-spin" />
      In Progress
    </Badge>
  );
}

function runHref(run: DilapsRunRead) {
  if (run.status === "completed") return `/app/generate/review?dilapsId=${run.id}`;
  if (IN_PROGRESS_STATUSES.has(run.status ?? "")) return `/app/generate/progress?dilapsId=${run.id}`;
  return null;
}

function RunRow({ run }: { run: DilapsRunRead }) {
  const isInProgress = IN_PROGRESS_STATUSES.has(run.status ?? "");
  const isError = run.status === "error";
  const href = runHref(run);

  const content = (
    <div className="flex items-center gap-4 px-4 py-3.5 rounded-lg border border-border bg-card transition-colors hover:bg-muted/50 group">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{run.property_address}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatRelativeTime(run.created_at)}
          </span>
          {run.job_id && (
            <Badge variant="outline" className="text-[10px] shrink-0">
              Job #{run.job_id}
            </Badge>
          )}
          {isInProgress && run.progress_pct > 0 && (
            <div className="flex items-center gap-2 flex-1 max-w-32">
              <Progress value={run.progress_pct} className="h-1.5" />
              <span className="text-xs text-muted-foreground">{run.progress_pct}%</span>
            </div>
          )}
          {isError && run.error_message && (
            <span className="text-xs text-destructive truncate max-w-64">{run.error_message}</span>
          )}
        </div>
      </div>
      <StatusBadge run={run} />
      {href && (
        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      )}
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }

  return content;
}

function ActiveRunsBanner({ runs }: { runs: DilapsRunRead[] }) {
  const activeRuns = runs.filter((r) => IN_PROGRESS_STATUSES.has(r.status ?? ""));
  if (activeRuns.length === 0) return null;

  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <p className="text-sm font-medium">
          {activeRuns.length === 1
            ? "1 report is being generated"
            : `${activeRuns.length} reports are being generated`}
        </p>
      </div>
      <div className="space-y-2">
        {activeRuns.map((run) => (
          <Link
            key={run.id}
            href={`/app/generate/progress?dilapsId=${run.id}`}
            className="flex items-center gap-3 rounded-md bg-background/80 px-3 py-2 text-sm hover:bg-background transition-colors"
          >
            <span className="truncate flex-1">{run.property_address}</span>
            {run.progress_pct > 0 && (
              <div className="flex items-center gap-2 shrink-0">
                <Progress value={run.progress_pct} className="h-1.5 w-16" />
                <span className="text-xs text-muted-foreground">{run.progress_pct}%</span>
              </div>
            )}
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}

function ReportsEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
        <Inbox className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">No reports yet</p>
      <p className="text-sm text-muted-foreground mt-1 max-w-xs">
        Reports you generate will appear here. You can navigate away while they process and come back to check on them.
      </p>
    </div>
  );
}

function ReportsTab() {
  const { data: runs, isLoading } = useQuery({
    queryKey: ["dilaps-runs"],
    queryFn: listDilapsRuns,
    refetchInterval: (query) => {
      const hasInProgress = query.state.data?.some(
        (r) => IN_PROGRESS_STATUSES.has(r.status ?? ""),
      );
      return hasInProgress ? RUNS_POLL_INTERVAL_MS : false;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading reports...
      </div>
    );
  }

  if (!runs?.length) return <ReportsEmpty />;

  const activeRuns = runs.filter((r) => IN_PROGRESS_STATUSES.has(r.status ?? ""));
  const finishedRuns = runs.filter((r) => !IN_PROGRESS_STATUSES.has(r.status ?? ""));

  return (
    <div className="space-y-6">
      {activeRuns.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">In Progress</h3>
          {activeRuns.map((run) => <RunRow key={run.id} run={run} />)}
        </div>
      )}
      {finishedRuns.length > 0 && (
        <div className="space-y-2">
          {activeRuns.length > 0 && (
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Completed</h3>
          )}
          {finishedRuns.map((run) => <RunRow key={run.id} run={run} />)}
        </div>
      )}
    </div>
  );
}

function NewReportTab() {
  const jobId = useJobIdFromParams();
  const router = useRouter();
  const { user } = useAuth();

  const [files, setFiles] = useState<UploadFiles>(EMPTY_UPLOAD_FILES);
  const [propertyAddress, setPropertyAddress] = useState("");

  const generation = useDilapsGeneration();

  const { data: runs } = useQuery({
    queryKey: ["dilaps-runs"],
    queryFn: listDilapsRuns,
  });

  const canStart = useMemo(
    () =>
      Boolean(files.leaseFile) &&
      files.surveyImageFiles.length > 0 &&
      propertyAddress.trim().length > 0 &&
      !generation.isActive,
    [files.leaseFile, files.surveyImageFiles.length, propertyAddress, generation.isActive],
  );

  const handleStart = () => {
    generation.start({
      ...files,
      propertyAddress,
      jobId,
      orgId: user?.org_id ?? 0,
    });
  };

  useEffect(() => {
    if (generation.dilapsId && generation.isActive) {
      router.push(`/app/generate/progress?dilapsId=${generation.dilapsId}`);
    }
  }, [generation.dilapsId, generation.isActive, router]);

  return (
    <div className="space-y-6">
      {runs && <ActiveRunsBanner runs={runs} />}

      {jobId && <LinkedJobBanner jobId={jobId} />}

      <div className="space-y-2">
        <Label htmlFor="property-address" className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Property Address
        </Label>
        <Input
          id="property-address"
          placeholder="Enter the property address"
          value={propertyAddress}
          onChange={(e) => setPropertyAddress(e.target.value)}
          disabled={generation.isActive}
        />
      </div>

      <DilapsUploadGrid files={files} onUpdate={setFiles} disabled={generation.isActive} />

      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-muted-foreground">
          Typically takes 3–5 minutes. You can navigate away while it runs.
        </p>
        <Button
          onClick={handleStart}
          disabled={!canStart}
          size="lg"
          variant="accent"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {generation.error && <ErrorAlert message={generation.error} />}
    </div>
  );
}

export default function GeneratePage() {
  const jobId = useJobIdFromParams();
  const defaultTab = useTabFromParams();

  return (
    <>
      <FeatureHeader
        title="Dilaps Reports"
        badge={jobId ? `Job #${jobId}` : null}
      />

      <div className="px-8 pb-8">
        <Tabs defaultValue={defaultTab}>
          <TabsList>
            <TabsTrigger value="new">
              <FileText className="h-4 w-4" />
              New Report
            </TabsTrigger>
            <TabsTrigger value="reports">
              <Inbox className="h-4 w-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="pt-6">
            <NewReportTab />
          </TabsContent>

          <TabsContent value="reports" className="pt-6">
            <ReportsTab />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
