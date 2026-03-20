"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { ImageIcon } from "lucide-react"
import NextImage from "next/image"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { ImageLightbox, useLightbox } from "@/components/ui/image-lightbox"
import { generateFileDownloadUrl } from "@/client/sdk.gen"
import { ItemsTable } from "./items-table"
import type { DilapsSection, ReviewAction } from "@/hooks/use-dilaps-review"

type SectionEditorProps = {
  section: DilapsSection
  dispatch: React.Dispatch<ReviewAction>
  leaseClauses: Record<string, string>
}

function SectionNameEditor({ section, dispatch }: Pick<SectionEditorProps, "section" | "dispatch">) {
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

const MAX_GRID_HEIGHT = 320

async function fetchDownloadUrl(fileId: number): Promise<string> {
  const response = await generateFileDownloadUrl({
    path: { file_id: fileId },
    query: { inline: true },
    throwOnError: true,
  })
  return response.data
}

function useImageUrls(fileIds: number[]) {
  const [urls, setUrls] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(false)
  const fileIdsKey = useMemo(() => fileIds.join(","), [fileIds])
  const urlsRef = useRef(urls)
  urlsRef.current = urls

  useEffect(() => {
    if (fileIds.length === 0) return
    setLoading(true)
    const pending = fileIds.filter((id) => !urlsRef.current[id])
    if (pending.length === 0) { setLoading(false); return }

    Promise.all(
      pending.map(async (id) => {
        const url = await fetchDownloadUrl(id)
        return { id, url }
      })
    ).then((results) => {
      setUrls((prev) => {
        const next = { ...prev }
        for (const r of results) next[r.id] = r.url
        return next
      })
      setLoading(false)
    })
  }, [fileIds, fileIdsKey])

  return { urls, loading }
}

function ImageThumbnail({ fileId, url, onClick }: {
  fileId: number
  url: string | undefined
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="relative aspect-square bg-muted rounded-lg overflow-hidden group cursor-pointer"
    >
      {url ? (
        <NextImage
          src={url}
          alt={`Survey image ${fileId}`}
          fill
          className="object-cover transition-transform duration-200 group-hover:scale-105"
          unoptimized
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner className="h-6 w-6" />
        </div>
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
        <ImageIcon className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>
    </button>
  )
}

function ImageGrid({ section }: { section: DilapsSection }) {
  const { urls, loading } = useImageUrls(section.imageFileIds)

  const lightboxImages = section.imageFileIds.reduce<Array<{ id: number; url: string; alt: string }>>((acc, id) => {
    const url = urls[id]
    if (url) acc.push({ id, url, alt: `Survey image ${id}` })
    return acc
  }, [])
  const lightbox = useLightbox(lightboxImages)

  const handleClick = useCallback((fileId: number) => {
    const idx = lightboxImages.findIndex((img) => img.id === fileId)
    if (idx >= 0) lightbox.openLightbox(idx)
  }, [lightboxImages, lightbox])

  if (section.imageFileIds.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <ImageIcon className="h-4 w-4" />
        <span>{section.imageFileIds.length} images</span>
      </div>
      <div
        className="overflow-y-auto rounded-lg border p-2"
        style={{ maxHeight: MAX_GRID_HEIGHT }}
      >
        {loading && Object.keys(urls).length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <Spinner className="h-8 w-8" />
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {section.imageFileIds.map((fileId) => (
              <ImageThumbnail
                key={fileId}
                fileId={fileId}
                url={urls[fileId]}
                onClick={() => handleClick(fileId)}
              />
            ))}
          </div>
        )}
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

export function SectionEditor({ section, dispatch, leaseClauses }: SectionEditorProps) {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <SectionNameEditor section={section} dispatch={dispatch} />
        <Badge variant="secondary">{section.items.length} items</Badge>
      </div>
      <ImageGrid section={section} />
      <ItemsTable section={section} dispatch={dispatch} leaseClauses={leaseClauses} />
    </div>
  )
}
