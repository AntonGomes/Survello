"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import {
  createSurveyMutation,
  readSurveysOptions,
  generateFileUploadUrlsMutation,
  createFilesMutation,
  readJobOptions,
} from "@/client/@tanstack/react-query.gen"
import { type SurveyCreate, type FilePresignRequest, type FileCreate } from "@/client/types.gen"
import { uploadFilesToS3 } from "@/lib/upload"
import { useAuth } from "@/context/auth-context"
import type { FileWithPreview, SurveyFormValues } from "./types"

const PROGRESS_AFTER_CREATE = 10
const PROGRESS_AFTER_PRESIGN = 30
const UPLOAD_PROGRESS_WEIGHT = 0.5
const PROGRESS_AFTER_UPLOAD = 80
const PROGRESS_COMPLETE = 100

interface SubmitDeps {
  jobId: number
  instructionId?: number
  imageFiles: FileWithPreview[]
  otherFiles: FileWithPreview[]
  selectedSurveyorIds: number[]
  onSuccess: () => void
}

export function useSurveySubmit(deps: SubmitDeps) {
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const router = useRouter()

  const { mutateAsync: createSurveyAsync, isPending: isSurveyPending } = useMutation(createSurveyMutation())
  const { mutateAsync: generateUploadUrls } = useMutation(generateFileUploadUrlsMutation())
  const { mutateAsync: createFiles } = useMutation(createFilesMutation())

  const onSubmit = async (values: SurveyFormValues) => {
    if (!user) return
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const survey = await createSurveyAsync({ body: buildSurveyData({ values, deps, userId: user.id }) })
      setUploadProgress(PROGRESS_AFTER_CREATE)

      await uploadAllFiles({
        deps, user, surveyId: survey.id, generateUploadUrls, createFiles, setUploadProgress,
      })

      setUploadProgress(PROGRESS_COMPLETE)
      invalidateQueries({ queryClient, jobId: deps.jobId })
      deps.onSuccess()
      router.push(`/app/surveys/${survey.id}`)
    } catch (error) {
      console.error("Failed to create survey:", error)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return { onSubmit, uploadProgress, isUploading, isPending: isSurveyPending || isUploading }
}

function buildSurveyData({ values, deps, userId }: {
  values: SurveyFormValues; deps: SubmitDeps; userId: number
}): SurveyCreate {
  return {
    job_id: deps.jobId,
    instruction_id: deps.instructionId || null,
    conducted_date: values.conducted_date,
    description: values.description || null,
    site_notes: values.site_notes || null,
    weather: values.weather || null,
    surveyor_ids: deps.selectedSurveyorIds.length > 0 ? deps.selectedSurveyorIds : null,
    conducted_by_user_id: deps.selectedSurveyorIds.length > 0 ? deps.selectedSurveyorIds[0] : userId,
  }
}

async function uploadAllFiles({ deps, user, surveyId, generateUploadUrls, createFiles, setUploadProgress }: {
  deps: SubmitDeps
  user: { id: number; org_id?: number | null }
  surveyId: number
  generateUploadUrls: (args: { body: FilePresignRequest[] }) => ReturnType<ReturnType<typeof useMutation>["mutateAsync"]>
  createFiles: (args: { body: FileCreate[] }) => ReturnType<ReturnType<typeof useMutation>["mutateAsync"]>
  setUploadProgress: (p: number) => void
}) {
  const allFiles = [...deps.imageFiles, ...deps.otherFiles]
  if (allFiles.length === 0) return

  const presignRequests: FilePresignRequest[] = allFiles.map((fw, index) => ({
    file_name: fw.file.name,
    mime_type: fw.file.type || "application/octet-stream",
    size_bytes: fw.file.size,
    client_id: `${index}`,
  }))

  const presignedUrls = await generateUploadUrls({ body: presignRequests }) as Array<Record<string, unknown>>
  setUploadProgress(PROGRESS_AFTER_PRESIGN)

  const rawFiles = allFiles.map((fw) => fw.file)
  await uploadFilesToS3({
    files: rawFiles,
    presignedPuts: presignedUrls as never,
    onProgress: (progress) => { setUploadProgress(PROGRESS_AFTER_PRESIGN + progress * UPLOAD_PROGRESS_WEIGHT) },
  })
  setUploadProgress(PROGRESS_AFTER_UPLOAD)

  const fileCreates: FileCreate[] = presignedUrls.map((presigned) => ({
    file_name: presigned.file_name as string,
    mime_type: presigned.mime_type as string,
    size_bytes: (presigned.size_bytes as number) || 0,
    storage_key: presigned.storage_key as string,
    org_id: user.org_id!,
    uploaded_by_user_id: user.id,
    job_id: deps.jobId,
    survey_id: surveyId,
  }))

  await createFiles({ body: fileCreates })
}

function invalidateQueries({ queryClient, jobId }: {
  queryClient: ReturnType<typeof useQueryClient>
  jobId: number
}) {
  queryClient.invalidateQueries({ queryKey: readSurveysOptions({ query: { job_id: jobId } }).queryKey })
  queryClient.invalidateQueries({ queryKey: readJobOptions({ path: { job_id: jobId } }).queryKey })
}
