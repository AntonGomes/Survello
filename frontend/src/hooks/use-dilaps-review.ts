import { useReducer, useCallback } from "react"
import { reviewReducer, recomputeItemNumbers } from "./dilaps-review-reducer"
import { MOCK_SECTIONS } from "./dilaps-review-mock"
import type { ReviewState } from "./dilaps-review-types"

export type { DilapsItem, DilapsSection, UnitType, ReviewAction } from "./dilaps-review-types"

const INITIAL_STATE: ReviewState = {
  sections: recomputeItemNumbers(MOCK_SECTIONS),
  activeSectionId: MOCK_SECTIONS[0]?.id ?? null,
  mergeSelection: [],
}

export function useDilapsReview() {
  const [state, dispatch] = useReducer(reviewReducer, INITIAL_STATE)

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
