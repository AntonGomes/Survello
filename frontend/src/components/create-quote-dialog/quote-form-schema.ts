import * as z from "zod"
import { QuoteStatus } from "@/client/types.gen"

export const quoteLineSchema = z.object({
  instruction_type_id: z.string().min(1, "Please select an instruction type"),
  estimated_fee: z.string().optional(),
  notes: z.string().optional(),
})

export const formSchema = z.object({
  name: z.string().min(2, "Quote name must be at least 2 characters"),
  client_or_lead: z.string().optional(),
  estimated_fee: z.string().optional(),
  expected_start_date: z.string().optional(),
  status: z.nativeEnum(QuoteStatus),
  notes: z.string().optional(),
  lines: z.array(quoteLineSchema).optional(),
})

export type QuoteFormValues = z.infer<typeof formSchema>
