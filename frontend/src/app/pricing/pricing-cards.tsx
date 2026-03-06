import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

function FeatureItem({ children, highlighted }: { children: React.ReactNode; highlighted?: boolean }) {
  return (
    <li className={cn("flex items-center gap-2", highlighted && "font-medium text-foreground")}>
      <Check className="h-5 w-5 text-chart-1 shrink-0" />
      <span>{children}</span>
    </li>
  );
}

export function EarlyAdopterCard() {
  return (
    <Card className="relative border-2 border-chart-1 shadow-2xl scale-105 z-10 flex flex-col bg-card">
      <div className="absolute -top-4 left-0 right-0 flex justify-center">
        <Badge className="bg-chart-1 hover:bg-chart-1/90 text-white px-4 py-1 text-sm uppercase tracking-wide">Alpha Access</Badge>
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
          <FeatureItem>50 Documents per month</FeatureItem>
          <FeatureItem>3 Team Members</FeatureItem>
          <FeatureItem>Standard Support</FeatureItem>
          <FeatureItem highlighted>No Credit Card Required</FeatureItem>
        </ul>
      </CardContent>
      <CardFooter>
        <Link href="mailto:hello@docgen.com?subject=Request%20Alpha%20Access" className={cn(buttonVariants({ size: "lg" }), "w-full bg-chart-1 hover:bg-chart-1/90 text-white font-semibold")}>
          Request Access
        </Link>
      </CardFooter>
    </Card>
  );
}

export function ComingSoonCard({ title, description, price, features }: {
  title: string; description: string; price: string; features: string[]
}) {
  return (
    <Card className="relative border-border/50 bg-muted/10 opacity-60 grayscale flex flex-col">
      <div className="absolute -top-3 right-4">
        <Badge variant="outline" className="bg-background">Coming Soon</Badge>
      </div>
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="mb-6"><span className="text-4xl font-bold">{price}</span>{price !== "Custom" && <span className="text-muted-foreground">/month</span>}</div>
        <ul className="space-y-3 text-muted-foreground">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2"><Check className="h-5 w-5" /><span>{f}</span></li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button disabled variant="outline" className="w-full">Planned for V1.0</Button>
      </CardFooter>
    </Card>
  );
}
