"use client"

import { File as FileIcon, Download, Eye, FileText, FileSpreadsheet, Image as ImageIcon } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { PdfViewer } from "@/components/pdf-viewer"
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "@/components/ui/shadcn-io/dropzone"
import type { FileRead } from "@/client/types.gen"

import { useInstructionFiles } from "./use-instruction-files"

const KB = 1024
const MB = KB * KB

function getFileIcon(mimeType: string) {
  if (mimeType.includes("pdf")) return FileText
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return FileSpreadsheet
  if (mimeType.startsWith("image/")) return ImageIcon
  return FileIcon
}

function formatFileSize(bytes: number | null | undefined) {
  if (!bytes) return "\u2014"
  if (bytes < KB) return `${bytes} B`
  if (bytes < MB) return `${(bytes / KB).toFixed(1)} KB`
  return `${(bytes / MB).toFixed(1)} MB`
}

interface InstructionFilesProps {
  instructionId: number
  orgId: number
}

export function InstructionFiles({ instructionId, orgId }: InstructionFilesProps) {
  const state = useInstructionFiles({ instructionId, orgId })

  return (
    <div className="space-y-4">
      <UploadDropzone pendingFiles={state.pendingFiles} isUploading={state.isUploading} onDrop={state.handleDrop} />
      <FilesList files={state.displayFiles} isLoading={state.isLoading} onView={state.handleViewFile} onDownload={state.handleDownloadFile} />
      <PreviewDialog selectedFile={state.selectedFile} previewUrl={state.previewUrl} isLoading={state.isLoadingPreview} onClose={state.closePreview} onDownload={state.handleDownloadFile} />
    </div>
  )
}

function UploadDropzone({ pendingFiles, isUploading, onDrop }: { pendingFiles: File[]; isUploading: boolean; onDrop: (files: File[]) => void }) {
  return (
    <Dropzone maxFiles={10} onDrop={onDrop} src={pendingFiles} className="border-2 border-dashed border-muted-foreground/25 bg-muted/20 hover:border-primary/50 hover:bg-muted/40 transition-all rounded-lg p-4">
      {isUploading ? (
        <div className="flex items-center justify-center gap-2 py-4"><Spinner className="h-5 w-5" /><span className="text-sm text-muted-foreground">Uploading...</span></div>
      ) : (
        <><DropzoneEmptyState /><DropzoneContent /></>
      )}
    </Dropzone>
  )
}

function FilesList({ files, isLoading, onView, onDownload }: { files: FileRead[]; isLoading: boolean; onView: (f: FileRead) => void; onDownload: (f: FileRead) => void }) {
  if (isLoading) return <div className="flex justify-center py-8"><Spinner className="h-6 w-6" /></div>
  if (files.length === 0) return <div className="text-center py-6 text-muted-foreground"><FileIcon className="h-10 w-10 mx-auto mb-2 opacity-50" /><p className="text-sm">No files yet</p></div>

  return (
    <div className="space-y-2">
      {files.map((file) => {
        const IconComponent = getFileIcon(file.mime_type)
        const hasPreview = file.preview_file_id !== null || file.mime_type === "application/pdf"
        return (
          <div key={file.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
            <IconComponent className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.file_name}</p>
              <p className="text-xs text-muted-foreground">{formatFileSize(file.size_bytes)} {"\u2022"} {file.created_at && formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}</p>
            </div>
            <div className="flex items-center gap-1">
              {hasPreview && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onView(file)}><Eye className="h-4 w-4" /></Button>}
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDownload(file)}><Download className="h-4 w-4" /></Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PreviewDialog({ selectedFile, previewUrl, isLoading, onClose, onDownload }: {
  selectedFile: FileRead | null; previewUrl: string | null; isLoading: boolean; onClose: () => void; onDownload: (f: FileRead) => void
}) {
  return (
    <Dialog open={!!selectedFile} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-8">
            <span className="truncate">{selectedFile?.file_name}</span>
            <Button variant="ghost" size="icon" onClick={() => selectedFile && onDownload(selectedFile)}><Download className="h-4 w-4" /></Button>
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full"><Spinner className="h-8 w-8" /></div>
          ) : previewUrl ? (
            <PdfViewer url={previewUrl} className="h-full w-full" />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <FileIcon className="h-16 w-16 mb-4 opacity-50" /><p>Preview not available for this file type</p>
              <Button variant="outline" className="mt-4" onClick={() => selectedFile && onDownload(selectedFile)}><Download className="h-4 w-4 mr-2" />Download File</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
