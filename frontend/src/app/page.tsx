"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuth } from "@/context/auth-context"

import { HeroContent } from "./landing/hero-section"
import { WaitlistCard } from "./landing/waitlist-card"
import { FeaturesSection } from "./landing/features-section"
import { FaqSection } from "./landing/faq-section"
import { QuoteSection, TestimonialSection, CtaSection } from "./landing/cta-section"

export default function Home() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) { router.push("/app") }
  }, [user, isLoading, router])

  return (
    <div className="min-h-screen bg-primary flex flex-col">
      <Header authenticated={!!user} />
      <main className="flex-1 w-full">
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="grid md:grid-cols-[1.1fr_0.9fr] items-center gap-12">
            <HeroContent />
            <WaitlistCard />
          </div>
        </section>
        <QuoteSection />
        <FeaturesSection />
        <TestimonialSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
