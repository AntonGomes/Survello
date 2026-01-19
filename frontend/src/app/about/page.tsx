import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Bot,
  FileText,
  Layers,
  UploadCloud,
  Wand2,
  CheckCircle2,
  ArrowRight,
  MessageSquareText,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <Header />

      <main className="flex-1 w-full">
        {/* Hero Section */}
        <section className="w-full py-20 px-6 bg-white border-b border-border">
          <div className="max-w-5xl mx-auto space-y-6 text-center">
            <Badge variant="outline" className="mx-auto w-fit border-chart-1 text-chart-1 bg-chart-1/5">
              About SiteNotes
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight">
              Surveying, <span className="text-chart-1">Simplified.</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              SiteNotes empowers surveyors to turn site visits into signed schedules in minutes, not hours. 
              We combine industry expertise with cutting-edge AI to automate the heavy lifting of report writing.
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-6 max-w-6xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl font-bold text-foreground">Built for the Modern Surveyor</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Everything you need to streamline your workflow and deliver higher quality reports faster.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-t-4 border-t-chart-1 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-chart-1/10 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-chart-1" />
                </div>
                <CardTitle className="text-xl">Automated Reporting</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Instantly convert raw site notes, photos, and dictations into professional, formatted schedules of condition and dilapidations.
                </p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-chart-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-chart-2/10 flex items-center justify-center mb-4">
                  <Bot className="h-6 w-6 text-chart-2" />
                </div>
                <CardTitle className="text-xl">AI Assistant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Our context-aware AI understands building pathology. Chat with your documents to refine clauses, expand descriptions, or check for consistency.
                </p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-chart-3 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-chart-3/10 flex items-center justify-center mb-4">
                  <Layers className="h-6 w-6 text-chart-3" />
                </div>
                <CardTitle className="text-xl">Job Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Keep track of all your instructions in one place. Monitor status from site visit to final sign-off with our intuitive dashboard.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-6 bg-white border-y border-border">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <Badge variant="secondary" className="mb-4">Workflow</Badge>
              <h2 className="text-3xl font-bold text-foreground">How It Works</h2>
            </div>

            <div className="relative">
              {/* Connecting Line (Desktop) */}
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />

              <div className="grid md:grid-cols-4 gap-8 relative z-10">
                {[
                  {
                    step: "01",
                    title: "Upload",
                    desc: "Upload your site notes and photos securely.",
                    icon: <UploadCloud className="h-6 w-6 text-white" />,
                    color: "bg-chart-1",
                  },
                  {
                    step: "02",
                    title: "Generate",
                    desc: "AI processes data into a structured draft.",
                    icon: <Wand2 className="h-6 w-6 text-white" />,
                    color: "bg-chart-2",
                  },
                  {
                    step: "03",
                    title: "Refine",
                    desc: "Chat with the doc to tweak details.",
                    icon: <MessageSquareText className="h-6 w-6 text-white" />,
                    color: "bg-chart-3",
                  },
                  {
                    step: "04",
                    title: "Deliver",
                    desc: "Download the signed, professional PDF.",
                    icon: <CheckCircle2 className="h-6 w-6 text-white" />,
                    color: "bg-chart-4",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex flex-col items-center text-center group">
                    <div className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center shadow-lg mb-6 transform group-hover:scale-110 transition-transform duration-300`}>
                      {item.icon}
                    </div>
                    <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                      <span className="text-slate-300 font-mono text-sm">{item.step}</span>
                      {item.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-chart-1 to-blue-600 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to modernize your surveying practice?</h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Join forward-thinking surveyors who are saving hours on every job with SiteNotes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/login?screen_hint=signup"
                className={cn(
                  buttonVariants({ size: "lg", variant: "secondary" }),
                  "text-chart-1 font-semibold"
                )}
              >
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "bg-transparent border-white text-white hover:bg-white/10"
                )}
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
