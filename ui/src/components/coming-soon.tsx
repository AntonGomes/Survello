import { Construction } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ComingSoonProps {
  title: string;
  description?: string;
}

export function ComingSoon({ title, description = "This feature is currently under development and will be available in a future update." }: ComingSoonProps) {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center">
            <Construction className="h-10 w-10 text-muted-foreground" />
          </div>
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">{title}</h2>
        <p className="text-muted-foreground mb-6">
          {description}
        </p>
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20">
          Coming Soon
        </div>
      </div>
    </div>
  );
}
