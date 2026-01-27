"use client";

import { useState, FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  createClientMutation,
  readClientsOptions
} from "@/client/@tanstack/react-query.gen";
import { type ClientCreate } from "@/client/types.gen";
import { toast } from "sonner";

export function CreateClientDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [isIndividual, setIsIndividual] = useState(false);
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const resetForm = () => {
    setName("");
    setAddress("");
    setIsIndividual(false);
    setContactName("");
    setEmail("");
    setPhone("");
  };

  const { mutate: createClient, isPending } = useMutation({
    ...createClientMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: readClientsOptions().queryKey });
      setOpen(false);
      resetForm();
      toast.success("Client created");
    },
    onError: () => {
      toast.error("Failed to create client");
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    
    if (name.length < 2) {
      toast.error("Client name must be at least 2 characters");
      return;
    }

    if (isIndividual) {
      // Individual: use client-level email/phone, create contact with client name
      const clientData: ClientCreate = {
        name,
        address: address || null,
        is_individual: true,
        email: email || null,
        phone: phone || null,
        contacts: [{
          name: name, // Use client name as contact name
          email: email || null,
          phone: phone || null,
        }],
      };
      createClient({ body: clientData });
    } else {
      // Business: require a contact
      if (!contactName || contactName.length < 2) {
        toast.error("Please provide a contact name");
        return;
      }
      
      const clientData: ClientCreate = {
        name,
        address: address || null,
        is_individual: false,
        email: null,
        phone: null,
        contacts: [{
          name: contactName,
          email: email || null,
          phone: phone || null,
        }],
      };
      createClient({ body: clientData });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Client
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Client</DialogTitle>
          <DialogDescription>
            Add a new client to your organisation.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="is-individual" className="text-sm">
              Individual (no separate contacts)
            </Label>
            <Switch
              id="is-individual"
              checked={isIndividual}
              onCheckedChange={setIsIndividual}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">
              {isIndividual ? "Name" : "Company Name"}
            </Label>
            <Input
              id="name"
              placeholder={isIndividual ? "John Smith" : "Acme Corp"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="123 Main St, City, Country"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          {!isIndividual && (
            <div className="space-y-2">
              <Label htmlFor="contact-name">Primary Contact Name</Label>
              <Input
                id="contact-name"
                placeholder="Jane Doe"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required={!isIndividual}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="contact@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 234 567 8900"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Client
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
