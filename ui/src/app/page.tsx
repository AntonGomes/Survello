import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import { Header } from "@/components/header";
import { HowItWorks } from "@/components/how-it-works";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth0 } from "@/lib/auth0";

export default async function Home() {
  const session = await auth0.getSession();

  if (session?.user) {
    redirect("/app");
  }

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-12 flex-1 w-full space-y-16">
        <section className="grid md:grid-cols-[1.1fr_0.9fr] items-center gap-10">
          <div className="space-y-6">
            <Badge variant="secondary" className="gap-2 w-fit">
              <Sparkles className="h-4 w-4 text-primary" />
              Smarter document generation for teams
            </Badge>
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight">
                Ship polished documents without starting from scratch.
              </h1>
              <p className="text-lg text-slate-700 max-w-2xl">
                DocGen takes your templates, context files, and brand voice to
                deliver ready-to-send proposals, reports, and briefs in minutes.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                variant="accent"
                asChild
              >
                <a href="/auth/login?screen_hint=signup">
                  Start free trial
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button size="lg" variant="tertiary" asChild>
                <a href="/auth/login">Log in</a>
              </Button>
              <Button size="lg" variant="ghost" asChild>
                <Link href="/pricing">
                  See pricing
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-slate-600">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                No credit card required
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                SOC2-ready infrastructure
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                Live collaboration coming soon
              </span>
            </div>
          </div>

          <Card className="shadow-xl border-border">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <FileText className="h-5 w-5 text-primary" />
                Generate a document
              </CardTitle>
              <CardDescription>
                Upload your template and add optional context to see DocGen in
                action.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-chart-3 text-[#0f172a] border border-border p-4 text-sm">
                <p className="font-semibold">Try it now</p>
                <p className="text-[#1f2937]">
                  Sign up to unlock the builder and download results directly in
                  your workspace.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-xl border bg-white p-4 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <ShieldCheck className="h-4 w-4 text-accent" />
                    Secure by design
                  </div>
                  <p className="text-slate-600">
                    Your uploads stay private with encrypted storage and scoped
                    access.
                  </p>
                </div>
                <div className="rounded-xl border bg-white p-4 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <Clock3 className="h-4 w-4 text-primary" />
                    Fast turnaround
                  </div>
                  <p className="text-slate-600">
                    Docs are generated in seconds with streaming status updates.
                  </p>
                </div>
              </div>
              <div className="rounded-xl border bg-chart-3 text-[#0f172a] p-5 space-y-3 shadow-sm">
                <div className="flex items-center gap-2 text-sm uppercase tracking-[0.08em] text-[#334155]">
                  <Users className="h-4 w-4" />
                  For modern GTM teams
                </div>
                <p className="text-lg font-semibold leading-snug">
                  Operations, sales, and marketing teams collaborate on one
                  source of truth for outbound.
                </p>
                <p className="text-sm text-white/80">
                  Roles, approvals, and content locking keep everything on
                  brand.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6" id="features">
          <div className="space-y-2">
            <Badge variant="outline">Why teams choose DocGen</Badge>
            <h2 className="text-3xl font-bold text-foreground">
              Built for reliable, on-brand documents.
            </h2>
            <p className="text-slate-700 max-w-3xl">
              Automate proposal packages, research summaries, onboarding decks,
              and any other repeatable workflow with approvals baked in.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Template-aware",
                description:
                  "Bring your own templates and let DocGen fill in the details with contextual data.",
                icon: <FileText className="h-5 w-5 text-primary" />,
              },
              {
                title: "Governed access",
                description:
                  "Granular permissions keep sensitive work limited to the right teams.",
                icon: <ShieldCheck className="h-5 w-5 text-accent" />,
              },
              {
                title: "Human-in-the-loop",
                description:
                  "Track every generation with streaming updates, versioning, and review checkpoints.",
                icon: <Clock3 className="h-5 w-5 text-primary" />,
              },
            ].map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {feature.icon}
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <HowItWorks />

        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold text-slate-900">
              Ready to see DocGen with your templates?
            </h3>
            <p className="text-slate-700">
              Start a free trial or chat with us for enterprise needs.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild>
              <a
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                href="/auth/login?screen_hint=signup"
              >
                Create account
              </a>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contact">
                Talk to us
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
