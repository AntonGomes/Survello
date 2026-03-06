"use client"

import { useState } from "react"
import { Calendar, Cloud, Users, MapPin, Pencil, Check, X } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { formatDate } from "@/lib/utils"
import { getWeatherDisplay } from "./weather-display"

interface SurveyDetailsCardProps {
  survey: {
    conducted_date: string
    weather?: string | null
    surveyors?: Array<{ id: number; name: string }> | null
    conducted_by_user?: { name: string } | null
    instruction?: { name: string } | null
    photo_count?: number | null
    file_count?: number | null
  }
}

export function SurveyDetailsCard({ survey }: SurveyDetailsCardProps) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-lg">Survey Details</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <DetailItem icon={Calendar} label="Date" value={formatDate(survey.conducted_date)} />
        {survey.weather && <DetailItem icon={Cloud} label="Weather" value={getWeatherDisplay(survey.weather) ?? survey.weather} />}
        <SurveyorsSection survey={survey} />
        {survey.instruction && <DetailItem icon={MapPin} label="Instruction" value={survey.instruction.name} />}
        <Separator />
        <div className="grid grid-cols-2 gap-4">
          <StatDisplay value={survey.photo_count ?? 0} label="Photos" />
          <StatDisplay value={survey.file_count ?? 0} label="Files" />
        </div>
      </CardContent>
    </Card>
  )
}

function DetailItem({ icon: Icon, label, value }: {
  icon: React.ComponentType<{ className?: string }>; label: string; value: string
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  )
}

function SurveyorsSection({ survey }: SurveyDetailsCardProps) {
  const hasSurveyors = (survey.surveyors && survey.surveyors.length > 0) || survey.conducted_by_user
  if (!hasSurveyors) return null

  return (
    <div className="flex items-start gap-3">
      <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
      <div>
        <p className="text-sm text-muted-foreground">Surveyors</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {survey.surveyors && survey.surveyors.length > 0
            ? survey.surveyors.map((s) => <Badge key={s.id} variant="secondary">{s.name}</Badge>)
            : survey.conducted_by_user
              ? <Badge variant="secondary">{survey.conducted_by_user.name}</Badge>
              : null}
        </div>
      </div>
    </div>
  )
}

function StatDisplay({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

interface SiteNotesCardProps {
  siteNotes: string | null | undefined
  isUpdating: boolean
  onSave: (notes: string) => void
}

export function SiteNotesCard({ siteNotes, isUpdating, onSave }: SiteNotesCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedNotes, setEditedNotes] = useState("")

  const handleStartEditing = () => {
    setEditedNotes(siteNotes || "")
    setIsEditing(true)
  }

  const handleSave = () => {
    onSave(editedNotes)
    setIsEditing(false)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">Site Notes</CardTitle>
        {!isEditing && (
          <Button variant="ghost" size="icon" onClick={handleStartEditing}><Pencil className="h-4 w-4" /></Button>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-2">
            <Textarea value={editedNotes} onChange={(e) => setEditedNotes(e.target.value)} rows={6} className="resize-none" placeholder="Add site observations..." />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={isUpdating}><X className="h-4 w-4 mr-1" />Cancel</Button>
              <Button size="sm" onClick={handleSave} disabled={isUpdating}>
                {isUpdating ? <Spinner className="h-4 w-4 mr-1" /> : <Check className="h-4 w-4 mr-1" />}Save
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap text-muted-foreground">{siteNotes || "No site notes recorded."}</p>
        )}
      </CardContent>
    </Card>
  )
}
