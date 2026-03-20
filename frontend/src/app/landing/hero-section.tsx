"use client"

import { Badge } from "@/components/ui/badge"

const stats = [
  { value: "20-80%", label: "Reduction in document production time" },
  { value: "122", label: "Hours saved per year with AI tools" },
  { value: "14.8%", label: "Revenue growth for innovative SMEs" },
]

export function HeroContent() {
  return (
    <div className="space-y-8">
      <div className="space-y-5">
        <Badge variant="outline" className="border-secondary text-secondary bg-secondary/10">
          Early Access
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
          Property surveying,{" "}
          <span className="relative"><span className="text-secondary">reimagined</span></span>{" "}
          for efficiency.
        </h1>
        <p className="text-lg text-blue-100 max-w-xl leading-relaxed">
          From site notes to signed schedules in minutes, not hours.{" "}
          <span className="font-tiempos italic font-medium">Survello</span>{" "}
          combines powerful AI document generation with intelligent job
          tracking—built with purpose, designed for surveyors.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.value} className="bg-white/10 rounded-lg p-4 border-t-2 border-accent">
            <div className="text-2xl font-bold text-secondary">{stat.value}</div>
            <div className="text-xs text-blue-200">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
