import { FeatureHeader } from "@/components/feature-header";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <FeatureHeader 
        title="Templates" 
        description="Manage and customize the templates used for document generation."
      />

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
          <FileText className="h-16 w-16 mb-4 opacity-20" />
          <h3 className="text-lg font-medium text-foreground">No templates available</h3>
          <p>Standard and custom templates will be listed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
