import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <Header />

      <main className="flex-1 w-full">
        <div className="container mx-auto py-24 px-4">
          <div className="text-center mb-16 space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-foreground">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We are currently in <b>Alpha</b>. Join our program today to start generating documents for free.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Alpha Plan - Active */}
            <Card className="relative border-2 border-chart-1 shadow-2xl scale-105 z-10 flex flex-col bg-card">
              <div className="absolute -top-4 left-0 right-0 flex justify-center">
                <Badge className="bg-chart-1 hover:bg-chart-1/90 text-white px-4 py-1 text-sm uppercase tracking-wide">
                  Alpha Access
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Early Adopter</CardTitle>
                <CardDescription>Full access to current features for feedback.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-6">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-chart-1 shrink-0" />
                    <span>50 Documents per month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-chart-1 shrink-0" />
                    <span>3 Team Members</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-chart-1 shrink-0" />
                    <span>Standard Support</span>
                  </li>
                  <li className="flex items-center gap-2 font-medium text-foreground">
                    <Check className="h-5 w-5 text-chart-1 shrink-0" />
                    <span>No Credit Card Required</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Link
                  href="mailto:hello@docgen.com?subject=Request%20Alpha%20Access"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "w-full bg-chart-1 hover:bg-chart-1/90 text-white font-semibold"
                  )}
                >
                  Request Access
                </Link>
              </CardFooter>
            </Card>

            {/* Pro Plan - Future */}
            <Card className="relative border-border/50 bg-muted/10 opacity-60 grayscale flex flex-col">
               <div className="absolute -top-3 right-4">
                <Badge variant="outline" className="bg-background">Coming Soon</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Professional</CardTitle>
                <CardDescription>For growing teams needing more power.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-6">
                  <span className="text-4xl font-bold">$49</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5" />
                    <span>500 Documents per month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5" />
                    <span>10 Team Members</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5" />
                    <span>Priority Support</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5" />
                    <span>Custom Templates</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button disabled variant="outline" className="w-full">
                  Planned for V1.0
                </Button>
              </CardFooter>
            </Card>

            {/* Enterprise Plan - Future */}
            <Card className="relative border-border/50 bg-muted/10 opacity-60 grayscale flex flex-col">
               <div className="absolute -top-3 right-4">
                <Badge variant="outline" className="bg-background">Coming Soon</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <CardDescription>For large organisations with specific needs.</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-6">
                  <span className="text-4xl font-bold">Custom</span>
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5" />
                    <span>Unlimited Documents</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5" />
                    <span>Unlimited Users</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5" />
                    <span>Dedicated Account Manager</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5" />
                    <span>SSO & Advanced Security</span>
                  </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button disabled variant="outline" className="w-full">
                  Planned for V1.0
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="mt-16 text-center border-t pt-8 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold mb-2">Why is this free?</h3>
            <p className="text-muted-foreground">
              We are currently refining our AI models and user experience. In exchange for free access, we may ask for occasional feedback to help us build the best document generation tool for you.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
