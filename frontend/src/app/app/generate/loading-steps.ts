import {
  Image as ImageIcon,
  LayoutGrid,
  Search,
  FileCheck,
} from "lucide-react";
import type { DilapsStatus, DilapsSubStatus } from "@/hooks/use-dilaps-generation";

export type StepConfig = {
  key: string;
  icon: React.ElementType;
  label: string;
  description: string;
  matchStatus: DilapsStatus;
  matchSubStatus?: DilapsSubStatus;
};

export const STEPS: StepConfig[] = [
  {
    key: "upload",
    icon: FileCheck,
    label: "Uploading files",
    description: "Securely storing your documents and images",
    matchStatus: "uploading",
  },
  {
    key: "embedding",
    icon: ImageIcon,
    label: "Processing images",
    description: "Reading and understanding your survey photos",
    matchStatus: "generating",
    matchSubStatus: "embedding",
  },
  {
    key: "sectioning",
    icon: LayoutGrid,
    label: "Organising by area",
    description: "Grouping photos by area of the property",
    matchStatus: "generating",
    matchSubStatus: "sectioning",
  },
  {
    key: "analyzing",
    icon: Search,
    label: "Inspecting each area",
    description: "Identifying items of disrepair in each section",
    matchStatus: "generating",
    matchSubStatus: "analyzing",
  },
];

export type StepState = "done" | "active" | "pending";

export function getStepState(
  step: StepConfig,
  status: DilapsStatus,
  subStatus: DilapsSubStatus,
): StepState {
  const stepOrder = STEPS.map((s) => s.key);
  const currentIdx = STEPS.findIndex((s) => {
    if (status === "presigning" || status === "uploading") return s.key === "upload";
    if (status === "generating") return s.matchSubStatus === subStatus;
    return false;
  });
  const thisIdx = stepOrder.indexOf(step.key);

  if (currentIdx < 0) return "pending";
  if (thisIdx < currentIdx) return "done";
  if (thisIdx === currentIdx) return "active";
  return "pending";
}

const SECONDS_PER_MINUTE = 60;

export function formatTimeRemaining(seconds: number) {
  if (seconds < SECONDS_PER_MINUTE) return "Less than a minute remaining";
  const minutes = Math.ceil(seconds / SECONDS_PER_MINUTE);
  if (minutes === 1) return "About 1 minute remaining";
  return `About ${minutes} minutes remaining`;
}

export type ProgressSample = { time: number; pct: number };

const WINDOW_SECONDS = 30;
const MIN_WINDOW_SECONDS = 3;
const MIN_PCT_DELTA = 0.5;

export function estimateFromHistory(
  history: ProgressSample[],
): number | null {
  if (history.length < 2) return null;

  const latest = history[history.length - 1]!;
  const windowStart = latest.time - WINDOW_SECONDS * 1000;

  let anchor = history[0]!;
  for (const sample of history) {
    if (sample.time >= windowStart) {
      anchor = sample;
      break;
    }
  }

  const elapsedMs = latest.time - anchor.time;
  const pctDelta = latest.pct - anchor.pct;

  if (elapsedMs < MIN_WINDOW_SECONDS * 1000 || pctDelta < MIN_PCT_DELTA) {
    return null;
  }

  const ratePerMs = pctDelta / elapsedMs;
  const remainingMs = (100 - latest.pct) / ratePerMs;
  return Math.max(0, Math.round(remainingMs / 1000));
}
