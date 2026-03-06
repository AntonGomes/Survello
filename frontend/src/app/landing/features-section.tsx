"use client"

import { BarChart3, Clock, FileText, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  { title: "Automated Schedules", description: "Upload site photos and rough notes. Survello formats them into your templates, no need to compromise on your branding and style.", icon: <FileText className="h-5 w-5 text-accent" /> },
  { title: "Time Reclaimed", description: "SME workers using AI tools save an average of 122 hours per year. That's three extra weeks to focus on billable work.", icon: <Clock className="h-5 w-5 text-accent" /> },
  { title: "Competitive Edge", description: "Innovative SMEs are seeing 14.8% revenue growth. Don't let competitors beat you to the next contract.", icon: <TrendingUp className="h-5 w-5 text-accent" /> },
  { title: "Commercial Operations", description: "Track billable hours per job, generate invoices, and visualise portfolio performance with built-in analytics.", icon: <BarChart3 className="h-5 w-5 text-accent" /> },
]

export function FeaturesSection() {
  return (
    <section className="bg-white py-20 px-6" id="features">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <Badge variant="outline" className="border-accent text-accent mx-auto">Why Survello?</Badge>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">Built for the realities of surveying.</h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed">
            Stop wrestling with Word documents and scattered emails. Survello brings your technical reporting and job management into one intelligent workspace.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border/60 shadow-sm hover:shadow-md transition-shadow border-t-2 border-t-accent">
              <CardHeader>
                <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">{feature.icon}</div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription className="leading-relaxed mt-2">{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
