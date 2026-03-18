export interface UpdateItem {
  id: string
  update_type: "text" | "file_upload" | "project_created" | "survey_created" | "status_change" | "job_created"
  text: string
  author_id: number
  author_name: string | null
  author_initials: string | null
  created_at: string
  time_entry_id?: number | null
  project_id?: number | null
  survey_id?: number | null
  file_count?: number | null
  source_project_id?: number | null
  source_project_name?: string | null
}

export interface LegacyUpdateEntry {
  text: string
  user_id: number
  user_name: string
  created_at: string
}

export interface UpdateFeedProps {
  updates: (UpdateItem | LegacyUpdateEntry)[] | null | undefined
  currentUserId: number
  onAddUpdate: (text: string) => Promise<void> | void
  onDeleteUpdate?: (updateId: string) => void
  isLoading?: boolean
  className?: string
  placeholder?: string
  showDeleteButton?: boolean
  maxInitialItems?: number
}
