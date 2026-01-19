"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface UpdateEntry {
  text: string;
  user_id: number;
  user_name: string;
  created_at: string;
}

interface UpdatesTimelineProps {
  updates: UpdateEntry[] | null | undefined;
  onAddUpdate: (text: string) => Promise<void>;
  isLoading?: boolean;
  className?: string;
  placeholder?: string;
}

export function UpdatesTimeline({
  updates,
  onAddUpdate,
  isLoading = false,
  className,
  placeholder = "Add an update...",
}: UpdatesTimelineProps) {
  const [newUpdate, setNewUpdate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newUpdate.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddUpdate(newUpdate.trim());
      setNewUpdate("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Add update input */}
      <div className="flex gap-2">
        <Textarea
          value={newUpdate}
          onChange={(e) => setNewUpdate(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-[60px] resize-none"
          disabled={isSubmitting || isLoading}
        />
        <Button
          onClick={handleSubmit}
          disabled={!newUpdate.trim() || isSubmitting || isLoading}
          size="icon"
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Timeline */}
      {updates && updates.length > 0 ? (
        <div className="space-y-3">
          {updates.map((update, index) => (
            <div
              key={`${update.created_at}-${index}`}
              className="flex gap-3 text-sm"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{update.user_name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(update.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {update.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">
          No updates yet
        </p>
      )}
    </div>
  );
}
