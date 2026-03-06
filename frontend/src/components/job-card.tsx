import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronRight, FileText, User } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { type JobRead } from "@/client/types.gen";

interface JobCardProps {
  job: JobRead;
}

function getStatusColor(status: string | null | undefined) {
  const s = (status || "").toLowerCase();
  switch (s) {
    case "completed": return "bg-chart-2 text-white hover:bg-chart-2/90";
    case "processing": return "bg-chart-1 text-white hover:bg-chart-1/90";
    case "failed": return "bg-destructive text-destructive-foreground";
    default: return "bg-secondary text-secondary-foreground";
  }
}

function JobCardMeta({ job }: { job: JobRead }) {
  return (
    <div className="flex items-center gap-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-1">
        <User className="h-3.5 w-3.5" />
        <span className="truncate">{job.client?.name ?? "Unknown"}</span>
        {job.is_joint && job.secondary_client && <span className="text-xs">& {job.secondary_client.name}</span>}
      </div>
      <div className="flex items-center gap-1">
        <Calendar className="h-3.5 w-3.5" />
        <span>{job.created_at ? formatDistanceToNow(new Date(job.created_at), { addSuffix: true }) : "Unknown date"}</span>
      </div>
    </div>
  );
}

export function JobCard({ job }: JobCardProps) {
  return (
    <Link href={`/app/jobs/${job.id}`} className="block group focus:outline-none">
      <Card className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/50 hover:bg-accent/5 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.99]">
        <CardContent className="flex items-center p-4 sm:p-6 gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <FileText className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0 grid gap-1">
            <div className="flex items-center gap-2">
              {job.job_number && <Badge variant="outline" className="text-xs font-mono shrink-0">{job.job_number}</Badge>}
              <h3 className="font-semibold truncate text-lg">{job.name}</h3>
              <Badge variant="secondary" className={`capitalize ${getStatusColor(job.status)}`}>{job.status || "Unknown"}</Badge>
            </div>
            <JobCardMeta job={job} />
          </div>
          <div className="hidden sm:flex items-center"><ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" /></div>
        </CardContent>
      </Card>
    </Link>
  );
}
