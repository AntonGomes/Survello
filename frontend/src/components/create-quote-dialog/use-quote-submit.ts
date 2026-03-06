"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createQuoteMutation, readQuotesOptions } from "@/client/@tanstack/react-query.gen"
import { type QuoteCreate, type QuoteLineCreate } from "@/client/types.gen"
import type { QuoteFormValues } from "./quote-form-schema"

interface UseQuoteSubmitOptions {
  form: { reset: () => void }
  setOpen: (open: boolean) => void
}

function parseClientOrLead(value?: string) {
  let clientId: number | null = null
  let leadId: number | null = null
  if (!value) return { clientId, leadId }

  const parts = value.split(":")
  const type = parts[0]
  const id = parts[1]
  if (type === "client" && id) clientId = parseInt(id)
  else if (type === "lead" && id) leadId = parseInt(id)
  return { clientId, leadId }
}

function computeTotalFee(values: QuoteFormValues): number | null {
  if (values.estimated_fee) return parseFloat(values.estimated_fee)
  if (values.lines && values.lines.length > 0) {
    const total = values.lines.reduce((sum, line) => {
      return sum + (line.estimated_fee ? parseFloat(line.estimated_fee) : 0)
    }, 0)
    return total === 0 ? null : total
  }
  return null
}

export function useQuoteSubmit({ form, setOpen }: UseQuoteSubmitOptions) {
  const queryClient = useQueryClient()

  const { mutate: createQuote, isPending } = useMutation({
    ...createQuoteMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: readQuotesOptions().queryKey })
      setOpen(false)
      form.reset()
    },
  })

  const onSubmit = (values: QuoteFormValues) => {
    const { clientId, leadId } = parseClientOrLead(values.client_or_lead)
    const totalFee = computeTotalFee(values)

    const quoteLines: QuoteLineCreate[] = (values.lines || []).map(line => ({
      instruction_type_id: parseInt(line.instruction_type_id),
      estimated_fee: line.estimated_fee ? parseFloat(line.estimated_fee) : null,
      notes: line.notes || null,
    }))

    const quoteData: QuoteCreate = {
      name: values.name,
      client_id: clientId,
      lead_id: leadId,
      estimated_fee: totalFee,
      expected_start_date: values.expected_start_date || null,
      status: values.status,
      notes: values.notes || null,
      lines: quoteLines.length > 0 ? quoteLines : undefined,
    }

    createQuote({ body: quoteData })
  }

  return { onSubmit, isPending }
}
