"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Clock, MessageSquare, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
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

// Match the backend ProjectUpdateItem structure
export interface ProjectUpdateItem {
  id: string
  text: string
  author_id: number
  author_name: string | null
  author_initials: string | null
  created_at: string
  time_entry_id: number | null
}

interface ProjectUpdateFeedProps {
  updates: ProjectUpdateItem[]
  description: string | null
  currentUserId: number
  onAddUpdate: (text: string) => void
  onDeleteUpdate: (updateId: string) => void
  onDescriptionChange: (description: string) => void
  isLoading?: boolean
}

export function ProjectUpdateFeed({
  updates,
  description,
  currentUserId,
  onAddUpdate,
  onDeleteUpdate,
  onDescriptionChange,
  isLoading,
}: ProjectUpdateFeedProps) {
  const [newUpdateText, setNewUpdateText] = useState("")
  const [editedDescription, setEditedDescription] = useState(description || "")
  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false)

  const handleAddUpdate = () => {
    if (newUpdateText.trim()) {
      onAddUpdate(newUpdateText.trim())
      setNewUpdateText("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleAddUpdate()
    }
  }

  const handleDescriptionKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Save on Enter (without shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleDescriptionSave()
      ;(e.target as HTMLTextAreaElement).blur()
    }
    // Cancel on Escape
    if (e.key === "Escape") {
      setEditedDescription(description || "")
      ;(e.target as HTMLTextAreaElement).blur()
    }
  }

  const handleDescriptionSave = () => {
    if (editedDescription !== description) {
      onDescriptionChange(editedDescription)
    }
  }

  const handleDescriptionBlur = () => {
    setIsDescriptionFocused(false)
    handleDescriptionSave()
  }

  return (
    <div className="space-y-4">
      {/* Description Section (First Paragraph) */}
      <div>
        <textarea
          value={editedDescription}
          onChange={(e) => setEditedDescription(e.target.value)}
          onKeyDown={handleDescriptionKeyDown}
          onFocus={() => setIsDescriptionFocused(true)}
          onBlur={handleDescriptionBlur}
          placeholder="Add a project description..."
          className={`text-lg w-full resize-none bg-transparent border-0 p-0 text-base leading-relaxed focus:outline-none focus:ring-0 placeholder:text-muted-foreground/60 placeholder:italic ${
            isDescriptionFocused ? "text-foreground" : "text-foreground"
          }`}
          rows={Math.max(2, editedDescription.split("\n").length)}
          disabled={isLoading}
        />
      </div>

      <Separator />

      {/* Updates Feed */}
      <div className="space-y-3">
        {/* Updates Header */}
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
          <span>Updates</span>
        </div>

        {/* New Update Input - Document-like inline */}
        <div className="flex gap-3 items-start">
          <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0 pt-0.5">
            <span className="font-medium">You</span>
            <span>·</span>
            <span>now</span>
          </div>
          <div className="flex-1 min-w-0">
            <textarea
              value={newUpdateText}
              onChange={(e) => setNewUpdateText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write an update..."
              className="w-full resize-none bg-transparent border-0 p-0 text-sm leading-relaxed focus:outline-none focus:ring-0 placeholder:text-muted-foreground/50"
              rows={1}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Updates List */}
        {updates.length > 0 && (
          <div className="space-y-3">
            {[...updates].reverse().map((update) => (
              <div key={update.id} className="flex gap-3 items-start group">
                <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0 pt-0.5">
                  <span className="font-medium">
                    {update.author_id === currentUserId
                      ? "You"
                      : update.author_initials || "??"}
                  </span>
                  <span>·</span>
                  <span>
                    {formatDistanceToNow(new Date(update.created_at), {
                      addSuffix: false,
                    })}
                  </span>
                  {update.time_entry_id && (
                    <>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        time
                      </span>
                    </>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                    {update.text}
                  </p>
                </div>
                {/* Delete button - only show for own updates */}
                {update.author_id === currentUserId && (
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
                          onClick={() => onDeleteUpdate(update.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
