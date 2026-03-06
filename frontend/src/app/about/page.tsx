import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { HeroSection, ChallengeSection, PhilosophySection, QuoteSection, CapabilitiesSection, ClosingQuoteSection } from "./about-sections";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <Header />
      <main className="flex-1 w-full">
        <HeroSection />
        <ChallengeSection />
        <PhilosophySection />
        <QuoteSection />
        <CapabilitiesSection />
        <ClosingQuoteSection />
      </main>
      <Footer />
    </div>
  );
}
