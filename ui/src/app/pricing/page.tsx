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
import { Check, Sparkles } from "lucide-react";

const PLANS = [
  {
    name: "Starter",
    price: "$29",
    cadence: "per month",
    description: "For individual builders and small projects.",
    features: [
      "Up to 5 templates",
      "Basic context uploads",
      "Email support",
      "Download-ready outputs",
    ],
    cta: "Start free trial",
  },
  {
    name: "Growth",
    price: "$89",
    cadence: "per month",
    description: "For small teams with repeatable workflows.",
    features: [
      "Unlimited templates",
      "Role-based access",
      "Streaming status updates",
      "Priority support",
    ],
    highlight: true,
    cta: "Choose Growth",
  },
  {
    name: "Enterprise",
    price: "Let’s talk",
    cadence: "",
    description: "For large teams needing security reviews and SLAs.",
    features: [
      "Custom onboarding",
      "Security & compliance review",
      "Dedicated success manager",
      "On-prem or VPC options",
    ],
    cta: "Contact sales",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-12 flex-1 w-full space-y-10">
        <div className="space-y-3 text-center">
          <Badge variant="outline" className="w-fit mx-auto">
            Pricing
          </Badge>
          <h1 className="text-4xl font-bold text-foreground">
            Choose the plan that fits your team.
          </h1>
          <p className="text-lg text-slate-700 max-w-2xl mx-auto">
            Start with a free trial and upgrade when you’re ready. No credit
            card required.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={plan.highlight ? "border-primary shadow-lg" : ""}
            >
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl text-foreground">
                    {plan.name}
                  </CardTitle>
                  {plan.highlight && (
                    <Badge variant="secondary" className="gap-1">
                      <Sparkles className="h-4 w-4" />
                      Popular
                    </Badge>
                  )}
                </div>
                <CardDescription>{plan.description}</CardDescription>
                <div className="text-3xl font-bold text-slate-900">
                  {plan.price}{" "}
                  <span className="text-base font-medium text-slate-600">
                    {plan.cadence}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3 text-sm text-slate-700">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-accent" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={
                    plan.highlight ? "accent" : plan.name === "Starter" ? "tertiary" : "outline"
                  }
                  asChild
                >
                  <a
                    href={
                      plan.name === "Enterprise"
                        ? "/contact"
                        : "/auth/login?screen_hint=signup"
                    }
                  >
                    {plan.cta}
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
