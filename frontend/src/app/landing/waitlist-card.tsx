"use client"

import { useState } from "react"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { useMutation } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { joinWaitlistMutation } from "@/client/@tanstack/react-query.gen"

function SuccessState() {
  return (
    <div className="text-center py-8 space-y-4">
      <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle2 className="h-8 w-8 text-accent" />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">You&apos;re on the list!</h3>
        <p className="text-blue-200 text-sm">We&apos;ll be in touch soon with early access details.</p>
      </div>
    </div>
  )
}

export function WaitlistCard() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [company, setCompany] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const { mutate: joinWaitlist, isPending } = useMutation({
    ...joinWaitlistMutation(),
    onSuccess: () => { setSubmitted(true); setError("") },
    onError: (err) => {
      const msg = err && typeof err === "object" && "detail" in err ? String((err as { detail?: unknown }).detail) : "Something went wrong. Please try again."
      setError(msg)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    joinWaitlist({ body: { email, name: name || undefined, company: company || undefined } })
  }

  return (
    <Card className="shadow-xl bg-primary border-secondary backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">Join the Waitlist</CardTitle>
        <CardDescription className="text-blue-200">Be among the first to experience AI-powered surveying.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {submitted ? <SuccessState /> : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-sm text-red-300 bg-red-500/20 p-3 rounded-md">{error}</div>}
            <WaitlistField id="email" label="Work Email" required value={email} onChange={setEmail} type="email" placeholder="you@company.com" />
            <WaitlistField id="name" label="Name" value={name} onChange={setName} placeholder="Your name" />
            <WaitlistField id="company" label="Company" value={company} onChange={setCompany} placeholder="Your organisation" />
            <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground" disabled={isPending}>
              {isPending ? "Joining..." : "Request Early Access"}<ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <p className="text-xs text-blue-200 text-center">We respect your privacy. No spam, ever.</p>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

function WaitlistField({ id, label, required, value, onChange, type, placeholder }: {
  id: string; label: string; required?: boolean; value: string; onChange: (v: string) => void; type?: string; placeholder: string
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-white" htmlFor={id}>
        {label} {required && <span className="text-red-300">*</span>}
      </label>
      <Input id={id} type={type || "text"} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} required={required}
        className="bg-white/10 border-white/20 text-white placeholder:text-blue-200/60" />
    </div>
  )
}
