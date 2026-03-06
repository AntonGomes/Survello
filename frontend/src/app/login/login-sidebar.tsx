import Link from "next/link";
import { FileText, Clock, TrendingUp } from "lucide-react";

const features = [
  { icon: FileText, title: "Automated Schedules", description: "Generate professional documents instantly" },
  { icon: Clock, title: "Save 122 Hours/Year", description: "Focus on billable work, not admin" },
  { icon: TrendingUp, title: "Grow Your Practice", description: "Innovative SMEs see 14.8% revenue growth" },
];

export function LoginSidebar() {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between p-12">
      <div>
        <Link href="/" className="text-3xl font-tiempos italic text-white font-medium">Survello</Link>
      </div>
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white leading-tight">Surveying, reimagined for efficiency.</h1>
          <p className="text-blue-100 text-lg leading-relaxed max-w-md">From site notes to signed schedules in minutes. Join surveyors who are reclaiming their time.</p>
        </div>
        <div className="space-y-4">
          {features.map((f) => (
            <div key={f.title} className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-accent/20 flex items-center justify-center shrink-0"><f.icon className="h-5 w-5 text-accent" /></div>
              <div><p className="text-white font-medium">{f.title}</p><p className="text-blue-200 text-sm">{f.description}</p></div>
            </div>
          ))}
        </div>
      </div>
      <p className="text-blue-200 text-sm">&copy; {new Date().getFullYear()} Survello. All rights reserved.</p>
    </div>
  );
}
