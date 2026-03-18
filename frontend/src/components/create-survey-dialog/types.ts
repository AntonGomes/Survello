import * as z from "zod"

export interface FileWithPreview {
  file: File
  preview?: string
  id: string
}

export const formSchema = z.object({
  conducted_date: z.string().min(1, "Please select a date"),
  description: z.string().optional(),
  site_notes: z.string().optional(),
  weather: z.string().optional().nullable(),
  surveyor_ids: z.array(z.number()).optional(),
})

export type SurveyFormValues = z.infer<typeof formSchema>
