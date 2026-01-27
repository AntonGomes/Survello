"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  FileText,
  Sparkles,
  TrendingUp,
  Quote,
} from "lucide-react";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { joinWaitlistMutation } from "@/client/@tanstack/react-query.gen";

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const { mutate: joinWaitlist, isPending } = useMutation({
    ...joinWaitlistMutation(),
    onSuccess: () => {
      setSubmitted(true);
      setError("");
    },
    onError: (err) => {
      const errorMessage = err && typeof err === 'object' && 'detail' in err 
        ? String((err as { detail?: unknown }).detail)
        : "Something went wrong. Please try again.";
      setError(errorMessage);
    },
  });

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/app");
    }
  }, [user, isLoading, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    joinWaitlist({
      body: {
        email,
        name: name || undefined,
        company: company || undefined,
      },
    });
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col">
      <Header authenticated={!!user} />

      <main className="flex-1 w-full">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="grid md:grid-cols-[1.1fr_0.9fr] items-center gap-12">
            <div className="space-y-8">
              <div className="space-y-5">
                <Badge
                  variant="outline"
                  className="border-secondary text-secondary bg-secondary/10"
                >
                  Early Access
                </Badge>
                <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
                  Property surveying,{" "}
                  <span className="relative">
                    <span className="text-secondary">reimagined</span>
                  </span>{" "}
                  for efficiency.
                </h1>
                <p className="text-lg text-blue-100 max-w-xl leading-relaxed">
                  From site notes to signed schedules in minutes, not hours.{" "}
                  <span className="font-tiempos italic font-medium">
                    Survello
                  </span>{" "}
                  combines powerful AI document generation with intelligent job
                  tracking—built with purpose, designed for surveyors.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/10 rounded-lg p-4 border-t-2 border-accent">
                  <div className="text-2xl font-bold text-secondary">
                    20-80%
                  </div>
                  <div className="text-xs text-blue-200">
                    Reduction in document production time
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-4 border-t-2 border-accent">
                  <div className="text-2xl font-bold text-secondary">122</div>
                  <div className="text-xs text-blue-200">
                    Hours saved per year with AI tools
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-4 border-t-2 border-accent">
                  <div className="text-2xl font-bold text-secondary">14.8%</div>
                  <div className="text-xs text-blue-200">
                    Revenue growth for innovative SMEs
                  </div>
                </div>
              </div>
            </div>

            {/* Waitlist Form Card */}
            <Card className="shadow-xl bg-primary border-secondary backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  Join the Waitlist
                </CardTitle>
                <CardDescription className="text-blue-200">
                  Be among the first to experience AI-powered surveying.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {submitted ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="h-8 w-8 text-accent" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-white">
                        You&apos;re on the list!
                      </h3>
                      <p className="text-blue-200 text-sm">
                        We&apos;ll be in touch soon with early access details.
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className="text-sm text-red-300 bg-red-500/20 p-3 rounded-md">
                        {error}
                      </div>
                    )}
                    <div className="space-y-2">
                      <label
                        className="text-sm font-medium text-white"
                        htmlFor="email"
                      >
                        Work Email <span className="text-red-300">*</span>
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-white/10 border-white/20 text-white placeholder:text-blue-200/60"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        className="text-sm font-medium text-white"
                        htmlFor="name"
                      >
                        Name
                      </label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-blue-200/60"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        className="text-sm font-medium text-white"
                        htmlFor="company"
                      >
                        Company
                      </label>
                      <Input
                        id="company"
                        type="text"
                        placeholder="Your organisation"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-blue-200/60"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                      disabled={isPending}
                    >
                      {isPending ? "Joining..." : "Request Early Access"}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                    <p className="text-xs text-blue-200 text-center">
                      We respect your privacy. No spam, ever.
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Quote Section */}
        <section className="bg-white/5 border-y border-white/10 py-12">
          <div className="max-w-4xl mx-auto px-6">
            <blockquote className="text-center">
              <Quote className="h-8 w-8 text-secondary mx-auto mb-4" />
              <p className="text-xl md:text-2xl text-white font-medium italic leading-relaxed">
                &ldquo;Drafting structured reports and forms with AI can cut final
                document production times by 20-80% in professional services.&rdquo;
              </p>
              <footer className="mt-4 text-blue-200 text-sm">
                — UK Government AI Opportunities Action Plan
              </footer>
            </blockquote>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white py-20 px-6" id="features">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <Badge
                variant="outline"
                className="border-accent text-accent mx-auto"
              >
                Why Survello?
              </Badge>
              <h2 className="text-3xl font-bold text-foreground tracking-tight">
                Built for the realities of surveying.
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed">
                Stop wrestling with Word documents and scattered emails. Survello
                brings your technical reporting and job management into one
                intelligent workspace.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Automated Schedules",
                  description:
                    "Upload site photos and rough notes. Survello formats them into your templates, no need to compromise on your branding and style.",
                  icon: <FileText className="h-5 w-5 text-accent" />,
                },
                {
                  title: "Time Reclaimed",
                  description:
                    "SME workers using AI tools save an average of 122 hours per year. That's three extra weeks to focus on billable work.",
                  icon: <Clock className="h-5 w-5 text-accent" />,
                },
                {
                  title: "Competitive Edge",
                  description:
                    "Innovative SMEs are seeing 14.8% revenue growth. Don't let competitors beat you to the next contract.",
                  icon: <TrendingUp className="h-5 w-5 text-accent" />,
                },
                {
                  title: "Commercial Operations",
                  description:
                    "Track billable hours per job, generate invoices, and visualise portfolio performance with built-in analytics.",
                  icon: <BarChart3 className="h-5 w-5 text-accent" />,
                },
              ].map((feature) => (
                <Card
                  key={feature.title}
                  className="border-border/60 shadow-sm hover:shadow-md transition-shadow border-t-2 border-t-accent"
                >
                  <CardHeader>
                    <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription className="leading-relaxed mt-2">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Quote Banner */}
        <section className="bg-primary py-12 px-6 border-y-4 border-accent">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg md:text-xl text-white italic leading-relaxed">
              &ldquo;I thought it was something really complicated... But I learned
              that it&apos;s actually quite simple. If I can use it, anyone can.&rdquo;
            </p>
            <p className="text-blue-200 text-sm mt-3">— SME Owner, UK</p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-secondary py-20 px-6" id="faq">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12 space-y-4">
              <Badge
                variant="outline"
                className="border-primary text-primary mx-auto"
              >
                FAQs
              </Badge>
              <h2 className="text-3xl font-bold text-foreground tracking-tight">
                Why not just use spreadsheets?
              </h2>
            </div>

            <Accordion type="single" collapsible className="space-y-2">
              <AccordionItem
                value="item-1"
                className="bg-white rounded-lg px-6 border-l-4 border-l-accent"
              >
                <AccordionTrigger className="text-left font-semibold text-primary hover:no-underline">
                  Can&apos;t I just continue using Excel and Word?
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 leading-relaxed">
                  You can, but you&apos;re leaving significant time savings on the
                  table. The UK Government&apos;s AI Action Plan notes that AI-assisted
                  document generation can reduce production times by 20-80%.
                  That&apos;s not marginal—it&apos;s transformative. Spreadsheets work, but
                  Survello works so much better.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-2"
                className="bg-white rounded-lg px-6 border-l-4 border-l-accent"
              >
                <AccordionTrigger className="text-left font-semibold text-primary hover:no-underline">
                  Is AI really ready for professional surveying?
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 leading-relaxed">
                  Yes. 59% of SMEs already use AI for writing and summarising
                  documents—the exact tasks Survello automates. We&apos;re not
                  replacing your expertise; we&apos;re eliminating the repetitive
                  formatting and typing that keeps you from doing what you do
                  best.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-3"
                className="bg-white rounded-lg px-6 border-l-4 border-l-accent"
              >
                <AccordionTrigger className="text-left font-semibold text-primary hover:no-underline">
                  What if my competitors adopt this first?
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 leading-relaxed">
                  Research shows innovative SMEs record 14.8% revenue growth
                  compared to their peers. As one business owner put it: &ldquo;You can
                  stick your head in the sand and you&apos;ll just get overtaken by
                  those who are embracing the technology.&rdquo; The gap between
                  adopters and non-adopters is widening fast.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-4"
                className="bg-white rounded-lg px-6 border-l-4 border-l-accent"
              >
                <AccordionTrigger className="text-left font-semibold text-primary hover:no-underline">
                  How much time will I actually save?
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 leading-relaxed">
                  SME workers using AI estimate they save 122 hours per year—that&apos;s
                  roughly 2.5 hours per week. For admin-heavy roles like surveying
                  with significant report writing, savings can be even higher.
                  Think of it as getting three extra weeks of work per year to
                  focus on billable site visits rather than admin.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-5"
                className="bg-white rounded-lg px-6 border-l-4 border-l-accent"
              >
                <AccordionTrigger className="text-left font-semibold text-primary hover:no-underline">
                  Is this built for large enterprises only?
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 leading-relaxed">
                  Quite the opposite. The SME Digital Adoption Taskforce notes
                  that many digital products &ldquo;feel built for larger enterprises.&rdquo;
                  Survello is purpose-built for small and medium surveying
                  practices. No complex implementation, no enterprise pricing, no
                  unnecessary features—just the tools you actually need.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="item-6"
                className="bg-white rounded-lg px-6 border-l-4 border-l-accent"
              >
                <AccordionTrigger className="text-left font-semibold text-primary hover:no-underline">
                  What about data security and client confidentiality?
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 leading-relaxed">
                  We take security seriously. Your data is encrypted in transit
                  and at rest, and we never use your client information to train
                  our models. We&apos;re building towards SOC2 compliance because we
                  understand that surveyors handle sensitive property and client
                  data.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Ready to modernise your practice?
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Join forward-thinking surveyors who are reclaiming their time and
                growing their businesses with Survello.
              </p>
            </div>
            <div className="bg-accent/10 border border-accent/30 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-primary font-medium mb-4">
                Request early access above, or if you already have an invitation:
              </p>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-accent text-white hover:bg-accent/70  "
                )}
              >
                Sign in to your account
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
