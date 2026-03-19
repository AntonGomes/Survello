"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useDilapsReview } from "@/hooks/use-dilaps-review"
import { Spinner } from "@/components/ui/spinner"
import { SectionNav } from "./section-nav"
import { SectionEditor } from "./section-editor"
import { ExportPanel } from "./export-panel"

function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center text-muted-foreground">
      <p>Select a section from the sidebar to begin editing.</p>
    </div>
  )
}

function ReviewContent() {
  const searchParams = useSearchParams()
  const dilapsId = searchParams.get("dilapsId")
  const parsedId = dilapsId ? Number(dilapsId) : null

  const {
    sections, activeSectionId, activeSection,
    mergeSelection, canMerge, totalItems, totalCost,
    loading, error, dispatch, setActiveSection,
  } = useDilapsReview(parsedId)

  if (!parsedId) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>No dilaps ID provided.</p>
      </div>
    )
  }

  if (loading && sections.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error) {
    throw new Error(`Failed to load dilaps sections: ${error}`)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex flex-1 overflow-hidden">
        <SectionNav
          sections={sections}
          activeSectionId={activeSectionId}
          mergeSelection={mergeSelection}
          canMerge={canMerge}
          dispatch={dispatch}
          onSelect={setActiveSection}
        />
        <div className="flex-1 overflow-auto">
          {activeSection ? (
            <SectionEditor section={activeSection} dispatch={dispatch} />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
      <ExportPanel totalItems={totalItems} totalCost={totalCost} />
    </div>
  )
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading review...</div>}>
      <ReviewContent />
    </Suspense>
  )
}
