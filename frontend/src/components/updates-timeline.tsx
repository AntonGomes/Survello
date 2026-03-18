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

function UpdateInputArea({ newUpdate, setNewUpdate, onSubmit, placeholder, disabled }: {
  newUpdate: string; setNewUpdate: (v: string) => void; onSubmit: () => void; placeholder: string; disabled: boolean
}) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); onSubmit(); }
  };
  return (
    <div className="flex gap-2">
      <Textarea value={newUpdate} onChange={(e) => setNewUpdate(e.target.value)} onKeyDown={handleKeyDown} placeholder={placeholder} className="min-h-[60px] resize-none" disabled={disabled} />
      <Button onClick={onSubmit} disabled={!newUpdate.trim() || disabled} size="icon" className="shrink-0"><Send className="h-4 w-4" /></Button>
    </div>
  );
}

function UpdateItem({ update }: { update: UpdateEntry }) {
  return (
    <div className="flex gap-3 text-sm">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted"><User className="h-4 w-4 text-muted-foreground" /></div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{update.user_name}</span>
          <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(update.created_at), { addSuffix: true })}</span>
        </div>
        <p className="text-muted-foreground whitespace-pre-wrap">{update.text}</p>
      </div>
    </div>
  );
}

export function UpdatesTimeline({ updates, onAddUpdate, isLoading = false, className, placeholder = "Add an update..." }: UpdatesTimelineProps) {
  const [newUpdate, setNewUpdate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newUpdate.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try { await onAddUpdate(newUpdate.trim()); setNewUpdate(""); } finally { setIsSubmitting(false); }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <UpdateInputArea newUpdate={newUpdate} setNewUpdate={setNewUpdate} onSubmit={handleSubmit} placeholder={placeholder} disabled={isSubmitting || isLoading} />
      {updates && updates.length > 0 ? (
        <div className="space-y-3">{updates.map((update, index) => <UpdateItem key={`${update.created_at}-${index}`} update={update} />)}</div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">No updates yet</p>
      )}
    </div>
  );
}
