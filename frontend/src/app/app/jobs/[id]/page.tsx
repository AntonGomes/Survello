import { FeatureHeader } from "@/components/feature-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/app/jobs">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <FeatureHeader 
          title={`Job #${id}`} 
          description="Job details and generated artifacts."
        />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
          <h3 className="font-semibold mb-4">Configuration</h3>
          <p className="text-muted-foreground">Details coming soon...</p>
        </div>
        <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
          <h3 className="font-semibold mb-4">Output</h3>
          <p className="text-muted-foreground">Document viewer coming soon...</p>
        </div>
      </div>
    </div>
  );
}
