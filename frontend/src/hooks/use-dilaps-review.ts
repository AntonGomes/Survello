import { useReducer, useCallback, useEffect, useState } from "react"
import { reviewReducer } from "./dilaps-review-reducer"
import { readDilapsSections } from "@/client/sdk.gen"
import type { ReviewState, DilapsSection, DilapsItem } from "./dilaps-review-types"
import type { SectionWithItems } from "@/client/types.gen"

export type { DilapsItem, DilapsSection, UnitType, ReviewAction } from "./dilaps-review-types"

const INITIAL_STATE: ReviewState = {
  sections: [],
  activeSectionId: null,
  mergeSelection: [],
}

function mapApiSection(s: SectionWithItems): DilapsSection {
  return {
    id: s.id,
    name: s.name,
    sortOrder: s.sort_order ?? 0,
    imageFileIds: (s.image_files ?? []).map((f) => f.id),
    items: (s.items ?? []).map((item): DilapsItem => ({
      id: item.id,
      itemNumber: item.item_number,
      leaseClause: item.lease_clause,
      wantOfRepair: item.want_of_repair,
      remedy: item.remedy,
      unit: item.unit as DilapsItem["unit"],
      quantity: item.quantity ? Number(item.quantity) : null,
      rate: item.rate ? Number(item.rate) : null,
      cost: item.cost ? Number(item.cost) : null,
      sortOrder: item.sort_order ?? 0,
    })),
  }
}

export function useDilapsReview(dilapsId: number | null) {
  const [state, dispatch] = useReducer(reviewReducer, INITIAL_STATE)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!dilapsId) return
    setLoading(true)
    setError(null)
    readDilapsSections({
      path: { dilaps_id: dilapsId },
      throwOnError: true,
    })
      .then((response) => {
        const sections = response.data.map(mapApiSection)
        dispatch({ type: "SET_SECTIONS", sections })
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load sections")
      })
      .finally(() => setLoading(false))
  }, [dilapsId])

  const activeSection = state.sections.find(
    (s) => s.id === state.activeSectionId
  ) ?? null

  const totalItems = state.sections.reduce(
    (sum, s) => sum + s.items.length, 0
  )

  const totalCost = state.sections
    .flatMap((s) => s.items)
    .reduce((sum, item) => sum + (item.cost ?? 0), 0)

  const canMerge = state.mergeSelection.length === 2

  const setActiveSection = useCallback(
    (sectionId: number) => dispatch({ type: "SET_ACTIVE_SECTION", sectionId }),
    []
  )

  return {
    sections: state.sections,
    activeSectionId: state.activeSectionId,
    activeSection,
    mergeSelection: state.mergeSelection,
    canMerge,
    totalItems,
    totalCost,
    loading,
    error,
    dispatch,
    setActiveSection,
  }
}
