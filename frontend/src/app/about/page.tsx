import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
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
  MessageSquareText,
  Heart,
  Shield,
  Zap,
  Quote,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <Header />

      <main className="flex-1 w-full">
        {/* Hero Section */}
        <section className="w-full py-20 px-6 bg-white ">
          <div className="max-w-5xl mx-auto space-y-6 text-center">
            <Badge variant="outline" className="mx-auto w-fit border-primary text-primary bg-accent/5">
              About Survello
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight">
              Surveying, <span className="text-accent border-b-4 border-secondary">simplified.</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Survello empowers surveyors to turn site visits into signed schedules in minutes, not hours. 
              We combine industry expertise with thoughtful AI to eliminate the tedious parts of desk work, allowing you to focus on what matters.
            </p>
          </div>
        </section>

        {/* The Challenge Section */}
        <section className="py-20 px-6 bg-secondary">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 space-y-4">
              <Badge variant="outline" className="border-primary text-primary">
                The Challenge
              </Badge>
              <h2 className="text-3xl font-bold text-foreground">
                Digital tools often feel built for someone else.
              </h2>
            </div>

            <div className="bg-white rounded-xl p-8 border-l-4 border-accent shadow-sm">
              <blockquote className="space-y-4">
                <p className="text-lg text-slate-700 italic leading-relaxed">
                  &ldquo;Despite the UK&apos;s global leadership in tech and AI, smaller SMEs can face persistent barriers to digital adoption: products often feel built for larger enterprises, switching and adoption costs can be high, many report lack of confidence or expertise to implement new tools, and digital support for SMEs can feel fragmented.&rdquo;
                </p>
                <footer className="text-sm text-muted-foreground font-medium">
                  — Phil Smith CBE, SME Digital Adoption Taskforce
                </footer>
              </blockquote>
            </div>

            <div className="mt-8 text-center">
              <p className="leading-relaxed max-w-3xl mx-auto">
                We built Survello to be different. Simple to adopt, priced fairly, and designed specifically for the surveying profession.</p>
            </div>
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="py-20 px-6 bg-primary">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 space-y-4">
              <Badge variant="outline" className="border-secondary text-secondary">
                Our Philosophy
              </Badge>
              <h2 className="text-3xl font-bold text-white">Built with purpose, not features.</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-white/10 border-white/20 text-white">
                <CardHeader className="pb-7">
                  <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4 border-l-4 border-accent">
                    <Zap className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle className="text-lg text-white">Functional Utility</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-100 text-sm leading-relaxed">
                    No bells and whistles. Every feature exists because it solves a real problem that surveyors face daily. We believe in tools that work, not tools that impress.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20 text-white">
                <CardHeader className="pb-0">
                  <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4 border-l-4 border-accent">
                    <Heart className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle className="text-lg text-white">Built with Surveyors,<br/> for Surveyors</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-100 text-sm leading-relaxed">
                    Technology should serve people, not frustrate them. We design with compassion, understanding that your time is precious and your work is important.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 border-white/20 text-white">
                <CardHeader className="pb-7">
                  <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4 border-l-4 border-accent">
                    <Shield className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle className="text-lg text-white">Serious & Reliable</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-100 text-sm leading-relaxed">
                    Your clients depend on you, and you deserve to depend on your tools. We&apos;re building infrastructure that&apos;s as dependable as your professional standards.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Quote Section */}
        <section className="py-16 px-6 bg-secondary border-y-4 border-accent">
          <div className="max-w-4xl mx-auto">
            <blockquote className="text-center">
              <Quote className="h-8 w-8 text-accent mx-auto mb-4 opacity-60" />
              <p className="text-xl md:text-2xl text-foreground font-medium italic leading-relaxed">
                &ldquo;It won&apos;t do my work for me, but it will help me do my work more effectively.&rdquo;
              </p>
              <footer className="mt-4 text-muted-foreground text-sm">
                — SME Professional on AI tools
              </footer>
            </blockquote>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <Badge variant="outline" className="border-accent text-accent">
                Capabilities
              </Badge>
              <h2 className="text-3xl font-bold text-foreground">Built for the Modern Surveyor</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Everything you need to streamline your workflow and deliver higher quality reports faster.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="border-t-4 border-t-accent shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-xl">Automated Reporting</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">
                    Instantly convert raw site notes, photos, and dictations into professional, formatted schedules of condition and dilapidations.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-accent shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <Bot className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-xl">AI Assistant</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">
                    Our context-aware AI understands building pathology. Chat with your documents to refine clauses, expand descriptions, or check for consistency.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-accent shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <Layers className="h-6 w-6 text-accent" />
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
          </div>
        </section>

               {/* Final Quote */}
        <section className="py-16 px-6 bg-primary border-t-4 border-accent">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-lg md:text-xl text-white italic leading-relaxed">
              &ldquo;Wider use of digital tools such as customer relationship management systems, resource planning software... can have a significant impact for both SMEs and the broader economy.&rdquo;
            </p>
            <p className="text-blue-200 text-sm mt-3 font-medium">
              — Minister for Services, Small Business and Exports
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
