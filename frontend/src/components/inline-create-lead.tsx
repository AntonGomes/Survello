"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createLeadMutation, readLeadsOptions } from "@/client/@tanstack/react-query.gen";

interface InlineCreateLeadProps {
  onCreated: (leadId: number) => void;
  onCancel: () => void;
}

export function InlineCreateLead({ onCreated, onCancel }: InlineCreateLeadProps) {
  const [name, setName] = useState("");
  const queryClient = useQueryClient();

  const { mutate: createLead, isPending } = useMutation({
    ...createLeadMutation(),
    onSuccess: (newLead) => { queryClient.invalidateQueries({ queryKey: readLeadsOptions().queryKey }); onCreated(newLead.id); },
  });

  const handleSubmit = () => {
    if (!name.trim()) return;
    createLead({ body: { name: name.trim(), contact_name: null, email: null, phone: null, notes: null, status: "new" } });
  };

  return (
    <div className="flex gap-2">
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="New lead name" className="h-10" autoFocus
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSubmit(); } if (e.key === "Escape") onCancel(); }} />
      <Button type="button" size="icon" onClick={handleSubmit} disabled={isPending || !name.trim()}>
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
      </Button>
      <Button type="button" size="icon" variant="ghost" onClick={onCancel}><X className="h-4 w-4" /></Button>
    </div>
  );
}
