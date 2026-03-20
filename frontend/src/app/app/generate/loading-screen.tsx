"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { DilapsStatus, DilapsSubStatus } from "@/hooks/use-dilaps-generation";
import type { UploadProgress } from "@/lib/upload";
import {
  STEPS,
  getStepState,
  formatTimeRemaining,
  estimateFromHistory,
  type ProgressSample,
  type StepConfig,
  type StepState,
} from "./loading-steps";

type Props = {
  status: DilapsStatus;
  subStatus: DilapsSubStatus;
  uploadProgress: UploadProgress;
  progressPct: number;
  totalSections: number;
  currentSection: number;
  statusMessage: string | null;
};

const UPLOAD_WEIGHT = 0.1;
const SAMPLE_INTERVAL_MS = 2000;
const MAX_SAMPLES = 30;

function useProgressHistory(progressPct: number) {
  const historyRef = useRef<ProgressSample[]>([]);
  const progressRef = useRef(progressPct);
  const [estimate, setEstimate] = useState<number | null>(null);

  progressRef.current = progressPct;

  useEffect(() => {
    const record = () => {
      const now = Date.now();
      const pct = progressRef.current;

      historyRef.current.push({ time: now, pct });

      if (historyRef.current.length > MAX_SAMPLES) {
        historyRef.current = historyRef.current.slice(-MAX_SAMPLES);
      }

      setEstimate(estimateFromHistory(historyRef.current));
    };

    record();
    const id = setInterval(record, SAMPLE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return estimate;
}

function StepItem({ step, state }: { step: StepConfig; state: StepState }) {
  const Icon = step.icon;

  const iconBg =
    state === "done"
      ? "bg-accent/15 text-accent"
      : state === "active"
        ? "bg-primary/15 text-primary"
        : "bg-muted text-muted-foreground";

  return (
    <div className={`flex items-start gap-4 py-3 transition-opacity duration-300 ${state === "pending" ? "opacity-40" : "opacity-100"}`}>
      <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${iconBg}`}>
        {state === "done" && <CheckCircle2 className="h-5 w-5" />}
        {state === "active" && <Loader2 className="h-5 w-5 animate-spin" />}
        {state === "pending" && <Icon className="h-5 w-5" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium ${state === "active" ? "text-foreground" : "text-muted-foreground"}`}>
          {step.label}
        </p>
        <p className={`text-xs mt-0.5 ${state === "active" ? "text-muted-foreground" : "text-muted-foreground/40"}`}>
          {step.description}
        </p>
      </div>
    </div>
  );
}

function SectionProgress({
  currentSection,
  totalSections,
}: {
  currentSection: number;
  totalSections: number;
}) {
  if (totalSections <= 0) return null;

  return (
    <div className="mt-1 flex items-center gap-2">
      <div className="flex gap-1">
        {Array.from({ length: totalSections }).map((_, i) => {
          const done = i < currentSection;
          const active = i === currentSection;
          const cls = done
            ? "w-4 bg-accent"
            : active
              ? "w-4 bg-primary animate-pulse"
              : "w-2.5 bg-muted-foreground/20";
          return <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${cls}`} />;
        })}
      </div>
      <span className="text-xs text-muted-foreground">
        {currentSection} / {totalSections}
      </span>
    </div>
  );
}

export function DilapsLoadingScreen({
  status,
  subStatus,
  uploadProgress,
  progressPct,
  totalSections,
  currentSection,
  statusMessage,
}: Props) {
  const effectiveProgress =
    status === "presigning" || status === "uploading"
      ? Math.round(uploadProgress.percent * UPLOAD_WEIGHT)
      : progressPct;

  const secondsRemaining = useProgressHistory(effectiveProgress);

  const currentFileNum = Math.min(
    uploadProgress.completedFiles + 1,
    uploadProgress.totalFiles,
  );
  const uploadStatusMessage =
    status === "presigning"
      ? "Preparing upload..."
      : status === "uploading"
        ? `Uploading file ${currentFileNum} of ${uploadProgress.totalFiles}...`
        : null;

  const displayMessage = uploadStatusMessage ?? statusMessage;

  return (
    <div className="flex flex-1 items-center justify-center px-8 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Building your dilaps report</h2>
          {displayMessage && (
            <p className="text-sm text-muted-foreground animate-in fade-in duration-500">{displayMessage}</p>
          )}
        </div>

        <div className="space-y-3">
          <Progress value={effectiveProgress} className="h-2.5 bg-primary/10" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {effectiveProgress}% complete
              {subStatus === "analyzing" && totalSections > 0 && (
                <span className="ml-1.5 text-muted-foreground/70">
                  (area {currentSection} of {totalSections})
                </span>
              )}
            </span>
            {secondsRemaining !== null && (
              <span className="animate-in fade-in duration-300">{formatTimeRemaining(secondsRemaining)}</span>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="divide-y divide-border/50">
            {STEPS.map((step) => {
              const state = getStepState(step, status, subStatus);
              return (
                <div key={step.key}>
                  <StepItem step={step} state={state} />
                  {step.key === "analyzing" && state === "active" && (
                    <div className="pb-3 pl-13">
                      <SectionProgress currentSection={currentSection} totalSections={totalSections} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground/60">
          You can navigate away — check back anytime from the Reports tab
        </p>
      </div>
    </div>
  );
}
