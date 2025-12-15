import { FeatureHeader } from "@/components/feature-header";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart2 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <FeatureHeader 
        title="Analytics" 
        description="Insights into your document generation usage and performance."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="opacity-50">
            <CardContent className="h-32 flex items-center justify-center">
              <div className="h-2 w-24 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="opacity-50">
        <CardContent className="h-[300px] flex items-center justify-center">
          <BarChart2 className="h-16 w-16 opacity-10" />
        </CardContent>
      </Card>
    </div>
  );
}
