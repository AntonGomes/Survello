import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronRight, FileText, User } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { type JobRead } from "@/client/types.gen";

interface JobCardProps {
  job: JobRead;
}

export function JobCard({ job }: JobCardProps) {
  // Map status to brand colors defined in globals.css
  const getStatusColor = (status: string | null | undefined) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "completed": return "bg-chart-2 text-white hover:bg-chart-2/90"; // Green-ish
      case "processing": return "bg-chart-1 text-white hover:bg-chart-1/90"; // Primary brand
      case "failed": return "bg-destructive text-destructive-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <Link href={`/app/jobs/${job.id}`} className="block group">
      <Card className="transition-all duration-200 hover:shadow-md hover:border-primary/50">
        <CardContent className="flex items-center p-4 sm:p-6 gap-4">
          {/* Icon / Thumbnail Area */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <FileText className="h-6 w-6" />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0 grid gap-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate text-lg">{job.name}</h3>
              <Badge variant="secondary" className={`capitalize ${getStatusColor(job.status)}`}>
                {job.status || "Unknown"}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                <span>Client #{job.client_id}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {job.created_at 
                    ? formatDistanceToNow(new Date(job.created_at), { addSuffix: true })
                    : "Unknown date"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Area */}
          <div className="hidden sm:flex items-center">
            <Button variant="ghost" size="icon" className="text-muted-foreground group-hover:text-primary">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
