"use client"

import { useState } from "react"
import { FileText, FolderOpen, Files, Plus, ChevronRight } from "lucide-react"
import { Image as ImageIcon } from "lucide-react"
import { format } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

const BYTES_PER_KB = 1024

interface FileItem {
  id: number
  file_name: string
  role?: string
  size_bytes?: number
}

interface InstructionItem {
  id: number
  instruction_type?: { name?: string }
}

interface SurveyItem {
  id: number
  conducted_date: string
  photo_count?: number
}

function JobFilesList({ files }: { files: FileItem[] }) {
  if (!files.length) return null

  return (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground mb-2">Job Files</h3>
      <div className="rounded-md border">
        <div className="divide-y">
          {files.map((file) => (
            <div key={file.id} className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors">
              <FileText className="h-4 w-4 text-primary shrink-0" />
              <span className="flex-1 truncate text-sm font-medium">{file.file_name}</span>
              <Badge variant="outline" className="font-mono text-[10px] uppercase">{file.role}</Badge>
              <span className="text-xs text-muted-foreground tabular-nums">
                {file.size_bytes ? `${(file.size_bytes / BYTES_PER_KB).toFixed(1)} KB` : "—"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function InstructionFilesList({ instructions }: { instructions: InstructionItem[] }) {
  if (!instructions.some(p => p.id)) return null

  return (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground mb-2">Instruction Files</h3>
      <div className="rounded-md border divide-y">
        {instructions.map((instruction) => (
          <div key={instruction.id} className="p-3">
            <div className="flex items-center gap-2 text-sm">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{instruction.instruction_type?.name || "Instruction"}</span>
              <span className="text-muted-foreground text-xs">(View in instruction)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SurveyPhotosList({ surveys }: { surveys: SurveyItem[] }) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set())
  const withPhotos = surveys.filter(s => (s.photo_count || 0) > 0)

  if (!withPhotos.length) return null

  const toggle = (id: number) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  return (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground mb-2">Survey Photos</h3>
      <div className="rounded-md border divide-y">
        {withPhotos.map((survey) => (
          <Collapsible key={survey.id} open={expanded.has(survey.id)} onOpenChange={() => toggle(survey.id)}>
            <CollapsibleTrigger className="flex items-center gap-3 p-3 w-full hover:bg-muted/50 transition-colors">
              <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform", expanded.has(survey.id) && "rotate-90")} />
              <ImageIcon className="h-4 w-4 text-amber-500" />
              <span className="flex-1 text-left text-sm font-medium">
                Survey - {format(new Date(survey.conducted_date), "d MMM yyyy")}
              </span>
              <Badge variant="secondary" className="text-xs">{survey.photo_count} photos</Badge>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-10 pb-3 text-sm text-muted-foreground">
                <p>Photos will be displayed here once loaded.</p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  )
}

interface FilesTabProps {
  files: FileItem[]
  instructions: InstructionItem[]
  surveys: SurveyItem[]
}

export function FilesTab({ files, instructions, surveys }: FilesTabProps) {
  const hasNoFiles = !files.length && surveys.every(s => (s.photo_count || 0) === 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Files</h2>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add File
        </Button>
      </div>

      <div className="space-y-4">
        <JobFilesList files={files} />
        <InstructionFilesList instructions={instructions} />
        <SurveyPhotosList surveys={surveys} />

        {hasNoFiles && (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <Files className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-medium mb-1">No files yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Upload files to this job.</p>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add File
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
