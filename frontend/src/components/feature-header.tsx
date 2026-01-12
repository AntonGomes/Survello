import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface FeatureHeaderProps {
  title: string;
  description: string;
  badge?: string;
}

export function FeatureHeader({ title, description, badge = "Coming Soon" }: FeatureHeaderProps) {
  return (
    <div className="space-y-6 mb-8">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <Badge variant="secondary" className="text-sm">
          {badge}
        </Badge>
      </div>
      
      <Alert className="bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-200">
        <Info className="h-4 w-4 !text-amber-600 dark:!text-amber-400" />
        <AlertTitle className="text-amber-800 dark:text-amber-300 font-semibold">Under Development</AlertTitle>
        <AlertDescription className="text-amber-700 dark:text-amber-400 mt-1">
          {description} This feature is currently being built and will be available in a future update.
        </AlertDescription>
      </Alert>
    </div>
  );
}
