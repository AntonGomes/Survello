import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles, Target, Users } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-12 flex-1 w-full space-y-10">
        <div className="space-y-4">
          <Badge variant="outline" className="w-fit">
            About DocGen
          </Badge>
          <h1 className="text-4xl font-bold text-foreground">
            We help teams move faster with documents that stay on-brand.
          </h1>
          <p className="text-lg text-slate-700 max-w-3xl">
            DocGen blends your templates, brand language, and context to create
            documents your customers trust. No more reinventing the wheel for
            every proposal, report, or briefing.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              title: "Built for teams",
              description:
                "Sales, marketing, and operations collaborate with roles and approvals baked in.",
              icon: <Users className="h-5 w-5 text-primary" />,
            },
            {
              title: "Quality without effort",
              description:
                "Template-aware generation keeps formatting, tone, and data consistent.",
              icon: <Sparkles className="h-5 w-5 text-primary" />,
            },
            {
              title: "Outcome-focused",
              description:
                "We measure success by the time you save and the deals you close, not just page views.",
              icon: <Target className="h-5 w-5 text-green-600" />,
            },
          ].map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  {item.icon}
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </div>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card className="border-border shadow-md">
          <CardHeader className="border-b">
            <CardTitle className="text-2xl text-foreground">
              Our promise
            </CardTitle>
            <CardDescription>
              Security-first, customer-obsessed, and relentlessly focused on
              reliable outputs.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6 pt-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-900">Security</h3>
              <p className="text-slate-700">
                Your data stays yours. We use encrypted storage, least-privilege
                access, and auditability across the stack.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-slate-900">Partnership</h3>
              <p className="text-slate-700">
                We co-design playbooks with customers so DocGen fits your
                workflows, not the other way around.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="rounded-2xl border bg-white p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-xl font-semibold text-slate-900">
              Want to learn more?
            </h3>
            <p className="text-slate-700">
              Talk with us about rollout, security reviews, and success plans.
            </p>
          </div>
          <Button variant="accent" asChild>
            <a href="/auth/login?screen_hint=signup">Start free trial</a>
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
