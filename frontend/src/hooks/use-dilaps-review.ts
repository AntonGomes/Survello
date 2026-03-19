import { useReducer, useCallback, useEffect } from "react"
import { reviewReducer } from "./dilaps-review-reducer"
import { readDilapsSections } from "@/client/sdk.gen"
import type { ReviewState, DilapsSection, DilapsItem, UnitType } from "./dilaps-review-types"
import type { SectionWithItems, DilapsItemRead } from "@/client/types.gen"

export type { DilapsItem, DilapsSection, UnitType, ReviewAction } from "./dilaps-review-types"

const INITIAL_STATE: ReviewState = {
  sections: [],
  activeSectionId: null,
  mergeSelection: [],
}

function parseNumeric(value: string | null | undefined): number | null {
  if (value === null || value === undefined) return null
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

function mapItem(item: DilapsItemRead): DilapsItem {
  const quantity = parseNumeric(item.quantity)
  const rate = parseNumeric(item.rate)
  return {
    id: item.id,
    itemNumber: item.item_number,
    leaseClause: item.lease_clause,
    wantOfRepair: item.want_of_repair,
    remedy: item.remedy,
    unit: item.unit as UnitType,
    quantity,
    rate,
    cost: quantity !== null && rate !== null ? quantity * rate : parseNumeric(item.cost),
    sortOrder: item.sort_order ?? 0,
  }
}

function mapSection(section: SectionWithItems): DilapsSection {
  return {
    id: section.id,
    name: section.name,
    sortOrder: section.sort_order ?? 0,
    imageFileIds: (section.image_files ?? []).map((f) => f.id),
    items: (section.items ?? []).map(mapItem),
  }
}

export function useDilapsReview(dilapsId: number | null) {
  const [state, dispatch] = useReducer(reviewReducer, INITIAL_STATE)

  useEffect(() => {
    if (dilapsId === null) return
    readDilapsSections({
      path: { dilaps_id: dilapsId },
      throwOnError: true,
    }).then((response) => {
      const sections = response.data.map(mapSection)
      dispatch({ type: "SET_SECTIONS", sections })
    })
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
    dispatch,
    setActiveSection,
  }
}
