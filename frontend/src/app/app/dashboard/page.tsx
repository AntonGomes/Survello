import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, History, ArrowRight } from "lucide-react";
import Link from "next/link";
import { FeatureHeader } from "@/components/feature-header";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <FeatureHeader 
        title="Dashboard" 
        subtitle="Welcome to SiteNotes. Manage your document generation tasks."
        badge={null}
      />

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-chart-2/10 to-transparent border-chart-2/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-chart-2" />
              New Document
            </CardTitle>
            <CardDescription>
              Start a new document generation job
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/app/generate">
              <Button className="w-full bg-chart-2 hover:bg-chart-2/90 text-white">
                Generate Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-muted-foreground" />
              Recent Jobs
            </CardTitle>
            <CardDescription>
              View your generation history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/app/jobs">
              <Button variant="outline" className="w-full">
                View All Jobs
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              Templates
            </CardTitle>
            <CardDescription>
              Manage your document templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/app/templates">
              <Button variant="outline" className="w-full">
                Browse Templates
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Empty State for Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest document generation tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <History className="h-12 w-12 mb-4 opacity-20" />
            <p>No recent activity found.</p>
            <p className="text-sm">Generate a document to see it appear here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
