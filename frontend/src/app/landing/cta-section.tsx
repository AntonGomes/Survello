"use client"

import Link from "next/link"
import { ArrowRight, Quote } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function QuoteSection() {
  return (
    <section className="bg-white/5 border-y border-white/10 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <blockquote className="text-center">
          <Quote className="h-8 w-8 text-secondary mx-auto mb-4" />
          <p className="text-xl md:text-2xl text-white font-medium italic leading-relaxed">
            &ldquo;Drafting structured reports and forms with AI can cut final document production times by 20-80% in professional services.&rdquo;
          </p>
          <footer className="mt-4 text-blue-200 text-sm">— UK Government AI Opportunities Action Plan</footer>
        </blockquote>
      </div>
    </section>
  )
}

export function TestimonialSection() {
  return (
    <section className="bg-primary py-12 px-6 border-y-4 border-accent">
      <div className="max-w-4xl mx-auto text-center">
        <p className="text-lg md:text-xl text-white italic leading-relaxed">
          &ldquo;I thought it was something really complicated... But I learned that it&apos;s actually quite simple. If I can use it, anyone can.&rdquo;
        </p>
        <p className="text-blue-200 text-sm mt-3">— SME Owner, UK</p>
      </div>
    </section>
  )
}

export function CtaSection() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Ready to modernise your practice?</h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Join forward-thinking surveyors who are reclaiming their time and growing their businesses with Survello.
          </p>
        </div>
        <div className="bg-accent/10 border border-accent/30 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-primary font-medium mb-4">Request early access above, or if you already have an invitation:</p>
          <Link href="/login" className={cn(buttonVariants({ size: "lg" }), "bg-accent text-white hover:bg-accent/70")}>
            Sign in to your account<ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  )
}
