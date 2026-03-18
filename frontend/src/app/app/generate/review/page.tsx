"use client"

import { Suspense } from "react"
import { useDilapsReview } from "@/hooks/use-dilaps-review"
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
  const {
    sections, activeSectionId, activeSection,
    mergeSelection, canMerge, totalItems, totalCost,
    dispatch, setActiveSection,
  } = useDilapsReview()

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
