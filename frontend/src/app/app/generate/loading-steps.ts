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
const MIN_PROGRESS_FOR_ESTIMATE = 8;
const MIN_ELAPSED_SECONDS = 3;

export function formatTimeRemaining(seconds: number) {
  if (seconds < SECONDS_PER_MINUTE) return "Less than a minute remaining";
  const minutes = Math.ceil(seconds / SECONDS_PER_MINUTE);
  if (minutes === 1) return "About 1 minute remaining";
  return `About ${minutes} minutes remaining`;
}

export function estimateSecondsRemaining(
  progressPct: number,
  elapsedSeconds: number,
) {
  if (progressPct < MIN_PROGRESS_FOR_ESTIMATE || elapsedSeconds < MIN_ELAPSED_SECONDS) {
    return null;
  }
  const rate = progressPct / elapsedSeconds;
  const remaining = (100 - progressPct) / rate;
  return Math.max(0, Math.round(remaining));
}
