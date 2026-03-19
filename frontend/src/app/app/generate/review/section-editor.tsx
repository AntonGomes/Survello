"use client"

import { useState } from "react"
import { ImageIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ImageLightbox, useLightbox } from "@/components/ui/image-lightbox"
import { ItemsTable } from "./items-table"
import type { DilapsSection, ReviewAction } from "@/hooks/use-dilaps-review"

type SectionEditorProps = {
  section: DilapsSection
  dispatch: React.Dispatch<ReviewAction>
}

function SectionNameEditor({ section, dispatch }: SectionEditorProps) {
  const [isEditing, setIsEditing] = useState(false)

  if (!isEditing) {
    return (
      <h2
        className="text-xl font-semibold cursor-pointer hover:text-primary transition-colors"
        onClick={() => setIsEditing(true)}
      >
        {section.name}
      </h2>
    )
  }

  return (
    <Input
      autoFocus
      className="text-xl font-semibold h-10"
      value={section.name}
      onChange={(e) => dispatch({ type: "RENAME_SECTION", sectionId: section.id, name: e.target.value })}
      onBlur={() => setIsEditing(false)}
      onKeyDown={(e) => { if (e.key === "Enter") setIsEditing(false) }}
    />
  )
}

const PLACEHOLDER_IMAGE_URL = "/api/placeholder/96/96"

function buildLightboxImages(imageFileIds: number[]) {
  return imageFileIds.map((fileId) => ({
    id: fileId,
    url: PLACEHOLDER_IMAGE_URL,
    alt: `Survey image ${fileId}`,
  }))
}

function ImageStrip({ section }: { section: DilapsSection }) {
  const lightboxImages = buildLightboxImages(section.imageFileIds)
  const lightbox = useLightbox(lightboxImages)
  const THUMBNAIL_SIZE = 96

  if (section.imageFileIds.length === 0) return null

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <ImageIcon className="h-4 w-4" />
        <span>{section.imageFileIds.length} images</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {section.imageFileIds.map((fileId, idx) => (
          <button
            key={fileId}
            className="flex-shrink-0 rounded-md border overflow-hidden hover:ring-2 hover:ring-primary transition-all"
            style={{ width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE }}
            onClick={() => lightbox.openLightbox(idx)}
          >
            <div className="w-full h-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
              {fileId}
            </div>
          </button>
        ))}
      </div>
      <ImageLightbox
        images={lightbox.images}
        initialIndex={lightbox.initialIndex}
        open={lightbox.isOpen}
        onOpenChange={lightbox.setIsOpen}
      />
    </div>
  )
}

export function SectionEditor({ section, dispatch }: SectionEditorProps) {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <SectionNameEditor section={section} dispatch={dispatch} />
        <Badge variant="secondary">{section.items.length} items</Badge>
      </div>
      <ImageStrip section={section} />
      <ItemsTable section={section} dispatch={dispatch} />
    </div>
  )
}
