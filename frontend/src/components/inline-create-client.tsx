"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClientMutation, readClientsOptions } from "@/client/@tanstack/react-query.gen";
import type { ClientCreate } from "@/client/types.gen";

interface InlineCreateClientProps {
  onCreated: (clientId: number) => void;
  onCancel: () => void;
}

export function InlineCreateClient({ onCreated, onCancel }: InlineCreateClientProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
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
      address: address.trim() || null,
      contacts: [],
    };

    createClient({ body: clientData });
  };

  return (
    <div className="space-y-3 p-3 rounded-lg border bg-muted/30">
      <div className="space-y-2">
        <Label htmlFor="client-name" className="text-xs">Client Name *</Label>
        <Input
          id="client-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Company name"
          className="h-9"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              onCancel();
            }
          }}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="client-address" className="text-xs">Address</Label>
        <Input
          id="client-address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Company address (optional)"
          className="h-9"
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
      </div>
      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleSubmit}
          disabled={isPending || !name.trim()}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Check className="h-4 w-4 mr-2" />
          )}
          Create Client
        </Button>
      </div>
    </div>
  );
}
