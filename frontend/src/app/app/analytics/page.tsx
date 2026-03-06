import { FeatureHeader } from "@/components/feature-header";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart2 } from "lucide-react";

const PLACEHOLDER_CARD_COUNT = 3;

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <FeatureHeader 
        title="Analytics" 
      />

      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: PLACEHOLDER_CARD_COUNT }, (_, i) => i + 1).map((i) => (
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
