import { FeatureHeader } from "@/components/feature-header";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase } from "lucide-react";

export default function JobsPage() {
  return (
    <div className="space-y-6">
      <FeatureHeader 
        title="Jobs History" 
        description="Track the status and history of your document generation jobs."
      />
      
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <Briefcase className="h-16 w-16 mb-4 opacity-20" />
          <h3 className="text-lg font-medium text-foreground">No jobs found</h3>
          <p>Your job history will appear here once the feature is live.</p>
        </CardContent>
      </Card>
    </div>
  );
}
