import { FeatureHeader } from "@/components/feature-header";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <FeatureHeader 
        title="AI Chat" 
        description="Interact with your documents and generated content using our AI assistant."
      />

      <Card className="h-[400px]">
        <CardContent className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
          <MessageSquare className="h-16 w-16 mb-4 opacity-20" />
          <h3 className="text-lg font-medium text-foreground">Chat is offline</h3>
          <p>The conversational interface is currently under development.</p>
        </CardContent>
      </Card>
    </div>
  );
}
