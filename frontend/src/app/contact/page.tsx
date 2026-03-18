import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { ContactFormCard, ContactInfoCard } from "./contact-cards";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-12 flex-1 w-full space-y-10">
        <div className="space-y-3">
          <Badge variant="outline" className="w-fit">Contact</Badge>
          <h1 className="text-4xl font-bold text-foreground">Let&apos;s talk about your document workflows.</h1>
          <p className="text-lg text-slate-700 max-w-3xl">Whether you&apos;re exploring DocGen or need a custom rollout plan, our team is here to help.</p>
        </div>
        <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-6">
          <ContactFormCard />
          <ContactInfoCard />
        </div>
      </main>
      <Footer />
    </div>
  );
}
