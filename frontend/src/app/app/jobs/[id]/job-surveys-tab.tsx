"use client"

import { Calendar, Camera, ChevronRight, User } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { CreateSurveyDialog } from "@/components/create-survey-dialog"

interface Survey {
  id: number
  conducted_date: string
  photo_count?: number
  instruction?: { name: string }
  site_notes?: string
  notes?: string
  conducted_by_user?: { name: string }
  surveyor?: { name: string }
  weather?: string
}

function SurveyCard({ survey }: { survey: Survey }) {
  return (
    <Link href={`/app/surveys/${survey.id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base font-medium">
                {format(new Date(survey.conducted_date), "EEEE, d MMMM yyyy")}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {survey.photo_count !== undefined && survey.photo_count > 0 && (
                <Badge variant="secondary">{survey.photo_count} photos</Badge>
              )}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          {survey.instruction && (
            <Badge variant="outline" className="w-fit mt-1">{survey.instruction.name}</Badge>
          )}
        </CardHeader>
        <SurveyCardContent survey={survey} />
      </Card>
    </Link>
  )
}

function SurveyCardContent({ survey }: { survey: Survey }) {
  return (
    <CardContent className="pt-0">
      {(survey.site_notes || survey.notes) && (
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {survey.site_notes || survey.notes}
        </p>
      )}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        {(survey.conducted_by_user || survey.surveyor) && (
          <div className="flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            <span>{survey.conducted_by_user?.name || survey.surveyor?.name}</span>
          </div>
        )}
        {survey.weather && <span>{survey.weather}</span>}
      </div>
    </CardContent>
  )
}

interface SurveysTabProps {
  jobId: number
  surveys: Survey[] | undefined
  isLoading: boolean
}

export function SurveysTab({ jobId, surveys, isLoading }: SurveysTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">All Surveys</h2>
        <CreateSurveyDialog jobId={jobId} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner className="h-8 w-8" />
        </div>
      ) : surveys && surveys.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:max-h-[calc(100vh-240px)] lg:overflow-y-auto lg:pr-2">
          {surveys.map((survey) => <SurveyCard key={survey.id} survey={survey} />)}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <Camera className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-medium mb-1">No surveys yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Record your first site survey.</p>
          <CreateSurveyDialog jobId={jobId} />
        </div>
      )}
    </div>
  )
}
