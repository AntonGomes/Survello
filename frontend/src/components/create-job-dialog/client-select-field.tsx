"use client"

import { useState } from "react"
import { Plus, Loader2 } from "lucide-react"
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select"
import { InfoTooltip } from "@/components/ui/info-tooltip"
import { InlineCreateClient } from "@/components/inline-create-client"

interface Client {
  id: number
  name: string
}

interface ClientSelectFieldProps {
  field: { value: string | undefined; onChange: (value: string) => void }
  clients: Client[] | undefined
  isLoading: boolean
  label: string
  tooltip: string
  excludeClientId?: string
}

export function ClientSelectField({ field, clients, isLoading, label, tooltip, excludeClientId }: ClientSelectFieldProps) {
  const [isCreating, setIsCreating] = useState(false)

  const filteredClients = excludeClientId
    ? clients?.filter(c => c.id.toString() !== excludeClientId)
    : clients

  return (
    <FormItem>
      <div className="flex items-center gap-2">
        <FormLabel>{label}</FormLabel>
        <InfoTooltip content={tooltip} />
      </div>
      {isCreating ? (
        <InlineCreateClient
          onCreated={(clientId) => { field.onChange(clientId.toString()); setIsCreating(false) }}
          onCancel={() => setIsCreating(false)}
        />
      ) : (
        <Select
          onValueChange={(val) => { if (val === "_new") { setIsCreating(true) } else { field.onChange(val) } }}
          value={field.value}
        >
          <FormControl>
            <SelectTrigger><SelectValue placeholder="Select a client" /></SelectTrigger>
          </FormControl>
          <SelectContent>
            {isLoading ? (
              <div className="flex items-center justify-center p-2"><Loader2 className="h-4 w-4 animate-spin" /></div>
            ) : (
              <>
                {filteredClients?.map((client) => (
                  <SelectItem key={client.id} value={client.id.toString()}>{client.name}</SelectItem>
                ))}
                <SelectSeparator />
                <SelectItem value="_new" className="text-primary font-medium">
                  <div className="flex items-center gap-2"><Plus className="h-4 w-4" />Create New Client...</div>
                </SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
      )}
      <FormMessage />
    </FormItem>
  )
}
