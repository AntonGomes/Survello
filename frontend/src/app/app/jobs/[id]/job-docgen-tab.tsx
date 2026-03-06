"use client"

import { Camera, Files, Briefcase, Sparkles } from "lucide-react"
import Link from "next/link"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

function DocGenStatCard({ icon: Icon, label, value, subtitle }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  subtitle: string
}) {
  return (
    <div className="p-4 rounded-lg border bg-muted/50">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
  )
}

interface DocGenTabProps {
  jobId: number
  photoCount: number
  fileCount: number
  instructionCount: number
}

export function DocGenTab({ jobId, photoCount, fileCount, instructionCount }: DocGenTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI Document Generation
        </CardTitle>
        <CardDescription>Generate professional reports and documentation using AI</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-center p-8 rounded-lg border border-dashed">
          <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="font-medium mb-2">Generate Documents with AI</h3>
          <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
            Create professional reports by uploading context files (photos, notes) and a template.
            The AI will generate a completed document for you.
          </p>
          <Link href={`/app/generate?jobId=${jobId}`}>
            <Button size="lg" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Open Document Generator
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DocGenStatCard icon={Camera} label="Survey Photos" value={photoCount} subtitle="Available for context" />
          <DocGenStatCard icon={Files} label="Job Files" value={fileCount} subtitle="Available for context" />
          <DocGenStatCard icon={Briefcase} label="Instructions" value={instructionCount} subtitle="For attaching outputs" />
        </div>
      </CardContent>
    </Card>
  )
}
