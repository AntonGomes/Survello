/**
 * Staleness indicator utility for leads and quotes.
 * Color codes items based on time since last update.
 */

// Hardcoded thresholds for alpha (days)
const AMBER_THRESHOLD_DAYS = 7;
const RED_THRESHOLD_DAYS = 14;

/**
 * Calculate days since a given date
 */
export function daysSince(date: Date | string): number {
  const then = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - then.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Get the staleness status based on updated_at date
 */
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

/**
 * Get Tailwind background class for row highlighting based on staleness
 */
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

/**
 * Get Tailwind border class for card highlighting based on staleness
 */
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

/**
 * Get human-readable staleness text
 */
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

/**
 * Get badge variant based on staleness
 */
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
