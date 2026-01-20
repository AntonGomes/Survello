"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { 
  File as FileIcon, 
  Download, 
  Eye,
  X,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  Upload,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { PdfViewer } from "@/components/pdf-viewer"
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "@/components/ui/shadcn-io/dropzone"
import {
  readProjectFilesOptions,
  generateFileDownloadUrlOptions,
  createFileMutation,
  generateFileUploadUrlsMutation,
} from "@/client/@tanstack/react-query.gen"
import type { FileRead } from "@/client/types.gen"
import { toast } from "sonner"

interface ProjectFilesProps {
  projectId: number
  orgId: number
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.includes("pdf")) return FileText
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return FileSpreadsheet
  if (mimeType.startsWith("image/")) return ImageIcon
  return FileIcon
}

const formatFileSize = (bytes: number | null | undefined) => {
  if (!bytes) return "—"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function ProjectFiles({ projectId, orgId }: ProjectFilesProps) {
  const queryClient = useQueryClient()
  const [selectedFile, setSelectedFile] = useState<FileRead | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)

  // Fetch project files
  const { data: files, isLoading } = useQuery({
    ...readProjectFilesOptions({ path: { project_id: projectId } }),
  })

  // File upload mutations
  const { mutateAsync: generateUploadUrls } = useMutation({
    ...generateFileUploadUrlsMutation(),
  })

  const { mutateAsync: createFile } = useMutation({
    ...createFileMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: readProjectFilesOptions({ path: { project_id: projectId } }).queryKey,
      })
    },
  })

  const handleDrop = async (droppedFiles: File[]) => {
    setPendingFiles(droppedFiles)
    setIsUploading(true)

    try {
      // Generate presigned URLs
      const presignRequests = droppedFiles.map((file, index) => ({
        file_name: file.name,
        mime_type: file.type || "application/octet-stream",
        size_bytes: file.size,
        client_id: `upload-${index}-${Date.now()}`,
      }))

      const presignResponses = await generateUploadUrls({
        body: presignRequests,
      })

      // Upload files to S3
      for (let i = 0; i < droppedFiles.length; i++) {
        const file = droppedFiles[i]
        const presign = presignResponses[i]

        if (!file || !presign) continue

        // Upload to S3
        await fetch(presign.put_url, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type || "application/octet-stream",
          },
        })

        // Create file record
        await createFile({
          body: {
            file_name: file.name,
            mime_type: file.type || "application/octet-stream",
            size_bytes: file.size,
            storage_key: presign.storage_key,
            org_id: orgId,
            project_id: projectId,
          },
        })
      }

      toast.success(`Uploaded ${droppedFiles.length} file(s)`)
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload files")
    } finally {
      setIsUploading(false)
      setPendingFiles([])
    }
  }

  const handleViewFile = async (file: FileRead) => {
    setSelectedFile(file)
    setIsLoadingPreview(true)

    try {
      // Check if file has a PDF preview or is already a PDF
      const previewFileId = file.preview_file_id ?? (file.mime_type === "application/pdf" ? file.id : null)

      if (previewFileId) {
        // Fetch the download URL for preview
        const response = await queryClient.fetchQuery({
          ...generateFileDownloadUrlOptions({
            path: { file_id: previewFileId },
            query: { inline: true },
          }),
        })
        setPreviewUrl(response as unknown as string)
      } else {
        // No preview available, just show file info
        setPreviewUrl(null)
      }
    } catch (error) {
      console.error("Failed to load preview:", error)
      toast.error("Failed to load file preview")
    } finally {
      setIsLoadingPreview(false)
    }
  }

  const handleDownloadFile = async (file: FileRead) => {
    try {
      const response = await queryClient.fetchQuery({
        ...generateFileDownloadUrlOptions({
          path: { file_id: file.id },
          query: { inline: false },
        }),
      })
      // Open download URL in new tab
      window.open(response as unknown as string, "_blank")
    } catch (error) {
      console.error("Failed to get download URL:", error)
      toast.error("Failed to download file")
    }
  }

  const closePreview = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
  }

  // Filter out preview files from the display
  const displayFiles = files?.filter((f) => f.role !== "preview_pdf") || []

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Dropzone
        maxFiles={10}
        onDrop={handleDrop}
        src={pendingFiles}
        className="border-2 border-dashed border-muted-foreground/25 bg-muted/20 hover:border-primary/50 hover:bg-muted/40 transition-all rounded-lg p-4"
      >
        {isUploading ? (
          <div className="flex items-center justify-center gap-2 py-4">
            <Spinner className="h-5 w-5" />
            <span className="text-sm text-muted-foreground">Uploading...</span>
          </div>
        ) : (
          <>
            <DropzoneEmptyState />
            <DropzoneContent />
          </>
        )}
      </Dropzone>

      {/* Files List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner className="h-6 w-6" />
        </div>
      ) : displayFiles.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground">
          <FileIcon className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No files yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayFiles.map((file) => {
            const IconComponent = getFileIcon(file.mime_type)
            const hasPreview = file.preview_file_id !== null || file.mime_type === "application/pdf"

            return (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <IconComponent className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.file_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size_bytes)} • {file.created_at && formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {hasPreview && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleViewFile(file)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDownloadFile(file)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!selectedFile} onOpenChange={(open) => !open && closePreview()}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between pr-8">
              <span className="truncate">{selectedFile?.file_name}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => selectedFile && handleDownloadFile(selectedFile)}
              >
                <Download className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            {isLoadingPreview ? (
              <div className="flex items-center justify-center h-full">
                <Spinner className="h-8 w-8" />
              </div>
            ) : previewUrl ? (
              <PdfViewer url={previewUrl} className="h-full w-full" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <FileIcon className="h-16 w-16 mb-4 opacity-50" />
                <p>Preview not available for this file type</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => selectedFile && handleDownloadFile(selectedFile)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download File
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
