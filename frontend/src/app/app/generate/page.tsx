"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Sparkles, Loader2, CheckCircle2, AlertCircle, Clock, ExternalLink } from "lucide-react";
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
        Error
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

function RunRow({ run }: { run: DilapsRunRead }) {
  const isInProgress = IN_PROGRESS_STATUSES.has(run.status ?? "");
  const isCompleted = run.status === "completed";
  const isError = run.status === "error";

  const href = isCompleted
    ? `/app/generate/review?dilapsId=${run.id}`
    : isInProgress
      ? `/app/generate/progress?dilapsId=${run.id}`
      : undefined;

  return (
    <div className="flex items-center gap-4 px-4 py-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">
            {run.property_address}
          </p>
          {run.job_id && (
            <Badge variant="outline" className="text-[10px] shrink-0">
              Job #{run.job_id}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatRelativeTime(run.created_at)}
          </span>
          {isInProgress && run.progress_pct > 0 && (
            <div className="flex items-center gap-2 flex-1 max-w-32">
              <Progress value={run.progress_pct} className="h-1.5" />
              <span className="text-xs text-muted-foreground">{run.progress_pct}%</span>
            </div>
          )}
          {isError && run.error_message && (
            <span className="text-xs text-destructive truncate">{run.error_message}</span>
          )}
        </div>
      </div>
      <StatusBadge run={run} />
      {href && (
        <Link href={href}>
          <Button variant="ghost" size="sm" className="shrink-0">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </Link>
      )}
    </div>
  );
}

function RecentRuns() {
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
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Loading runs...
      </div>
    );
  }

  if (!runs?.length) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight">Recent Runs</h2>
      <div className="space-y-2">
        {runs.map((run) => (
          <RunRow key={run.id} run={run} />
        ))}
      </div>
    </div>
  );
}

export default function GeneratePage() {
  const jobId = useJobIdFromParams();
  const router = useRouter();
  const { user } = useAuth();

  const [files, setFiles] = useState<UploadFiles>(EMPTY_UPLOAD_FILES);
  const [propertyAddress, setPropertyAddress] = useState("");

  const generation = useDilapsGeneration();

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
    <>
      <FeatureHeader
        title="Generate Dilaps"
        badge={jobId ? `Job #${jobId}` : null}
      />

      <div className="px-8 pb-8 space-y-8">
        <div className="space-y-6">
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

          <div className="flex justify-center pt-2">
            <Button
              onClick={handleStart}
              disabled={!canStart}
              size="lg"
              variant="accent"
              className="px-8 py-6 text-lg rounded-xl hover:shadow-lg transition-all disabled:opacity-50 border border-accent/30 shadow-[0_14px_38px_-18px_rgba(83,162,85,0.45)]"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Dilaps
            </Button>
          </div>
        </div>

        {generation.error && <ErrorAlert message={generation.error} />}

        <RecentRuns />
      </div>
    </>
  );
}
