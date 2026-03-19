"use client";

import { CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DilapsStatus, DilapsSubStatus } from "@/hooks/use-dilaps-generation";

type Props = {
  canStart: boolean;
  status: DilapsStatus;
  subStatus: DilapsSubStatus;
  uploadProgress: number;
  progressPct: number;
  onStart: () => void;
};

const SUB_STATUS_LABELS: Record<string, string> = {
  embedding: "Embedding documents...",
  sectioning: "Sectioning lease...",
  analyzing: "Analyzing survey data...",
  completed: "Complete",
};

function getStatusHeading(status: DilapsStatus) {
  if (status === "presigning") return "Preparing your files...";
  if (status === "uploading") return "Uploading files to storage...";
  if (status === "generating") return "Generating your dilaps report...";
  return "";
}

function getStatusDescription(status: DilapsStatus) {
  if (status === "presigning") return "Preparing your files for upload...";
  if (status === "uploading") return "Securely storing your files for analysis..";
  return null;
}

function GeneratingSteps({ subStatus }: { subStatus: DilapsSubStatus }) {
  const steps: DilapsSubStatus[] = ["embedding", "sectioning", "analyzing"];

  return (
    <div className="mt-3 space-y-2">
      {steps.map((step) => {
        if (!step) return null;
        const isActive = subStatus === step;
        const isDone = steps.indexOf(subStatus) > steps.indexOf(step);
        return (
          <StepRow
            key={step}
            label={SUB_STATUS_LABELS[step] ?? step}
            isActive={isActive}
            isDone={isDone}
          />
        );
      })}
    </div>
  );
}

type StepRowProps = {
  label: string;
  isActive: boolean;
  isDone: boolean;
};

function StepRow({ label, isActive, isDone }: StepRowProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {isDone && <CheckCircle2 className="w-4 h-4 text-accent" />}
      {isActive && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
      {!isDone && !isActive && (
        <div className="w-4 h-4 rounded-full border border-muted-foreground/30" />
      )}
      <span className={isDone ? "text-muted-foreground" : isActive ? "text-foreground font-medium" : "text-muted-foreground/60"}>
        {label}
      </span>
    </div>
  );
}

export function DilapsStatusPanel({
  canStart,
  status,
  subStatus,
  uploadProgress,
  progressPct,
  onStart,
}: Props) {
  const isIdle = status === "idle" || status === "error";
  const isUploading = status === "presigning" || status === "uploading";
  const isGenerating = status === "generating";

  return (
    <div className="flex justify-center mb-8">
      <div className={`w-full mx-auto transition-all duration-500 ease-out ${!isIdle ? "max-w-3xl" : "max-w-md"}`}>
        {isIdle && (
          <div className="flex justify-center">
            <Button
              onClick={onStart}
              disabled={!canStart}
              size="lg"
              variant="accent"
              className="px-8 py-6 text-lg rounded-xl hover:shadow-lg transition-all disabled:opacity-50 border border-accent/30 shadow-[0_14px_38px_-18px_rgba(83,162,85,0.45)]"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Dilaps
            </Button>
          </div>
        )}

        {!isIdle && (
          <ActiveStatusCard
            status={status}
            subStatus={subStatus}
            uploadProgress={uploadProgress}
            progressPct={progressPct}
            isUploading={isUploading}
            isGenerating={isGenerating}
          />
        )}
      </div>
    </div>
  );
}

type ActiveStatusCardProps = {
  status: DilapsStatus;
  subStatus: DilapsSubStatus;
  uploadProgress: number;
  progressPct: number;
  isUploading: boolean;
  isGenerating: boolean;
};

function ActiveStatusCard({
  status,
  subStatus,
  uploadProgress,
  progressPct,
  isUploading,
  isGenerating,
}: ActiveStatusCardProps) {
  const isProgressDone = uploadProgress >= 100;

  return (
    <div className="bg-card rounded-2xl shadow-lg border border-border px-6 py-5 transition-all duration-500 ease-out">
      <div className="flex items-start gap-3">
        <div className="mt-1">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">
            {getStatusHeading(status)}
          </p>

          {!isGenerating && (
            <p className="text-xs text-muted-foreground mt-1">
              {getStatusDescription(status)}
            </p>
          )}

          {isGenerating && <GeneratingSteps subStatus={subStatus} />}

          {isGenerating && progressPct > 0 && (
            <div className="mt-3">
              <Progress value={progressPct} className="h-2.5 bg-primary/10" />
            </div>
          )}

          {isUploading && (
            <div className={`mt-3 transition-all ease-in-out overflow-hidden ${isProgressDone ? "max-h-0 opacity-0 mt-0 duration-700 delay-500" : "max-h-20 opacity-100 duration-300"}`}>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                  <span>Upload progress</span>
                  <span className="text-foreground font-semibold">
                    {Math.round(uploadProgress)}%
                  </span>
                </div>
                <Progress
                  value={Math.round(uploadProgress)}
                  className="h-2.5 bg-primary/10"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
