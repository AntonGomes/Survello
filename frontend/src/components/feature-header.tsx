import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Fragment } from "react";
import { GlobalTimer } from "@/components/global-timer";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface FeatureHeaderProps {
  title: string;
  badge?: string | null;
  prefix?: ReactNode;
  children?: ReactNode;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
}

export function FeatureHeader({ title, badge, prefix, children, subtitle, breadcrumbs }: FeatureHeaderProps) {
  return (
    <div className="-mt-4 lg:-mt-8 mb-6">
      <div className="-mx-4 lg:-mx-8 px-4 lg:px-8 py-6 border-b flex items-center justify-between min-h-[88px]">
        <div className="space-y-1">
          <div className="flex items-center gap-4">
            {prefix}
            <div className="flex items-center gap-3">
              {breadcrumbs && breadcrumbs.length > 0 ? (
                <div className="flex items-center gap-2 text-3xl font-bold tracking-tight">
                  {breadcrumbs.map((item, index) => (
                    <Fragment key={index}>
                      {index > 0 && <span className="text-muted-foreground/30 font-normal">/</span>}
                      {item.href ? (
                        <Link 
                          href={item.href}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <span className="text-foreground">{item.label}</span>
                      )}
                    </Fragment>
                  ))}
                </div>
              ) : (
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
              )}
              {badge && (
                <Badge variant="secondary" className="text-sm">
                  {badge}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <GlobalTimer />
          {children}
        </div>
      </div>
      
      {subtitle && (
        <p className="text-muted-foreground mt-4">{subtitle}</p>
      )}
    </div>
  );
}
