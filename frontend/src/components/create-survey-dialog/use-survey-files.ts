"use client"

import { useState, useCallback, useRef } from "react"
import type { UseFormReturn } from "react-hook-form"
import type { FileWithPreview, SurveyFormValues } from "./types"

async function processEntry(entry: FileSystemEntry): Promise<File | File[] | null> {
  if (entry.isFile) {
    const fileEntry = entry as FileSystemFileEntry
    return new Promise<File>((resolve) => { fileEntry.file((file) => resolve(file)) })
  } else if (entry.isDirectory) {
    const dirEntry = entry as FileSystemDirectoryEntry
    const reader = dirEntry.createReader()
    return new Promise<File[]>((resolve) => {
      reader.readEntries(async (entries) => {
        const files: File[] = []
        for (const subEntry of entries) {
          const result = await processEntry(subEntry)
          if (Array.isArray(result)) { files.push(...result) }
          else if (result) { files.push(result) }
        }
        resolve(files)
      })
    })
  }
  return null
}

function addImageResults({ result, target, index }: { result: File | File[] | null; target: FileWithPreview[]; index: number }) {
  if (Array.isArray(result)) {
    result.forEach((file) => {
      if (file.type.startsWith("image/")) {
        target.push({ file, id: `${file.name}-${Date.now()}-${index}`, preview: URL.createObjectURL(file) })
      }
    })
  } else if (result && result.type.startsWith("image/")) {
    target.push({ file: result, id: `${result.name}-${Date.now()}-${index}`, preview: URL.createObjectURL(result) })
  }
}

function useImageDrop(setImageFiles: React.Dispatch<React.SetStateAction<FileWithPreview[]>>) {
  return useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const items = e.dataTransfer.items
    const newFiles: FileWithPreview[] = []
    const processItems = async () => {
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        if (!item) continue
        const entry = item.webkitGetAsEntry()
        if (!entry) continue
        const result = await processEntry(entry)
        addImageResults({ result, target: newFiles, index: i })
      }
      setImageFiles((prev) => [...prev, ...newFiles])
    }
    processItems()
  }, [setImageFiles])
}

function useSiteNotesFile(form: UseFormReturn<SurveyFormValues>) {
  const [siteNotesFile, setSiteNotesFile] = useState<File | null>(null)
  const siteNotesInputRef = useRef<HTMLInputElement>(null)

  const handleSiteNotesFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const validTypes = ["text/plain", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", ".txt", ".docx"]
    const isValid = validTypes.some((type) => file.type.includes(type)) || file.name.endsWith(".txt") || file.name.endsWith(".docx")
    if (!isValid) return
    setSiteNotesFile(file)
    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      const text = await file.text()
      form.setValue("site_notes", text)
    } else {
      form.setValue("site_notes", `[Content from ${file.name} will be extracted]`)
    }
  }

  const removeSiteNotesFile = () => { setSiteNotesFile(null); form.setValue("site_notes", "") }

  return { siteNotesFile, siteNotesInputRef, handleSiteNotesFileSelect, removeSiteNotesFile, setSiteNotesFile }
}

export function useSurveyFiles(form: UseFormReturn<SurveyFormValues>) {
  const [imageFiles, setImageFiles] = useState<FileWithPreview[]>([])
  const [otherFiles, setOtherFiles] = useState<FileWithPreview[]>([])
  const imageInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const siteNotes = useSiteNotesFile(form)
  const handleImageDrop = useImageDrop(setImageFiles)

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const additions = files.filter((f) => f.type.startsWith("image/")).map((file, i) => ({ file, id: `${file.name}-${Date.now()}-${i}`, preview: URL.createObjectURL(file) }))
    setImageFiles((prev) => [...prev, ...additions])
  }

  const handleOtherFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const additions = files.map((file, i) => ({ file, id: `${file.name}-${Date.now()}-${i}` }))
    setOtherFiles((prev) => [...prev, ...additions])
  }

  const removeImage = (id: string) => {
    setImageFiles((prev) => {
      const file = prev.find((f) => f.id === id)
      if (file?.preview) URL.revokeObjectURL(file.preview)
      return prev.filter((f) => f.id !== id)
    })
  }

  const removeFile = (id: string) => { setOtherFiles((prev) => prev.filter((f) => f.id !== id)) }
  const resetFiles = () => { setImageFiles([]); setOtherFiles([]); siteNotes.setSiteNotesFile(null) }

  return {
    imageFiles, otherFiles, siteNotesFile: siteNotes.siteNotesFile,
    imageInputRef, fileInputRef, siteNotesInputRef: siteNotes.siteNotesInputRef,
    handleImageDrop, handleImageFileSelect, handleOtherFilesSelect,
    handleSiteNotesFileSelect: siteNotes.handleSiteNotesFileSelect, removeImage, removeFile,
    removeSiteNotesFile: siteNotes.removeSiteNotesFile, resetFiles,
  }
}
