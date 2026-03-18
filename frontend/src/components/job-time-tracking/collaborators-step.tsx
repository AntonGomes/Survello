"use client"

import { Users, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface OrgUser {
  id: number
  name?: string | null
  email: string
}

interface CollaboratorsStepProps {
  stoppedDuration: number
  stoppedDescription: string
  orgUsers: OrgUser[]
  selectedCollaborators: number[]
  onToggleCollaborator: (id: number) => void
  onFinish: () => void
  onSkip: () => void
  isLogging: boolean
}

export function CollaboratorsStep(props: CollaboratorsStepProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Add Collaborators</DialogTitle>
        <DialogDescription>Did anyone else work on this with you?</DialogDescription>
      </DialogHeader>
      <div className="py-4 space-y-4">
        <DurationSummary duration={props.stoppedDuration} description={props.stoppedDescription} />
        <div className="space-y-2">
          <Label>Select team members who also worked on this:</Label>
          <ScrollArea className="h-[200px] rounded-md border p-2">
            <div className="space-y-2">
              {props.orgUsers.map((orgUser) => (
                <CollaboratorRow key={orgUser.id} user={orgUser} selected={props.selectedCollaborators.includes(orgUser.id)} onToggle={() => props.onToggleCollaborator(orgUser.id)} />
              ))}
            </div>
          </ScrollArea>
        </div>
        <CollaboratorsFooter count={props.selectedCollaborators.length} isLogging={props.isLogging} onFinish={props.onFinish} onSkip={props.onSkip} />
      </div>
    </>
  )
}

function DurationSummary({ duration, description }: { duration: number; description: string }) {
  return (
    <div className="text-center text-sm text-muted-foreground mb-4">
      <span className="font-medium text-foreground">{duration}</span> minutes logged
      {description && <p className="mt-1 italic">&quot;{description}&quot;</p>}
    </div>
  )
}

function CollaboratorRow({ user, selected, onToggle }: { user: OrgUser; selected: boolean; onToggle: () => void }) {
  return (
    <div className={cn("flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors", selected ? "bg-primary/10" : "hover:bg-muted")} onClick={onToggle}>
      <Checkbox checked={selected} onCheckedChange={onToggle} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{user.name || user.email}</p>
        {user.name && <p className="text-xs text-muted-foreground truncate">{user.email}</p>}
      </div>
      {selected && <Check className="h-4 w-4 text-primary shrink-0" />}
    </div>
  )
}

function CollaboratorsFooter({ count, isLogging, onFinish, onSkip }: {
  count: number; isLogging: boolean; onFinish: () => void; onSkip: () => void
}) {
  return (
    <DialogFooter className="flex gap-2 sm:gap-0">
      <Button variant="ghost" onClick={onSkip} className="flex-1">Skip</Button>
      <Button onClick={onFinish} disabled={isLogging} className="flex-1">
        {count > 0 ? `Add ${count} collaborator${count > 1 ? "s" : ""}` : "Done"}
      </Button>
    </DialogFooter>
  )
}
