import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  CheckCircle2,
  FileText,
  Mail,
  MessageSquare,
  PieChart,
  Sparkles,
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
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight">
                Property & Surveying, <br className="hidden sm:block" />
                <span className="text-chart-1">reimagined for efficiency.</span>
              </h1>
              <p className="text-lg text-slate-700 max-w-2xl">
                From site notes to signed schedules in minutes. <b>SiteNotes</b> combines
                powerful document generation with intelligent job tracking.
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
            </div>
          </div>

          {/* features section */}
          <Card className="shadow-xl border-border bg-white/80 backdrop-blur-sm">
            <CardHeader className="border-b pb-4">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Sparkles className="h-5 w-5 text-chart-1" />
                Intelligent Surveying Platform
              </CardTitle>
              <CardDescription>
                The all-in-one platform for surveyors and property managers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              <div className="grid gap-3">
                {/* Active Feature */}
                <div className="flex gap-3 items-start p-3 rounded-lg border border-chart-1/20 bg-chart-1/5">
                  <FileText className="h-5 w-5 text-chart-1 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold leading-none text-foreground">
                        Technical Document Generation
                      </p>
                      <Badge
                        variant="default"
                        className="bg-chart-1 hover:bg-chart-1/90 text-[10px] h-5 px-1.5"
                      >
                        Live
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Instantly generate Schedules of Dilapidations, Condition,
                      and Works from your site notes.
                    </p>
                  </div>
                </div>

                {/* Coming Soon Features */}
                {[
                  {
                    icon: MessageSquare,
                    color: "text-chart-2",
                    title: "Context-Aware AI Chat",
                    desc: "Chat with an LLM that knows every detail of your specific job or portfolio.",
                  },
                  {
                    icon: Briefcase,
                    color: "text-chart-3",
                    title: "Unified Job Tracking",
                    desc: "Centralize files, images, and email threads for complete project context.",
                  },
                  {
                    icon: PieChart,
                    color: "text-chart-4",
                    title: "Operations & Analytics",
                    desc: "Integrated time tracking, billing, and business intelligence dashboards.",
                  },
                ].map((feature) => (
                  <div
                    key={feature.title}
                    className="flex gap-3 items-start p-3 rounded-lg border bg-white/50 opacity-75 grayscale-[0.3]"
                  >
                    <feature.icon
                      className={`h-5 w-5 ${feature.color} shrink-0 mt-0.5`}
                    />
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium leading-none">
                          {feature.title}
                        </p>
                        <Badge
                          variant="outline"
                          className="text-[10px] h-5 px-1.5 text-muted-foreground border-slate-300"
                        >
                          Coming Soon
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-8" id="features">
          <div className="space-y-4">
            <Badge variant="outline" className="border-chart-1 text-chart-1">
              Why SiteNotes?
            </Badge>
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              Built for the realities of the surveying sector.
            </h2>
            <p className="text-slate-600 max-w-3xl text-lg leading-relaxed">
              Stop wrestling with Word documents and scattered emails. SiteNotes
              brings your technical reporting, communication, and job management
              into one intelligent workspace.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Automated Schedules",
                description:
                  "Upload site photos and rough notes. SiteNotes formats them into industry-standard Schedules of Dilapidations or Condition instantly.",
                icon: <FileText className="h-5 w-5 text-chart-1" />,
              },
              {
                title: "AI Site Intelligence",
                description:
                  "Don't just search, ask. 'Show me all roof defects from last week.' Our LLM understands your specific property context.",
                icon: <MessageSquare className="h-5 w-5 text-chart-2" />,
              },
              {
                title: "Unified Context",
                description:
                  "Connect your email client to automatically file communications against specific jobs. Nothing gets lost.",
                icon: <Mail className="h-5 w-5 text-chart-3" />,
              },
              {
                title: "Commercial Ops",
                description:
                  "Track billable hours per job, generate invoices, and visualize portfolio performance with built-in analytics.",
                icon: <BarChart3 className="h-5 w-5 text-chart-4" />,
              },
            ].map((feature) => (
              <Card
                key={feature.title}
                className="border-border/60 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
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
        </section>

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
