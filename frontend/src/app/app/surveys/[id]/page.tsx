"use client"

import { use, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Image as ImageIcon, FileText, Download } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { ImageLightbox, useLightbox } from "@/components/ui/image-lightbox"
import { readSurveyOptions, readSurveyFilesOptions, updateSurveyMutation, readJobOptions } from "@/client/@tanstack/react-query.gen"
import { generateFileDownloadUrl } from "@/client/sdk.gen"
import { formatDate } from "@/lib/utils"
import type { FileRead } from "@/client/types.gen"

import { SurveyDetailsCard, SiteNotesCard } from "./survey-sidebar"

const LIGHTBOX_OPEN_DELAY_MS = 100

interface SurveyDetailPageProps {
  params: Promise<{ id: string }>
}

export default function SurveyDetailPage({ params }: SurveyDetailPageProps) {
  const { id } = use(params)
  const surveyId = parseInt(id, 10)
  const queryClient = useQueryClient()

  const { data: survey, isLoading: isSurveyLoading } = useQuery({ ...readSurveyOptions({ path: { survey_id: surveyId } }), enabled: !isNaN(surveyId) })
  const { data: files = [], isLoading: isFilesLoading } = useQuery({ ...readSurveyFilesOptions({ path: { survey_id: surveyId } }), enabled: !isNaN(surveyId) })
  const { data: job } = useQuery({ ...readJobOptions({ path: { job_id: survey?.job_id || 0 } }), enabled: !!survey?.job_id })
  const { mutate: updateSurvey, isPending: isUpdating } = useMutation({
    ...updateSurveyMutation(),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: readSurveyOptions({ path: { survey_id: surveyId } }).queryKey }) },
  })

  const imageFiles = files.filter((f: FileRead) => f.mime_type.startsWith("image/"))
  const otherFiles = files.filter((f: FileRead) => !f.mime_type.startsWith("image/"))

  const [imageUrls, setImageUrls] = useState<{ id: number | string; url: string; fileName?: string }[]>([])
  const lightbox = useLightbox(imageUrls)

  if (isSurveyLoading) return <div className="flex items-center justify-center h-64"><Spinner className="h-8 w-8" /></div>
  if (!survey) return <div className="container py-8"><p className="text-center text-muted-foreground">Survey not found</p></div>

  const handleSaveSiteNotes = (notes: string) => { updateSurvey({ path: { survey_id: surveyId }, body: { site_notes: notes } }) }

  const handleImageClick = async (index: number) => {
    if (imageUrls.length === 0) {
      const urls = await Promise.all(imageFiles.map(async (f: FileRead) => {
        const url = await getDownloadUrl(f.id)
        return { id: f.id, url, fileName: f.file_name }
      }))
      setImageUrls(urls)
      setTimeout(() => lightbox.openLightbox(index), LIGHTBOX_OPEN_DELAY_MS)
    } else {
      lightbox.openLightbox(index)
    }
  }

  return (
    <div className="container py-6 max-w-7xl">
      <SurveyHeader survey={survey} job={job} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <SurveyDetailsCard survey={survey} />
          {survey.description && <DescriptionCard description={survey.description} />}
          <SiteNotesCard siteNotes={survey.site_notes} isUpdating={isUpdating} onSave={handleSaveSiteNotes} />
          {otherFiles.length > 0 && <OtherFilesCard files={otherFiles} />}
        </div>
        <div className="lg:col-span-2">
          <PhotosCard imageFiles={imageFiles} isLoading={isFilesLoading} onImageClick={handleImageClick} />
        </div>
      </div>
      <ImageLightbox images={imageUrls} initialIndex={lightbox.initialIndex} open={lightbox.isOpen} onOpenChange={lightbox.setIsOpen} />
    </div>
  )
}

async function getDownloadUrl(fileId: number): Promise<string> {
  const response = await generateFileDownloadUrl({ path: { file_id: fileId }, throwOnError: true })
  return response.data
}

function SurveyHeader({ survey, job }: { survey: { conducted_date: string; job_id: number }; job: { id: number; name: string; client?: { name: string } | null } | undefined }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <Link href={`/app/jobs/${survey.job_id}`}><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
      <div>
        <h1 className="text-2xl font-semibold">Survey - {formatDate(survey.conducted_date)}</h1>
        {job && <p className="text-muted-foreground"><Link href={`/app/jobs/${job.id}`} className="hover:underline">{job.name}</Link>{job.client && ` \u2022 ${job.client.name}`}</p>}
      </div>
    </div>
  )
}

function DescriptionCard({ description }: { description: string }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-lg">Description</CardTitle></CardHeader>
      <CardContent><p className="text-sm whitespace-pre-wrap">{description}</p></CardContent>
    </Card>
  )
}

function OtherFilesCard({ files }: { files: FileRead[] }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5" />Additional Files</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {files.map((file: FileRead) => (
          <div key={file.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
            <span className="text-sm truncate flex-1">{file.file_name}</span>
            <Button variant="ghost" size="icon" onClick={async () => { const url = await getDownloadUrl(file.id); window.open(url, "_blank") }}><Download className="h-4 w-4" /></Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function PhotosCard({ imageFiles, isLoading, onImageClick }: { imageFiles: FileRead[]; isLoading: boolean; onImageClick: (index: number) => void }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />Survey Photos<Badge variant="secondary" className="ml-auto">{imageFiles.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-64"><Spinner className="h-8 w-8" /></div>
        ) : imageFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground"><ImageIcon className="h-12 w-12 mb-2 opacity-50" /><p>No photos attached to this survey</p></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {imageFiles.map((file: FileRead, index: number) => <ImageThumbnail key={file.id} file={file} onClick={() => onImageClick(index)} />)}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ImageThumbnail({ file, onClick }: { file: FileRead; onClick: () => void }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useState(() => {
    getDownloadUrl(file.id).then((url) => { setImageUrl(url); setIsLoading(false) }).catch(() => setIsLoading(false))
  })

  return (
    <button onClick={onClick} className="relative aspect-square bg-muted rounded-lg overflow-hidden group cursor-pointer">
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center"><Spinner className="h-6 w-6" /></div>
      ) : imageUrl ? (
        <Image src={imageUrl} alt={file.file_name} fill className="object-cover transition-transform group-hover:scale-105" unoptimized />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center"><ImageIcon className="h-8 w-8 text-muted-foreground" /></div>
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
    </button>
  )
}
