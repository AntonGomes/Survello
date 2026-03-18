import type { DilapsItem, DilapsSection, ReviewState, ReviewAction, UpdateItemPayload } from "./dilaps-review-types"

const MAX_MERGE_SELECTIONS = 2

function computeItemNumber(sectionIndex: number, itemIndex: number): string {
  const sectionNum = sectionIndex + 1
  const itemNum = (itemIndex + 1).toString().padStart(2, "0")
  return `${sectionNum}.${itemNum}`
}

export function recomputeItemNumbers(sections: DilapsSection[]): DilapsSection[] {
  return sections.map((section, sIdx) => ({
    ...section,
    sortOrder: sIdx,
    items: section.items.map((item, iIdx) => ({
      ...item,
      itemNumber: computeItemNumber(sIdx, iIdx),
      sortOrder: iIdx,
    })),
  }))
}

function computeCost(item: DilapsItem): number | null {
  if (item.quantity !== null && item.rate !== null) {
    return item.quantity * item.rate
  }
  return null
}

function handleUpdateItem(state: ReviewState, payload: UpdateItemPayload): ReviewState {
  const sections = state.sections.map((section) => {
    if (section.id !== payload.sectionId) return section
    return {
      ...section,
      items: section.items.map((item) => {
        if (item.id !== payload.itemId) return item
        const updated = { ...item, [payload.field]: payload.value }
        updated.cost = computeCost(updated)
        return updated
      }),
    }
  })
  return { ...state, sections }
}

function handleAddItem(state: ReviewState, sectionId: number): ReviewState {
  const maxId = state.sections
    .flatMap((s) => s.items)
    .reduce((max, item) => Math.max(max, item.id), 0)

  const sections = state.sections.map((section) => {
    if (section.id !== sectionId) return section
    const newItem: DilapsItem = {
      id: maxId + 1,
      itemNumber: "",
      leaseClause: "",
      wantOfRepair: "",
      remedy: "",
      unit: "Sum",
      quantity: null,
      rate: null,
      cost: null,
      sortOrder: section.items.length,
    }
    return { ...section, items: [...section.items, newItem] }
  })
  return { ...state, sections: recomputeItemNumbers(sections) }
}

function handleDeleteItem(state: ReviewState, sectionId: number, itemId: number): ReviewState {
  const sections = state.sections.map((section) => {
    if (section.id !== sectionId) return section
    return { ...section, items: section.items.filter((i) => i.id !== itemId) }
  })
  return { ...state, sections: recomputeItemNumbers(sections) }
}

function handleMergeSections(state: ReviewState, sourceId: number, targetId: number): ReviewState {
  const source = state.sections.find((s) => s.id === sourceId)
  const target = state.sections.find((s) => s.id === targetId)
  if (!source || !target) return state

  const merged: DilapsSection = {
    ...target,
    imageFileIds: [...target.imageFileIds, ...source.imageFileIds],
    items: [...target.items, ...source.items],
  }

  const sections = state.sections
    .map((s) => (s.id === targetId ? merged : s))
    .filter((s) => s.id !== sourceId)

  return {
    ...state,
    sections: recomputeItemNumbers(sections),
    mergeSelection: [],
    activeSectionId: targetId,
  }
}

function handleSplitSection(state: ReviewState, sectionId: number, atImageIndex: number): ReviewState {
  const section = state.sections.find((s) => s.id === sectionId)
  if (!section || atImageIndex <= 0) return state

  const maxSectionId = state.sections.reduce((max, s) => Math.max(max, s.id), 0)
  const first: DilapsSection = {
    ...section,
    imageFileIds: section.imageFileIds.slice(0, atImageIndex),
  }
  const second: DilapsSection = {
    id: maxSectionId + 1,
    name: `${section.name} (Split)`,
    sortOrder: section.sortOrder + 1,
    imageFileIds: section.imageFileIds.slice(atImageIndex),
    items: [],
  }

  const idx = state.sections.findIndex((s) => s.id === sectionId)
  const sections = [
    ...state.sections.slice(0, idx),
    first,
    second,
    ...state.sections.slice(idx + 1),
  ]
  return { ...state, sections: recomputeItemNumbers(sections) }
}

function handleDeleteSection(state: ReviewState, sectionId: number): ReviewState {
  const sections = state.sections.filter((s) => s.id !== sectionId)
  const newActive = sections.length > 0 ? sections[0].id : null
  return {
    ...state,
    sections: recomputeItemNumbers(sections),
    activeSectionId: state.activeSectionId === sectionId ? newActive : state.activeSectionId,
  }
}

function handleToggleMerge(state: ReviewState, sectionId: number): ReviewState {
  const has = state.mergeSelection.includes(sectionId)
  if (has) {
    return { ...state, mergeSelection: state.mergeSelection.filter((id) => id !== sectionId) }
  }
  if (state.mergeSelection.length >= MAX_MERGE_SELECTIONS) return state
  return { ...state, mergeSelection: [...state.mergeSelection, sectionId] }
}

export function reviewReducer(state: ReviewState, action: ReviewAction): ReviewState {
  switch (action.type) {
    case "SET_SECTIONS":
      return {
        ...state,
        sections: recomputeItemNumbers(action.sections),
        activeSectionId: action.sections[0]?.id ?? null,
      }
    case "SET_ACTIVE_SECTION":
      return { ...state, activeSectionId: action.sectionId }
    case "UPDATE_ITEM":
      return handleUpdateItem(state, action.payload)
    case "ADD_ITEM":
      return handleAddItem(state, action.sectionId)
    case "DELETE_ITEM":
      return handleDeleteItem(state, action.sectionId, action.itemId)
    case "RENAME_SECTION":
      return {
        ...state,
        sections: state.sections.map((s) =>
          s.id === action.sectionId ? { ...s, name: action.name } : s
        ),
      }
    case "REORDER_SECTIONS": {
      const ordered = action.sectionIds
        .map((id) => state.sections.find((s) => s.id === id))
        .filter(Boolean) as DilapsSection[]
      return { ...state, sections: recomputeItemNumbers(ordered) }
    }
    case "MERGE_SECTIONS":
      return handleMergeSections(state, action.sourceId, action.targetId)
    case "SPLIT_SECTION":
      return handleSplitSection(state, action.sectionId, action.atImageIndex)
    case "DELETE_SECTION":
      return handleDeleteSection(state, action.sectionId)
    case "TOGGLE_MERGE_SELECT":
      return handleToggleMerge(state, action.sectionId)
    case "CLEAR_MERGE_SELECT":
      return { ...state, mergeSelection: [] }
    default:
      return state
  }
}
