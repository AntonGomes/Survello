"use client"

import { useState } from "react"
import { Settings2, Check, X, Pencil } from "lucide-react"
import { InstructionStatus, type InstructionReadWithInstructionType } from "@/client/types.gen"

import { CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EditInstructionDialog } from "@/components/edit-instruction-dialog"
import { cn } from "@/lib/utils"

const statusStyles: Record<string, string> = {
  planned: "bg-slate-100 text-slate-700",
  active: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  archived: "bg-gray-100 text-gray-700",
}

export { statusStyles }

interface CardHeaderContentProps {
  instruction: InstructionReadWithInstructionType
  jobId: number
  displayName: string
  currentStatus: string
  onStatusChange: (status: InstructionStatus) => void
  onSaveDescription: (desc: string) => void
}

export function CardHeaderContent({ instruction, jobId, displayName, currentStatus, onStatusChange, onSaveDescription }: CardHeaderContentProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedDesc, setEditedDesc] = useState(instruction.description || "")

  const handleSave = () => { onSaveDescription(editedDesc); setIsEditing(false) }
  const handleCancel = () => { setIsEditing(false); setEditedDesc(instruction.description || "") }

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          {instruction.instruction_number && <Badge variant="outline" className="text-xs font-mono shrink-0">{instruction.instruction_number}</Badge>}
          <CardTitle className="text-lg font-medium truncate">{displayName}</CardTitle>
        </div>
        {isEditing ? (
          <DescriptionEditor value={editedDesc} onChange={setEditedDesc} onSave={handleSave} onCancel={handleCancel} />
        ) : (
          <DescriptionDisplay description={instruction.description} onEdit={() => { setEditedDesc(instruction.description || ""); setIsEditing(true) }} />
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <StatusDropdown currentStatus={currentStatus} onStatusChange={onStatusChange} />
        <EditInstructionDialog instruction={instruction} jobId={jobId} trigger={<Button variant="ghost" size="icon" className="h-7 w-7"><Settings2 className="h-4 w-4" /></Button>} />
      </div>
    </div>
  )
}

function DescriptionEditor({ value, onChange, onSave, onCancel }: { value: string; onChange: (v: string) => void; onSave: () => void; onCancel: () => void }) {
  return (
    <div className="flex gap-2 items-start mt-2">
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} className="min-h-[60px] text-sm" placeholder="Add a description..." autoFocus />
      <div className="flex flex-col gap-1">
        <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" onClick={onSave}><Check className="h-4 w-4" /></Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onClick={onCancel}><X className="h-4 w-4" /></Button>
      </div>
    </div>
  )
}

function DescriptionDisplay({ description, onEdit }: { description?: string | null; onEdit: () => void }) {
  return (
    <div className="group flex items-start gap-2 cursor-pointer" onClick={onEdit}>
      <CardDescription className="line-clamp-2 flex-1">{description || "Click to add description..."}</CardDescription>
      <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
    </div>
  )
}

function StatusDropdown({ currentStatus, onStatusChange }: { currentStatus: string; onStatusChange: (s: InstructionStatus) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={cn("gap-1 h-7 px-2 capitalize", statusStyles[currentStatus])}>{currentStatus}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.values(InstructionStatus).map((s) => <DropdownMenuItem key={s} onClick={() => onStatusChange(s)} className="capitalize">{s}</DropdownMenuItem>)}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
