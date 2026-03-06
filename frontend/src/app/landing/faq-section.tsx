"use client"

import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqItems = [
  { id: "item-1", question: "Can\u2019t I just continue using Excel and Word?", answer: "You can, but you\u2019re leaving significant time savings on the table. The UK Government\u2019s AI Action Plan notes that AI-assisted document generation can reduce production times by 20-80%. That\u2019s not marginal\u2014it\u2019s transformative. Spreadsheets work, but Survello works so much better." },
  { id: "item-2", question: "Is AI really ready for professional surveying?", answer: "Yes. 59% of SMEs already use AI for writing and summarising documents\u2014the exact tasks Survello automates. We\u2019re not replacing your expertise; we\u2019re eliminating the repetitive formatting and typing that keeps you from doing what you do best." },
  { id: "item-3", question: "What if my competitors adopt this first?", answer: "Research shows innovative SMEs record 14.8% revenue growth compared to their peers. As one business owner put it: \u201cYou can stick your head in the sand and you\u2019ll just get overtaken by those who are embracing the technology.\u201d The gap between adopters and non-adopters is widening fast." },
  { id: "item-4", question: "How much time will I actually save?", answer: "SME workers using AI estimate they save 122 hours per year\u2014that\u2019s roughly 2.5 hours per week. For admin-heavy roles like surveying with significant report writing, savings can be even higher. Think of it as getting three extra weeks of work per year to focus on billable site visits rather than admin." },
  { id: "item-5", question: "Is this built for large enterprises only?", answer: "Quite the opposite. The SME Digital Adoption Taskforce notes that many digital products \u201cfeel built for larger enterprises.\u201d Survello is purpose-built for small and medium surveying practices. No complex implementation, no enterprise pricing, no unnecessary features\u2014just the tools you actually need." },
  { id: "item-6", question: "What about data security and client confidentiality?", answer: "We take security seriously. Your data is encrypted in transit and at rest, and we never use your client information to train our models. We\u2019re building towards SOC2 compliance because we understand that surveyors handle sensitive property and client data." },
]

export function FaqSection() {
  return (
    <section className="bg-secondary py-20 px-6" id="faq">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12 space-y-4">
          <Badge variant="outline" className="border-primary text-primary mx-auto">FAQs</Badge>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">Why not just use spreadsheets?</h2>
        </div>
        <Accordion type="single" collapsible className="space-y-2">
          {faqItems.map((item) => (
            <AccordionItem key={item.id} value={item.id} className="bg-white rounded-lg px-6 border-l-4 border-l-accent">
              <AccordionTrigger className="text-left font-semibold text-primary hover:no-underline">{item.question}</AccordionTrigger>
              <AccordionContent className="text-slate-600 leading-relaxed">{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
