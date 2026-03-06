"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { readInstructionFilesOptions, generateFileDownloadUrlOptions, createFileMutation, generateFileUploadUrlsMutation } from "@/client/@tanstack/react-query.gen"
import type { FileRead } from "@/client/types.gen"
import { toast } from "sonner"

interface UseInstructionFilesOptions {
  instructionId: number
  orgId: number
}

async function uploadFiles({ droppedFiles, generateUploadUrls, createFile, instructionId, orgId }: {
  droppedFiles: File[]
  generateUploadUrls: (args: { body: unknown[] }) => Promise<Array<{ put_url: string; storage_key: string }>>
  createFile: (args: { body: unknown }) => Promise<unknown>
  instructionId: number; orgId: number
}) {
  const presignRequests = droppedFiles.map((file, index) => ({
    file_name: file.name, mime_type: file.type || "application/octet-stream", size_bytes: file.size, client_id: `upload-${index}-${Date.now()}`,
  }))
  const presignResponses = await generateUploadUrls({ body: presignRequests })
  for (let i = 0; i < droppedFiles.length; i++) {
    const file = droppedFiles[i]
    const presign = presignResponses[i]
    if (!file || !presign) continue
    await fetch(presign.put_url, { method: "PUT", body: file, headers: { "Content-Type": file.type || "application/octet-stream" } })
    await createFile({ body: { file_name: file.name, mime_type: file.type || "application/octet-stream", size_bytes: file.size, storage_key: presign.storage_key, org_id: orgId, instruction_id: instructionId } })
  }
}

function useFilePreview(queryClient: ReturnType<typeof useQueryClient>) {
  const [selectedFile, setSelectedFile] = useState<FileRead | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)

  const handleViewFile = async (file: FileRead) => {
    setSelectedFile(file); setIsLoadingPreview(true)
    try {
      const previewFileId = file.preview_file_id ?? (file.mime_type === "application/pdf" ? file.id : null)
      if (previewFileId) {
        const response = await queryClient.fetchQuery({ ...generateFileDownloadUrlOptions({ path: { file_id: previewFileId }, query: { inline: true } }) })
        setPreviewUrl(response as unknown as string)
      } else { setPreviewUrl(null) }
    } catch { toast.error("Failed to load file preview") }
    finally { setIsLoadingPreview(false) }
  }

  const handleDownloadFile = async (file: FileRead) => {
    try { const response = await queryClient.fetchQuery({ ...generateFileDownloadUrlOptions({ path: { file_id: file.id }, query: { inline: false } }) }); window.open(response as unknown as string, "_blank") }
    catch { toast.error("Failed to download file") }
  }

  const closePreview = () => { setSelectedFile(null); setPreviewUrl(null) }
  return { selectedFile, previewUrl, isLoadingPreview, handleViewFile, handleDownloadFile, closePreview }
}

export function useInstructionFiles({ instructionId, orgId }: UseInstructionFilesOptions) {
  const queryClient = useQueryClient()
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const { data: files, isLoading } = useQuery({ ...readInstructionFilesOptions({ path: { instruction_id: instructionId } }) })
  const { mutateAsync: generateUploadUrls } = useMutation({ ...generateFileUploadUrlsMutation() })
  const { mutateAsync: createFile } = useMutation({
    ...createFileMutation(),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: readInstructionFilesOptions({ path: { instruction_id: instructionId } }).queryKey }) },
  })
  const preview = useFilePreview(queryClient)

  const handleDrop = async (droppedFiles: File[]) => {
    setPendingFiles(droppedFiles); setIsUploading(true)
    try { await uploadFiles({ droppedFiles, generateUploadUrls: generateUploadUrls as never, createFile: createFile as never, instructionId, orgId }); toast.success(`Uploaded ${droppedFiles.length} file(s)`) }
    catch (error) { console.error("Upload error:", error); toast.error("Failed to upload files") }
    finally { setIsUploading(false); setPendingFiles([]) }
  }

  const displayFiles = files?.filter((f) => f.role !== "preview_pdf") || []
  return { displayFiles, isLoading, pendingFiles, isUploading, handleDrop, ...preview }
}
