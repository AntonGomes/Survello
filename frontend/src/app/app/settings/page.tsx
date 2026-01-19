import { FeatureHeader } from "@/components/feature-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SettingsPage() {
  return (
    <div className="h-full flex flex-col max-w-4xl">
      <FeatureHeader 
        title="Settings" 
      />

      <div className="space-y-6 opacity-50 pointer-events-none">
        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>Configure general workspace settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <label htmlFor="workspace-name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Workspace Name</label>
              <Input id="workspace-name" defaultValue="My Workspace" disabled />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
