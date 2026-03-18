
const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const MS_PER_DAY = MS_PER_SECOND * SECONDS_PER_MINUTE * MINUTES_PER_HOUR * HOURS_PER_DAY;

const AMBER_THRESHOLD_DAYS = 7;
const RED_THRESHOLD_DAYS = 14;


export function daysSince(date: Date | string): number {
  const then = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - then.getTime();
  return Math.floor(diffMs / MS_PER_DAY);
}


export function getStalenessStatus(
  updatedAt: Date | string
): "fresh" | "stale" | "critical" {
  const days = daysSince(updatedAt);

  if (days >= RED_THRESHOLD_DAYS) {
    return "critical";
  }
  if (days >= AMBER_THRESHOLD_DAYS) {
    return "stale";
  }
  return "fresh";
}


export function getStalenessRowClass(updatedAt: Date | string): string {
  const status = getStalenessStatus(updatedAt);

  switch (status) {
    case "critical":
      return "bg-red-50 dark:bg-red-950/30";
    case "stale":
      return "bg-amber-50 dark:bg-amber-950/30";
    default:
      return "";
  }
}


export function getStalenessBorderClass(updatedAt: Date | string): string {
  const status = getStalenessStatus(updatedAt);

  switch (status) {
    case "critical":
      return "border-red-300 dark:border-red-800";
    case "stale":
      return "border-amber-300 dark:border-amber-800";
    default:
      return "";
  }
}


export function getStalenessText(updatedAt: Date | string): string {
  const days = daysSince(updatedAt);

  if (days === 0) {
    return "Today";
  }
  if (days === 1) {
    return "Yesterday";
  }
  return `${days} days ago`;
}


export function getStalenessBadgeVariant(
  updatedAt: Date | string
): "default" | "secondary" | "destructive" | "outline" {
  const status = getStalenessStatus(updatedAt);

  switch (status) {
    case "critical":
      return "destructive";
    case "stale":
      return "outline";
    default:
      return "secondary";
  }
}
