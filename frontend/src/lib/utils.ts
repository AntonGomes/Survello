import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "detail" in err && typeof (err as { detail: unknown }).detail === "string") return (err as { detail: string }).detail
  if (err instanceof Error) return err.message
  return fallback
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—"
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}
