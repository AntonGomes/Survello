"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery } from "@tanstack/react-query"
import { Loader2, Camera } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form } from "@/components/ui/form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { readOrgOptions } from "@/client/@tanstack/react-query.gen"

import { formSchema, type SurveyFormValues } from "./types"
import { useSurveyFiles } from "./use-survey-files"
import { useSurveySubmit } from "./use-survey-submit"
import { DateWeatherFields, SurveyorPicker, SiteNotesField, ImageUploadSection, OtherFilesUpload, UploadProgressBar } from "./survey-form-fields"

interface CreateSurveyDialogProps {
  jobId: number
  instructionId?: number
  trigger?: React.ReactNode
}

function useSurveyDialogState({ jobId, instructionId }: { jobId: number; instructionId?: number }) {
  const [open, setOpen] = useState(false)
  const [surveyorOpen, setSurveyorOpen] = useState(false)
  const [selectedSurveyorIds, setSelectedSurveyorIds] = useState<number[]>([])
  const { data: orgData } = useQuery({ ...readOrgOptions() })
  const form = useForm<SurveyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { conducted_date: new Date().toISOString().split("T")[0], description: "", site_notes: "", weather: null, surveyor_ids: [] },
  })
  const files = useSurveyFiles(form)
  const handleReset = () => { setOpen(false); form.reset(); setSelectedSurveyorIds([]); files.resetFiles() }
  const submit = useSurveySubmit({ jobId, instructionId, imageFiles: files.imageFiles, otherFiles: files.otherFiles, selectedSurveyorIds, onSuccess: handleReset })
  const toggleSurveyor = (userId: number) => { setSelectedSurveyorIds((prev) => prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]) }

  return { open, setOpen, surveyorOpen, setSurveyorOpen, selectedSurveyorIds, orgUsers: orgData?.users || [], form, files, submit, toggleSurveyor }
}

export function CreateSurveyDialog({ jobId, instructionId, trigger }: CreateSurveyDialogProps) {
  const s = useSurveyDialogState({ jobId, instructionId })
  const fileCount = s.files.imageFiles.length + s.files.otherFiles.length

  return (
    <Dialog open={s.open} onOpenChange={s.setOpen}>
      <DialogTrigger asChild>{trigger || (<Button variant="outline" size="sm"><Camera className="mr-2 h-4 w-4" />Add Survey</Button>)}</DialogTrigger>
      <DialogContent className="w-[95vw] max-w-4xl h-[90vh] max-h-[800px] overflow-y-auto">
        <DialogHeader><DialogTitle>Record Survey</DialogTitle><DialogDescription>Record a site survey visit with photos, notes, and observations.</DialogDescription></DialogHeader>
        <div className="pr-2">
          <Form {...s.form}>
            <form onSubmit={s.form.handleSubmit(s.submit.onSubmit)} className="space-y-4 pb-4">
              <DateWeatherFields form={s.form} />
              <SurveyorPicker orgUsers={s.orgUsers} selectedIds={s.selectedSurveyorIds} onToggle={s.toggleSurveyor} open={s.surveyorOpen} onOpenChange={s.setSurveyorOpen} />
              <DescriptionField form={s.form} />
              <SiteNotesField form={s.form} siteNotesFile={s.files.siteNotesFile} siteNotesInputRef={s.files.siteNotesInputRef} onFileSelect={s.files.handleSiteNotesFileSelect} onRemove={s.files.removeSiteNotesFile} />
              <ImageUploadSection imageFiles={s.files.imageFiles} imageInputRef={s.files.imageInputRef} onDrop={s.files.handleImageDrop} onFileSelect={s.files.handleImageFileSelect} onRemove={s.files.removeImage} />
              <OtherFilesUpload otherFiles={s.files.otherFiles} fileInputRef={s.files.fileInputRef} onFileSelect={s.files.handleOtherFilesSelect} onRemove={s.files.removeFile} />
              {s.submit.isUploading && <UploadProgressBar progress={s.submit.uploadProgress} />}
            </form>
          </Form>
        </div>
        <SurveyDialogFooter isPending={s.submit.isPending} isUploading={s.submit.isUploading} fileCount={fileCount} onCancel={() => s.setOpen(false)} onSubmit={s.form.handleSubmit(s.submit.onSubmit)} />
      </DialogContent>
    </Dialog>
  )
}

function DescriptionField({ form }: { form: UseFormReturn<SurveyFormValues> }) {
  return (
    <FormField control={form.control} name="description" render={({ field }) => (
      <FormItem>
        <FormLabel>Description (Optional)</FormLabel>
        <FormControl><Textarea placeholder="Brief description of the survey purpose..." className="resize-none" rows={2} {...field} value={field.value ?? ""} /></FormControl>
        <FormMessage />
      </FormItem>
    )} />
  )
}

function SurveyDialogFooter({ isPending, isUploading, fileCount, onCancel, onSubmit }: {
  isPending: boolean; isUploading: boolean; fileCount: number; onCancel: () => void; onSubmit: () => void
}) {
  const buttonLabel = isUploading ? "Uploading..." : fileCount > 0 ? `Create Survey (${fileCount} files)` : "Create Survey"

  return (
    <DialogFooter className="pt-4 border-t sticky bottom-0 bg-background">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>Cancel</Button>
      <Button onClick={onSubmit} disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {buttonLabel}
      </Button>
    </DialogFooter>
  )
}

import type { UseFormReturn } from "react-hook-form"
