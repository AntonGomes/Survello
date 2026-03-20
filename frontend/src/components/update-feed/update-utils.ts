import { format, isToday, isYesterday } from "date-fns"
import { Upload, FolderPlus, ClipboardList, RefreshCw, MessageSquare } from "lucide-react"
import type { UpdateItem, LegacyUpdateEntry } from "./types"

function isLegacyUpdate(update: UpdateItem | LegacyUpdateEntry): update is LegacyUpdateEntry {
  return "user_id" in update && !("id" in update)
}

export function normalizeUpdate(update: UpdateItem | LegacyUpdateEntry): UpdateItem {
  if (isLegacyUpdate(update)) {
    const initials = update.user_name
      ? update.user_name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()
      : "??"
    return {
      id: `legacy-${update.created_at}-${update.user_id}`,
      update_type: "text",
      text: update.text,
      author_id: update.user_id,
      author_name: update.user_name,
      author_initials: initials,
      created_at: update.created_at,
    }
  }
  return update
}

export function getUpdateIcon(updateType: UpdateItem["update_type"]) {
  switch (updateType) {
    case "file_upload": return Upload
    case "project_created": return FolderPlus
    case "survey_created": return ClipboardList
    case "status_change": return RefreshCw
    default: return MessageSquare
  }
}

export function isSystemUpdate(updateType: UpdateItem["update_type"]): boolean {
  return updateType !== "text"
}

export function formatTimelineDate(dateString: string): { date: string; time: string } {
  const date = new Date(dateString)
  const time = format(date, "HH:mm:ss")
  if (isToday(date)) return { date: "today", time }
  if (isYesterday(date)) return { date: "yesterday", time }
  return { date: format(date, "dd/MM/yy"), time }
}
