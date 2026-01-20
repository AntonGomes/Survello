"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClientMutation, readClientsOptions } from "@/client/@tanstack/react-query.gen";
import type { ClientCreate } from "@/client/types.gen";

interface InlineCreateClientProps {
  onCreated: (clientId: number) => void;
  onCancel: () => void;
}

export function InlineCreateClient({ onCreated, onCancel }: InlineCreateClientProps) {
  const [name, setName] = useState("");
  const queryClient = useQueryClient();

  const { mutate: createClient, isPending } = useMutation({
    ...createClientMutation(),
    onSuccess: (newClient) => {
      queryClient.invalidateQueries({ queryKey: readClientsOptions().queryKey });
      onCreated(newClient.id);
    },
  });

  const handleSubmit = () => {
    if (!name.trim()) return;
    
    const clientData: ClientCreate = {
      name: name.trim(),
      address: null,
      contacts: [],
    };

    createClient({ body: clientData });
  };

  return (
    <div className="flex gap-2">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New client name"
        className="h-10"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit();
          }
          if (e.key === "Escape") {
            onCancel();
          }
        }}
      />
      <Button
        type="button"
        size="icon"
        onClick={handleSubmit}
        disabled={isPending || !name.trim()}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Check className="h-4 w-4" />
        )}
      </Button>
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={onCancel}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
