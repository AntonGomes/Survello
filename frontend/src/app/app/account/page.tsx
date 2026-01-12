import { FeatureHeader } from "@/components/feature-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";

export default function AccountPage() {
  return (
    <div className="h-full flex flex-col max-w-4xl">
      <FeatureHeader 
        title="Account" 
        description="Manage your profile, subscription plan, and billing information."
      />

      <div className="space-y-6 opacity-50 pointer-events-none">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <User className="h-8 w-8 text-muted-foreground" />
              </div>
              <Button variant="outline" size="sm" disabled>Change Avatar</Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium">First Name</label>
                <Input disabled />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Last Name</label>
                <Input disabled />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <label className="text-sm font-medium">Email</label>
                <Input disabled />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
