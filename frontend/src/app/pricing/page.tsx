import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { EarlyAdopterCard, ComingSoonCard } from "./pricing-cards";

const professionalFeatures = ["500 Documents per month", "10 Team Members", "Priority Support", "Custom Templates"];
const enterpriseFeatures = ["Unlimited Documents", "Unlimited Users", "Dedicated Account Manager", "SSO & Advanced Security"];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <Header />
      <main className="flex-1 w-full">
        <div className="container mx-auto py-24 px-4">
          <div className="text-center mb-16 space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-foreground">Simple, Transparent Pricing</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We are currently in <b>Alpha</b>. Join our program today to start generating documents for free.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <EarlyAdopterCard />
            <ComingSoonCard title="Professional" description="For growing teams needing more power." price="$49" features={professionalFeatures} />
            <ComingSoonCard title="Enterprise" description="For large organisations with specific needs." price="Custom" features={enterpriseFeatures} />
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
