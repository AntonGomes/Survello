"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { DndContext, closestCenter, type DragEndEvent, type DraggableAttributes } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { GripVertical, MoreHorizontal, Scissors, Trash2, Merge, ImageIcon, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { DilapsSection, ReviewAction } from "@/hooks/use-dilaps-review"

const SIDEBAR_WIDTH = 280

type SectionNavProps = {
  sections: DilapsSection[]
  activeSectionId: number | null
  mergeSelection: number[]
  canMerge: boolean
  dispatch: React.Dispatch<ReviewAction>
  onSelect: (sectionId: number) => void
}

type SectionCardProps = {
  section: DilapsSection
  isActive: boolean
  isMergeSelected: boolean
  showMergeCheckbox: boolean
  dispatch: React.Dispatch<ReviewAction>
  onSelect: (sectionId: number) => void
}

function SortableSectionCard(props: SectionCardProps) {
  const { section } = props
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="mb-2">
      <SectionCardContent {...props} dragListeners={listeners} dragAttributes={attributes} />
    </div>
  )
}

function SectionCardContent({
  section, isActive, isMergeSelected, showMergeCheckbox, dispatch, onSelect,
  dragListeners, dragAttributes,
}: SectionCardProps & { dragListeners?: Record<string, unknown>; dragAttributes?: DraggableAttributes }) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-lg border p-3 cursor-pointer transition-all",
        isActive && "ring-2 ring-primary bg-primary/5",
        !isActive && "hover:bg-muted/50",
        isMergeSelected && "ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-950"
      )}
      onClick={() => onSelect(section.id)}
    >
      {showMergeCheckbox && (
        <Checkbox
          checked={isMergeSelected}
          onCheckedChange={() => dispatch({ type: "TOGGLE_MERGE_SELECT", sectionId: section.id })}
          onClick={(e) => e.stopPropagation()}
          className="mt-1"
        />
      )}
      <button {...dragListeners} {...dragAttributes} className="mt-0.5 cursor-grab active:cursor-grabbing" onClick={(e) => e.stopPropagation()}>
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{section.name}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" className="text-xs gap-1">
            <ImageIcon className="h-3 w-3" />
            {section.imageFileIds.length}
          </Badge>
          <Badge variant="outline" className="text-xs gap-1">
            <FileText className="h-3 w-3" />
            {section.items.length}
          </Badge>
        </div>
      </div>
      <SectionMenu section={section} dispatch={dispatch} />
    </div>
  )
}

function SectionMenu({ section, dispatch }: { section: DilapsSection; dispatch: React.Dispatch<ReviewAction> }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" onClick={(e) => e.stopPropagation()}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => dispatch({ type: "TOGGLE_MERGE_SELECT", sectionId: section.id })}>
          <Merge className="h-4 w-4 mr-2" /> Select for Merge
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => dispatch({ type: "SPLIT_SECTION", sectionId: section.id, atImageIndex: 1 })}>
          <Scissors className="h-4 w-4 mr-2" /> Split Section
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => dispatch({ type: "DELETE_SECTION", sectionId: section.id })}>
          <Trash2 className="h-4 w-4 mr-2" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function SectionNav({ sections, activeSectionId, mergeSelection, canMerge, dispatch, onSelect }: SectionNavProps) {
  const showMergeCheckbox = mergeSelection.length > 0

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = sections.findIndex((s) => s.id === active.id)
    const newIdx = sections.findIndex((s) => s.id === over.id)
    const reordered = [...sections]
    const moved = reordered.splice(oldIdx, 1)[0]
    if (!moved) return
    reordered.splice(newIdx, 0, moved)
    dispatch({ type: "REORDER_SECTIONS", sectionIds: reordered.map((s) => s.id) })
  }

  return (
    <div className="flex flex-col h-full overflow-hidden border-r" style={{ width: SIDEBAR_WIDTH }}>
      <div className="p-4 border-b">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Sections</h3>
      </div>
      {showMergeCheckbox && (
        <MergeToolbar canMerge={canMerge} mergeSelection={mergeSelection} dispatch={dispatch} />
      )}
      <ScrollArea className="flex-1">
        <div className="p-3">
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              {sections.map((section) => (
                <SortableSectionCard
                  key={section.id}
                  section={section}
                  isActive={section.id === activeSectionId}
                  isMergeSelected={mergeSelection.includes(section.id)}
                  showMergeCheckbox={showMergeCheckbox}
                  dispatch={dispatch}
                  onSelect={onSelect}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </ScrollArea>
    </div>
  )
}

function MergeToolbar({ canMerge, mergeSelection, dispatch }: { canMerge: boolean; mergeSelection: number[]; dispatch: React.Dispatch<ReviewAction> }) {
  return (
    <div className="p-3 border-b bg-amber-50 dark:bg-amber-950">
      <p className="text-xs text-amber-700 dark:text-amber-300 mb-2">
        Select 2 sections to merge ({mergeSelection.length}/2)
      </p>
      <div className="flex gap-2">
        <Button
          size="sm"
          disabled={!canMerge}
          onClick={() => {
            const targetId = mergeSelection[0]
            const sourceId = mergeSelection[1]
            if (targetId !== undefined && sourceId !== undefined) {
              dispatch({ type: "MERGE_SECTIONS", sourceId, targetId })
            }
          }}
        >
          <Merge className="h-4 w-4 mr-1" /> Merge
        </Button>
        <Button variant="outline" size="sm" onClick={() => dispatch({ type: "CLEAR_MERGE_SELECT" })}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
