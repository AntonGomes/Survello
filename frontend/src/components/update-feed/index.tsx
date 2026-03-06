"use client"

import { useState } from "react"
import { Clock, MessageSquare, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

import type { UpdateItem, UpdateFeedProps } from "./types"
import { normalizeUpdate, getUpdateIcon, isSystemUpdate, formatTimelineDate } from "./update-utils"

export type { UpdateItem, LegacyUpdateEntry, UpdateFeedProps } from "./types"

const DEFAULT_PAGE_SIZE = 10

export function UpdateFeed({ updates, currentUserId, onAddUpdate, onDeleteUpdate, isLoading, className, placeholder = "Write an update...", showDeleteButton = true, maxInitialItems }: UpdateFeedProps) {
  const [newUpdateText, setNewUpdateText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [visibleCount, setVisibleCount] = useState(maxInitialItems || Infinity)

  const handleAddUpdate = async () => {
    if (newUpdateText.trim() && !isSubmitting) {
      setIsSubmitting(true)
      try { await onAddUpdate(newUpdateText.trim()); setNewUpdateText("") } finally { setIsSubmitting(false) }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddUpdate() }
  }

  const normalizedUpdates = (updates || []).map(normalizeUpdate).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  const visibleUpdates = normalizedUpdates.slice(0, visibleCount)
  const hasMore = normalizedUpdates.length > visibleCount
  const remainingCount = normalizedUpdates.length - visibleCount

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><MessageSquare className="h-4 w-4" /><span>Updates</span></div>
      <NewUpdateInput newUpdateText={newUpdateText} setNewUpdateText={setNewUpdateText} handleKeyDown={handleKeyDown} placeholder={placeholder} isDisabled={!!isLoading || isSubmitting} />
      {visibleUpdates.length > 0 ? (
        <div>
          {visibleUpdates.map((update, index) => (
            <UpdateRow key={update.id} update={update} currentUserId={currentUserId} showDeleteButton={showDeleteButton} onDeleteUpdate={onDeleteUpdate} isLast={index === visibleUpdates.length - 1 && !hasMore} />
          ))}
          {hasMore && <ShowMoreButton remainingCount={remainingCount} pageSize={maxInitialItems || DEFAULT_PAGE_SIZE} onClick={() => setVisibleCount(prev => prev + (maxInitialItems || DEFAULT_PAGE_SIZE))} />}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">No updates yet</p>
      )}
    </div>
  )
}

function NewUpdateInput({ newUpdateText, setNewUpdateText, handleKeyDown, placeholder, isDisabled }: {
  newUpdateText: string; setNewUpdateText: (v: string) => void; handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void; placeholder: string; isDisabled: boolean
}) {
  return (
    <div className="flex">
      <div className="flex flex-col items-center mr-3 shrink-0"><div className="w-2 h-2 rounded-full bg-primary" /><div className="w-px flex-1 bg-border" /></div>
      <div className="flex-1 pb-4">
        <div className="text-xs text-muted-foreground mb-1"><span className="font-medium">now</span></div>
        <div className="flex items-start gap-2">
          <span className="text-xs text-muted-foreground pt-0.5 shrink-0">You:</span>
          <textarea value={newUpdateText} onChange={(e) => setNewUpdateText(e.target.value)} onKeyDown={handleKeyDown} placeholder={placeholder} className="w-full resize-none bg-transparent border-0 p-0 text-sm leading-relaxed focus:outline-none focus:ring-0 placeholder:text-muted-foreground/50" rows={1} disabled={isDisabled} />
        </div>
      </div>
    </div>
  )
}

function UpdateRow({ update, currentUserId, showDeleteButton, onDeleteUpdate, isLast }: {
  update: UpdateItem; currentUserId: number; showDeleteButton: boolean; onDeleteUpdate?: (id: string) => void; isLast: boolean
}) {
  const Icon = getUpdateIcon(update.update_type)
  const isSystem = isSystemUpdate(update.update_type)
  const canDelete = showDeleteButton && onDeleteUpdate && !isSystem && update.author_id === currentUserId && !update.id.startsWith("legacy-")
  const { date, time } = formatTimelineDate(update.created_at)

  return (
    <div className="flex group">
      <div className="flex flex-col items-center mr-3 shrink-0">
        <div className={cn("w-2 h-2 rounded-full", isSystem ? "bg-muted-foreground/50" : "bg-primary")} />
        {!isLast && <div className="w-px flex-1 bg-border" />}
      </div>
      <div className={cn("flex-1 min-w-0", !isLast && "pb-4")}>
        <div className="text-xs text-muted-foreground mb-1 font-mono"><span className="font-medium">{date}</span><span className="mx-1">{"\u00B7"}</span><span>{time}</span></div>
        <div className="flex items-start gap-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 pt-0.5">
            {isSystem && <Icon className="h-3 w-3" />}
            <span className="font-medium">{update.author_id === currentUserId ? "You" : update.author_initials || update.author_name || "??"}:</span>
          </div>
          <p className={cn("text-sm whitespace-pre-wrap break-words leading-relaxed flex-1", isSystem && "text-muted-foreground italic")}>{update.text}</p>
          <UpdateMetadata update={update} />
          {canDelete && <DeleteUpdateButton onDelete={() => onDeleteUpdate?.(update.id)} />}
        </div>
      </div>
    </div>
  )
}

function UpdateMetadata({ update }: { update: UpdateItem }) {
  if (!update.time_entry_id && !update.source_project_name) return null
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
      {update.time_entry_id && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /></span>}
      {update.source_project_name && <span className="italic">from {update.source_project_name}</span>}
    </div>
  )
}

function DeleteUpdateButton({ onDelete }: { onDelete: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"><Trash2 className="h-3 w-3" /></Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>Delete update?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone. This will permanently delete this update.</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function ShowMoreButton({ remainingCount, pageSize, onClick }: { remainingCount: number; pageSize: number; onClick: () => void }) {
  return (
    <div className="flex">
      <div className="flex flex-col items-center mr-3 shrink-0"><div className="w-2 h-2 rounded-full bg-muted-foreground/30" /></div>
      <div className="flex-1 pb-4">
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground" onClick={onClick}>
          Show {Math.min(remainingCount, pageSize)} more{remainingCount > pageSize && ` of ${remainingCount}`}
        </Button>
      </div>
    </div>
  )
}
