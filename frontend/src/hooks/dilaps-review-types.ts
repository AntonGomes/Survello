export type UnitType = "Sum" | "m" | "m\u00B2" | "No"

export type DilapsItem = {
  id: number
  itemNumber: string
  leaseClause: string
  wantOfRepair: string
  remedy: string
  unit: UnitType
  quantity: number | null
  rate: number | null
  cost: number | null
  sortOrder: number
}

export type DilapsSection = {
  id: number
  name: string
  sortOrder: number
  imageFileIds: number[]
  items: DilapsItem[]
}

export type ReviewState = {
  sections: DilapsSection[]
  activeSectionId: number | null
  mergeSelection: number[]
}

export type UpdateItemPayload = {
  sectionId: number
  itemId: number
  field: keyof DilapsItem
  value: string | number | null
}

export type ReviewAction =
  | { type: "SET_SECTIONS"; sections: DilapsSection[] }
  | { type: "SET_ACTIVE_SECTION"; sectionId: number }
  | { type: "UPDATE_ITEM"; payload: UpdateItemPayload }
  | { type: "ADD_ITEM"; sectionId: number }
  | { type: "DELETE_ITEM"; sectionId: number; itemId: number }
  | { type: "RENAME_SECTION"; sectionId: number; name: string }
  | { type: "REORDER_SECTIONS"; sectionIds: number[] }
  | { type: "MERGE_SECTIONS"; sourceId: number; targetId: number }
  | { type: "SPLIT_SECTION"; sectionId: number; atImageIndex: number }
  | { type: "DELETE_SECTION"; sectionId: number }
  | { type: "TOGGLE_MERGE_SELECT"; sectionId: number }
  | { type: "CLEAR_MERGE_SELECT" }
