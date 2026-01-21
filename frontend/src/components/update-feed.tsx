"use client"

import { useState } from "react"
import { format, isToday, isYesterday } from "date-fns"
import { 
  Clock, 
  MessageSquare, 
  Trash2, 
  Upload, 
  FolderPlus, 
  ClipboardList,
  RefreshCw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

// Unified UpdateItem structure matching the backend
export interface UpdateItem {
  id: string
  update_type: "text" | "file_upload" | "project_created" | "survey_created" | "status_change" | "job_created"
  text: string
  author_id: number
  author_name: string | null
  author_initials: string | null
  created_at: string
  time_entry_id?: number | null
  project_id?: number | null
  survey_id?: number | null
  file_count?: number | null
  source_project_id?: number | null
  source_project_name?: string | null
}

// Legacy format for backward compatibility
export interface LegacyUpdateEntry {
  text: string
  user_id: number
  user_name: string
  created_at: string
}

interface UpdateFeedProps {
  updates: (UpdateItem | LegacyUpdateEntry)[] | null | undefined
  currentUserId: number
  onAddUpdate: (text: string) => Promise<void> | void
  onDeleteUpdate?: (updateId: string) => void
  isLoading?: boolean
  className?: string
  placeholder?: string
  showDeleteButton?: boolean
  maxInitialItems?: number
}

// Check if update is legacy format
function isLegacyUpdate(update: UpdateItem | LegacyUpdateEntry): update is LegacyUpdateEntry {
  return 'user_id' in update && !('id' in update)
}

// Convert legacy update to new format
function normalizeUpdate(update: UpdateItem | LegacyUpdateEntry): UpdateItem {
  if (isLegacyUpdate(update)) {
    // Generate initials from user_name
    const initials = update.user_name
      ? update.user_name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
      : '??'
    
    return {
      id: `legacy-${update.created_at}-${update.user_id}`,
      update_type: 'text',
      text: update.text,
      author_id: update.user_id,
      author_name: update.user_name,
      author_initials: initials,
      created_at: update.created_at,
    }
  }
  return update
}

// Get icon for update type
function getUpdateIcon(updateType: UpdateItem['update_type']) {
  switch (updateType) {
    case 'file_upload':
      return Upload
    case 'project_created':
      return FolderPlus
    case 'survey_created':
      return ClipboardList
    case 'status_change':
      return RefreshCw
    default:
      return MessageSquare
  }
}

// Check if update is system-generated (not deletable)
function isSystemUpdate(updateType: UpdateItem['update_type']): boolean {
  return updateType !== 'text'
}

// Format datetime for timeline display
function formatTimelineDate(dateString: string): { date: string; time: string } {
  const date = new Date(dateString)
  const time = format(date, "HH:mm:ss")
  
  if (isToday(date)) {
    return { date: "today", time }
  }
  if (isYesterday(date)) {
    return { date: "yesterday", time }
  }
  return { date: format(date, "dd/MM/yy"), time }
}

export function UpdateFeed({
  updates,
  currentUserId,
  onAddUpdate,
  onDeleteUpdate,
  isLoading,
  className,
  placeholder = "Write an update...",
  showDeleteButton = true,
  maxInitialItems,
}: UpdateFeedProps) {
  const [newUpdateText, setNewUpdateText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [visibleCount, setVisibleCount] = useState(maxInitialItems || Infinity)

  const handleAddUpdate = async () => {
    if (newUpdateText.trim() && !isSubmitting) {
      setIsSubmitting(true)
      try {
        await onAddUpdate(newUpdateText.trim())
        setNewUpdateText("")
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleAddUpdate()
    }
  }

  // Normalize and sort updates (newest first)
  const normalizedUpdates = (updates || [])
    .map(normalizeUpdate)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // Apply pagination
  const visibleUpdates = normalizedUpdates.slice(0, visibleCount)
  const hasMore = normalizedUpdates.length > visibleCount
  const remainingCount = normalizedUpdates.length - visibleCount

  return (
    <div className={cn("space-y-3", className)}>
      {/* Updates Header */}
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <MessageSquare className="h-4 w-4" />
        <span>Updates</span>
      </div>

      {/* New Update Input - Timeline style */}
      <div className="flex">
        {/* Timeline column */}
        <div className="flex flex-col items-center mr-3 shrink-0">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <div className="w-px flex-1 bg-border" />
        </div>
        
        {/* Content */}
        <div className="flex-1 pb-4">
          <div className="text-xs text-muted-foreground mb-1">
            <span className="font-medium">now</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-xs text-muted-foreground pt-0.5 shrink-0">You:</span>
            <textarea
              value={newUpdateText}
              onChange={(e) => setNewUpdateText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full resize-none bg-transparent border-0 p-0 text-sm leading-relaxed focus:outline-none focus:ring-0 placeholder:text-muted-foreground/50"
              rows={1}
              disabled={isLoading || isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* Updates List - Timeline */}
      {visibleUpdates.length > 0 ? (
        <div>
          {visibleUpdates.map((update, index) => {
            const Icon = getUpdateIcon(update.update_type)
            const isSystem = isSystemUpdate(update.update_type)
            const canDelete = showDeleteButton && 
                            onDeleteUpdate && 
                            !isSystem && 
                            update.author_id === currentUserId &&
                            !update.id.startsWith('legacy-')
            const isLast = index === visibleUpdates.length - 1 && !hasMore
            const { date, time } = formatTimelineDate(update.created_at)
            
            return (
              <div key={update.id} className="flex group">
                {/* Timeline column */}
                <div className="flex flex-col items-center mr-3 shrink-0">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    isSystem ? "bg-muted-foreground/50" : "bg-primary"
                  )} />
                  {!isLast && <div className="w-px flex-1 bg-border" />}
                </div>
                
                {/* Content */}
                <div className={cn("flex-1 min-w-0", !isLast && "pb-4")}>
                  {/* Datetime header */}
                  <div className="text-xs text-muted-foreground mb-1 font-mono">
                    <span className="font-medium">{date}</span>
                    <span className="mx-1">·</span>
                    <span>{time}</span>
                  </div>
                  
                  {/* Update content */}
                  <div className="flex items-start gap-2">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 pt-0.5">
                      {isSystem && <Icon className="h-3 w-3" />}
                      <span className="font-medium">
                        {update.author_id === currentUserId
                          ? "You"
                          : update.author_initials || update.author_name || "??"}:
                      </span>
                    </div>
                    <p className={cn(
                      "text-sm whitespace-pre-wrap break-words leading-relaxed flex-1",
                      isSystem && "text-muted-foreground italic"
                    )}>
                      {update.text}
                    </p>
                    
                    {/* Metadata badges */}
                    {(update.time_entry_id || update.source_project_name) && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                        {update.time_entry_id && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                          </span>
                        )}
                        {update.source_project_name && (
                          <span className="italic">
                            from {update.source_project_name}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Delete button */}
                    {canDelete && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete update?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently
                              delete this update.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDeleteUpdate?.(update.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
          
          {/* Show More Button */}
          {hasMore && (
            <div className="flex">
              {/* Timeline column - continuation */}
              <div className="flex flex-col items-center mr-3 shrink-0">
                <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
              </div>
              {/* Button */}
              <div className="flex-1 pb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setVisibleCount(prev => prev + (maxInitialItems || 10))}
                >
                  Show {Math.min(remainingCount, maxInitialItems || 10)} more
                  {remainingCount > (maxInitialItems || 10) && ` of ${remainingCount}`}
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          No updates yet
        </p>
      )}
    </div>
  )
}
