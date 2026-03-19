"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { FeatureHeader } from "@/components/feature-header";
import { ErrorAlert } from "@/components/error-alert";
import { DilapsLoadingScreen } from "@/app/app/generate/loading-screen";
import { readDilapsRun } from "@/lib/dilaps-api";
import type { DilapsSubStatus } from "@/lib/dilaps-api";
import type { DilapsStatus } from "@/hooks/use-dilaps-generation";

const POLL_INTERVAL_MS = 2000;

function mapBackendToFrontendStatus(
  backendStatus: DilapsSubStatus,
): { status: DilapsStatus; subStatus: DilapsSubStatus } {
  if (!backendStatus || backendStatus === "embedding") {
    return { status: "generating", subStatus: backendStatus ?? "embedding" };
  }
  if (backendStatus === "sectioning" || backendStatus === "analyzing") {
    return { status: "generating", subStatus: backendStatus };
  }
  if (backendStatus === "completed") {
    return { status: "completed", subStatus: "completed" };
  }
  return { status: "error", subStatus: "error" };
}

function ProgressContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dilapsId = searchParams.get("dilapsId")
    ? Number(searchParams.get("dilapsId"))
    : null;

  const { data: dilapsRun, error } = useQuery({
    queryKey: ["dilaps", dilapsId],
    queryFn: () => readDilapsRun(dilapsId!),
    enabled: !!dilapsId,
    refetchInterval: (query) => {
      const s = query.state.data?.status;
      if (s === "completed" || s === "error") return false;
      return POLL_INTERVAL_MS;
    },
  });

  useEffect(() => {
    if (dilapsRun?.status === "completed" && dilapsId) {
      router.push(`/app/generate/review?dilapsId=${dilapsId}`);
    }
  }, [dilapsRun?.status, dilapsId, router]);

  if (!dilapsId) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>No dilaps run specified.</p>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <FeatureHeader title="Generate Dilaps" />
        <ErrorAlert message={error.message} />
      </>
    );
  }

  const mapped = dilapsRun
    ? mapBackendToFrontendStatus(dilapsRun.status)
    : { status: "generating" as DilapsStatus, subStatus: "embedding" as DilapsSubStatus };

  if (dilapsRun?.status === "error") {
    return (
      <>
        <FeatureHeader title="Generate Dilaps" />
        <ErrorAlert message={dilapsRun.error_message ?? "Run failed"} />
      </>
    );
  }

  return (
    <>
      <FeatureHeader
        title="Generate Dilaps"
        badge={dilapsRun?.property_address ?? null}
      />
      <DilapsLoadingScreen
        status={mapped.status}
        subStatus={mapped.subStatus}
        uploadProgress={100}
        progressPct={dilapsRun?.progress_pct ?? 0}
        totalSections={dilapsRun?.total_sections ?? 0}
        currentSection={dilapsRun?.current_section ?? 0}
        statusMessage={dilapsRun?.status_message ?? null}
      />
    </>
  );
}

export default function ProgressPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <ProgressContent />
    </Suspense>
  );
}
