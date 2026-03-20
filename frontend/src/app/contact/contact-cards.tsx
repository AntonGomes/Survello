import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function ContactFormCard() {
  return (
    <Card className="border-border shadow-md">
      <CardHeader>
        <CardTitle>Send us a note</CardTitle>
        <CardDescription>We typically respond within one business day.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800">Name</label>
          <Input placeholder="Your name" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800">Work email</label>
          <Input type="email" placeholder="you@company.com" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-800">What can we help with?</label>
          <Textarea rows={4} placeholder="Tell us about your team, volume, and timeline." />
        </div>
        <a href="mailto:hello@docgen" className={cn(buttonVariants({ variant: "accent" }))}>Email the team</a>
      </CardContent>
    </Card>
  );
}

export function ContactInfoCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Other ways to reach us</CardTitle>
        <CardDescription>Prefer a call? We&apos;ll make it easy to connect.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg border bg-white p-4">
          <Mail className="h-5 w-5 text-primary" />
          <div className="space-y-1">
            <div className="font-semibold text-slate-900">Email</div>
            <a className="text-slate-700 hover:text-slate-900" href="mailto:hello@docgen">hello@docgen</a>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border bg-white p-4">
          <Phone className="h-5 w-5 text-primary" />
          <div className="space-y-1">
            <div className="font-semibold text-slate-900">Schedule</div>
            <p className="text-slate-700">Book a 20-minute walkthrough.</p>
          </div>
          <a href="/auth/login?screen_hint=signup" className={cn(buttonVariants({ size: "sm", variant: "accent" }), "ml-auto")}>Get started</a>
        </div>
        <div className="rounded-xl border bg-chart-3 text-[#0f172a] p-5 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-sm uppercase tracking-[0.08em] text-[#334155]">
            <Sparkles className="h-4 w-4" />Customer success
          </div>
          <p className="text-lg font-semibold leading-snug">We&apos;ll build a rollout plan tailored to your document volume and review needs.</p>
          <a href="/auth/login?screen_hint=signup" className={cn(buttonVariants({ variant: "tertiary" }))}>Start free trial</a>
        </div>
      </CardContent>
    </Card>
  );
}
