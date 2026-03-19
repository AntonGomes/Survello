"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { DilapsStatus, DilapsSubStatus } from "@/hooks/use-dilaps-generation";
import {
  STEPS,
  getStepState,
  formatTimeRemaining,
  estimateSecondsRemaining,
  type StepConfig,
  type StepState,
} from "./loading-steps";

type Props = {
  status: DilapsStatus;
  subStatus: DilapsSubStatus;
  uploadProgress: number;
  progressPct: number;
  totalSections: number;
  currentSection: number;
  statusMessage: string | null;
};

const UPLOAD_WEIGHT = 0.1;

function useElapsedSeconds() {
  const startRef = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    startRef.current = Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return elapsed;
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
  const elapsedSeconds = useElapsedSeconds();

  const effectiveProgress =
    status === "presigning" || status === "uploading"
      ? Math.round(uploadProgress * UPLOAD_WEIGHT)
      : progressPct;

  const secondsRemaining = estimateSecondsRemaining(effectiveProgress, elapsedSeconds);

  return (
    <div className="flex flex-1 items-center justify-center px-8 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Building your dilaps report</h2>
          {statusMessage && (
            <p className="text-sm text-muted-foreground animate-in fade-in duration-500">{statusMessage}</p>
          )}
        </div>

        <div className="space-y-3">
          <Progress value={effectiveProgress} className="h-2.5 bg-primary/10" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{effectiveProgress}% complete</span>
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
