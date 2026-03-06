"use client"

import { X, Upload, FileText, Image as ImageIcon, Check, ChevronsUpDown } from "lucide-react"
import NextImage from "next/image"
import type { UseFormReturn } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { weatherOptions } from "./weather-options"
import type { FileWithPreview, SurveyFormValues } from "./types"

interface DateWeatherFieldsProps {
  form: UseFormReturn<SurveyFormValues>
}

export function DateWeatherFields({ form }: DateWeatherFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="conducted_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Survey Date</FormLabel>
            <FormControl><Input type="date" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="weather"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Weather (Optional)</FormLabel>
            <Select onValueChange={field.onChange} value={field.value ?? undefined}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select weather" /></SelectTrigger></FormControl>
              <SelectContent>
                {weatherOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

interface SurveyorPickerProps {
  orgUsers: Array<{ id: number; name: string }>
  selectedIds: number[]
  onToggle: (id: number) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SurveyorPicker({ orgUsers, selectedIds, onToggle, open, onOpenChange }: SurveyorPickerProps) {
  return (
    <div className="space-y-2">
      <FormLabel>Surveyors</FormLabel>
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
            {selectedIds.length > 0 ? `${selectedIds.length} surveyor(s) selected` : "Select surveyors..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search team members..." />
            <CommandList>
              <CommandEmpty>No team members found.</CommandEmpty>
              <CommandGroup>
                {orgUsers.map((u) => (
                  <CommandItem key={u.id} value={u.name} onSelect={() => onToggle(u.id)}>
                    <Check className={cn("mr-2 h-4 w-4", selectedIds.includes(u.id) ? "opacity-100" : "opacity-0")} />
                    {u.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedIds.map((id) => {
            const user = orgUsers.find((u) => u.id === id)
            return (
              <Badge key={id} variant="secondary" className="cursor-pointer" onClick={() => onToggle(id)}>
                {user?.name}<X className="ml-1 h-3 w-3" />
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}

interface SiteNotesFieldProps {
  form: UseFormReturn<SurveyFormValues>
  siteNotesFile: File | null
  siteNotesInputRef: React.RefObject<HTMLInputElement | null>
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemove: () => void
}

export function SiteNotesField({ form, siteNotesFile, siteNotesInputRef, onFileSelect, onRemove }: SiteNotesFieldProps) {
  return (
    <FormField
      control={form.control}
      name="site_notes"
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center justify-between">
            <FormLabel>Site Notes (Optional)</FormLabel>
            <Button type="button" variant="ghost" size="sm" className="h-auto py-1 px-2 text-xs" onClick={() => siteNotesInputRef.current?.click()}>
              <Upload className="mr-1 h-3 w-3" />Upload .txt/.docx
            </Button>
            <input ref={siteNotesInputRef} type="file" accept=".txt,.docx" className="hidden" onChange={onFileSelect} />
          </div>
          <FormControl>
            <Textarea placeholder="Detailed observations from the site survey..." className="resize-none" rows={4} {...field} value={field.value ?? ""} />
          </FormControl>
          {siteNotesFile && (
            <FormDescription className="flex items-center justify-between">
              <span className="flex items-center gap-1"><FileText className="h-3 w-3" />Imported from: {siteNotesFile.name}</span>
              <Button type="button" variant="ghost" size="sm" className="h-auto p-1 text-muted-foreground hover:text-destructive" onClick={onRemove}>
                <X className="h-3 w-3" />
              </Button>
            </FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

interface ImageUploadSectionProps {
  imageFiles: FileWithPreview[]
  imageInputRef: React.RefObject<HTMLInputElement | null>
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemove: (id: string) => void
}

export function ImageUploadSection({ imageFiles, imageInputRef, onDrop, onFileSelect, onRemove }: ImageUploadSectionProps) {
  return (
    <div className="space-y-2">
      <FormLabel>Survey Photos</FormLabel>
      <div onDragOver={(e) => e.preventDefault()} onDrop={onDrop} onClick={() => imageInputRef.current?.click()}
        className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
        <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">Drag and drop images or folders, or click to browse</p>
        <p className="text-xs text-muted-foreground mt-1">Supports JPG, PNG, HEIC, and other image formats</p>
      </div>
      <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={onFileSelect} />
      {imageFiles.length > 0 && <ImagePreviewGrid images={imageFiles} onRemove={onRemove} />}
    </div>
  )
}

function ImagePreviewGrid({ images, onRemove }: { images: FileWithPreview[]; onRemove: (id: string) => void }) {
  return (
    <div className="mt-2 space-y-1">
      <p className="text-xs text-muted-foreground">{images.length} image{images.length !== 1 ? "s" : ""} selected</p>
      <div className="max-h-[180px] overflow-y-auto border rounded-md p-2">
        <div className="grid grid-cols-4 gap-2">
          {images.map((fw) => (
            <div key={fw.id} className="relative group">
              {fw.preview && <NextImage src={fw.preview} alt={fw.file.name} width={0} height={0} sizes="100vw" className="w-full h-20 object-cover rounded" unoptimized />}
              <button type="button" onClick={() => onRemove(fw.id)}
                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

interface OtherFilesUploadProps {
  otherFiles: FileWithPreview[]
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemove: (id: string) => void
}

export function OtherFilesUpload({ otherFiles, fileInputRef, onFileSelect, onRemove }: OtherFilesUploadProps) {
  return (
    <div className="space-y-2">
      <FormLabel>Additional Files (Optional)</FormLabel>
      <div onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary/50 transition-colors">
        <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
        <p className="text-sm text-muted-foreground">Click to add PDFs, documents, or other files</p>
      </div>
      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={onFileSelect} />
      {otherFiles.length > 0 && <FileList files={otherFiles} onRemove={onRemove} />}
    </div>
  )
}

function FileList({ files, onRemove }: { files: FileWithPreview[]; onRemove: (id: string) => void }) {
  return (
    <div className="mt-2 space-y-1">
      <p className="text-xs text-muted-foreground">{files.length} file{files.length !== 1 ? "s" : ""} selected</p>
      <div className="max-h-[120px] overflow-y-auto border rounded-md p-2 space-y-1">
        {files.map((fw) => (
          <div key={fw.id} className="flex items-center justify-between text-sm bg-muted rounded px-2 py-1">
            <span className="flex items-center gap-2 truncate">
              <FileText className="h-4 w-4 shrink-0" /><span className="truncate">{fw.file.name}</span>
            </span>
            <button type="button" onClick={() => onRemove(fw.id)} className="text-muted-foreground hover:text-destructive">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export function UploadProgressBar({ progress }: { progress: number }) {
  return (
    <div className="space-y-1">
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-xs text-muted-foreground text-center">Uploading... {progress}%</p>
    </div>
  )
}
