"use client";

import { useState, FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { createClientMutation, readClientsOptions } from "@/client/@tanstack/react-query.gen";
import { type ClientCreate } from "@/client/types.gen";
import { toast } from "sonner";

function buildClientData({ name, address, isIndividual, contactName, email, phone }: {
  name: string; address: string; isIndividual: boolean; contactName: string; email: string; phone: string
}): ClientCreate | null {
  if (name.length < 2) { toast.error("Client name must be at least 2 characters"); return null; }
  if (isIndividual) {
    return { name, address: address || null, is_individual: true, email: email || null, phone: phone || null, contacts: [{ name, email: email || null, phone: phone || null }] };
  }
  if (!contactName || contactName.length < 2) { toast.error("Please provide a contact name"); return null; }
  return { name, address: address || null, is_individual: false, email: null, phone: null, contacts: [{ name: contactName, email: email || null, phone: phone || null }] };
}

function ClientFormFields({ name, setName, address, setAddress, isIndividual, setIsIndividual, contactName, setContactName, email, setEmail, phone, setPhone }: {
  name: string; setName: (v: string) => void; address: string; setAddress: (v: string) => void
  isIndividual: boolean; setIsIndividual: (v: boolean) => void; contactName: string; setContactName: (v: string) => void
  email: string; setEmail: (v: string) => void; phone: string; setPhone: (v: string) => void
}) {
  return (
    <>
      <div className="flex items-center justify-between">
        <Label htmlFor="is-individual" className="text-sm">Individual (no separate contacts)</Label>
        <Switch id="is-individual" checked={isIndividual} onCheckedChange={setIsIndividual} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">{isIndividual ? "Name" : "Company Name"}</Label>
        <Input id="name" placeholder={isIndividual ? "John Smith" : "Acme Corp"} value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" placeholder="123 Main St, City, Country" value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>
      {!isIndividual && (
        <div className="space-y-2">
          <Label htmlFor="contact-name">Primary Contact Name</Label>
          <Input id="contact-name" placeholder="Jane Doe" value={contactName} onChange={(e) => setContactName(e.target.value)} required={!isIndividual} />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="contact@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" type="tel" placeholder="+1 234 567 8900" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
    </>
  );
}

export function CreateClientDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [isIndividual, setIsIndividual] = useState(false);
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const resetForm = () => { setName(""); setAddress(""); setIsIndividual(false); setContactName(""); setEmail(""); setPhone(""); };

  const { mutate: createClient, isPending } = useMutation({
    ...createClientMutation(),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: readClientsOptions().queryKey }); setOpen(false); resetForm(); toast.success("Client created"); },
    onError: () => { toast.error("Failed to create client"); },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const data = buildClientData({ name, address, isIndividual, contactName, email, phone });
    if (data) createClient({ body: data });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Create Client</Button></DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader><DialogTitle>Create Client</DialogTitle><DialogDescription>Add a new client to your organisation.</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ClientFormFields name={name} setName={setName} address={address} setAddress={setAddress} isIndividual={isIndividual} setIsIndividual={setIsIndividual} contactName={contactName} setContactName={setContactName} email={email} setEmail={setEmail} phone={phone} setPhone={setPhone} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create Client</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
