"use client"

import { useState } from "react"
import { Plus, Loader2 } from "lucide-react"
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select"
import { InlineCreateClient } from "@/components/inline-create-client"
import { InlineCreateLead } from "@/components/inline-create-lead"

interface ClientLeadSelectProps {
  field: { value?: string; onChange: (value: string) => void }
  clients: Array<{ id: number; name: string }> | undefined
  leads: Array<{ id: number; name: string; status?: string | null }> | undefined
  isLoading: boolean
}

function InlineCreateWrapper({ type, field, onDone }: {
  type: "client" | "lead"; field: { onChange: (v: string) => void }; onDone: () => void
}) {
  if (type === "client") {
    return <InlineCreateClient onCreated={(id) => { field.onChange(`client:${id}`); onDone() }} onCancel={onDone} />
  }
  return <InlineCreateLead onCreated={(id) => { field.onChange(`lead:${id}`); onDone() }} onCancel={onDone} />
}

export function ClientLeadSelect({ field, clients, leads, isLoading }: ClientLeadSelectProps) {
  const [creatingType, setCreatingType] = useState<"client" | "lead" | null>(null)

  if (creatingType) {
    return (
      <FormItem className="col-span-2">
        <FormLabel>Client or Lead</FormLabel>
        <InlineCreateWrapper type={creatingType} field={field} onDone={() => setCreatingType(null)} />
        <FormMessage />
      </FormItem>
    )
  }

  const handleValueChange = (val: string) => {
    if (val === "_new_client") setCreatingType("client")
    else if (val === "_new_lead") setCreatingType("lead")
    else field.onChange(val)
  }

  const filteredLeads = leads?.filter(l => l.status !== "converted" && l.status !== "lost")

  return (
    <FormItem className="col-span-2">
      <FormLabel>Client or Lead</FormLabel>
      <Select onValueChange={handleValueChange} value={field.value}>
        <FormControl><SelectTrigger><SelectValue placeholder="Select a client or lead" /></SelectTrigger></FormControl>
        <SelectContent>
          {isLoading ? <div className="flex items-center justify-center p-2"><Loader2 className="h-4 w-4 animate-spin" /></div> : <ClientLeadOptions clients={clients} leads={filteredLeads} />}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )
}

function ClientLeadOptions({ clients, leads }: {
  clients: Array<{ id: number; name: string }> | undefined
  leads: Array<{ id: number; name: string }> | undefined
}) {
  return (
    <>
      {clients && clients.length > 0 && (
        <>
          <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">Clients</div>
          {clients.map((c) => <SelectItem key={`client:${c.id}`} value={`client:${c.id}`}>{c.name}</SelectItem>)}
        </>
      )}
      <SelectSeparator />
      <SelectItem value="_new_client" className="text-primary font-medium">
        <div className="flex items-center gap-2"><Plus className="h-4 w-4" />Create New Client...</div>
      </SelectItem>
      {leads && leads.length > 0 && (
        <>
          <SelectSeparator />
          <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">Leads</div>
          {leads.map((l) => <SelectItem key={`lead:${l.id}`} value={`lead:${l.id}`}>{l.name}</SelectItem>)}
        </>
      )}
      <SelectSeparator />
      <SelectItem value="_new_lead" className="text-primary font-medium">
        <div className="flex items-center gap-2"><Plus className="h-4 w-4" />Create New Lead...</div>
      </SelectItem>
    </>
  )
}
