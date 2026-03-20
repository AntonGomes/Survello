"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, LayoutDashboard, Briefcase, FileText, FolderOpen, Building2, Settings, User } from "lucide-react";

export const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/app/dashboard", disabled: false, comingSoon: false },
  { label: "Jobs", icon: Briefcase, href: "/app/jobs", disabled: false, comingSoon: false },
  { label: "Clients", icon: FileText, href: "/app/clients", disabled: false, comingSoon: false },
  { label: "Templates", icon: FolderOpen, href: "/app/templates", disabled: false, comingSoon: false },
];

export const BOTTOM_ITEMS = [
  { label: "Organisation", icon: Building2, href: "/app/organisation" },
  { label: "Settings", icon: Settings, href: "/app/settings" },
  { label: "Account", icon: User, href: "/app/account" },
];

export function GenerateDocButton({ collapsed, onNavigate }: { collapsed: boolean; onNavigate: () => void }) {
  return (
    <Link
      href="/app/generate"
      className={cn(
        buttonVariants({ variant: "default", size: "default" }),
        "w-full gap-3 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold shadow-md transition-all mb-4",
        collapsed ? "lg:justify-center lg:px-0" : "justify-start"
      )}
      onClick={onNavigate}
    >
      <Plus className="h-5 w-5" strokeWidth={3} />
      <span className={cn(collapsed ? "lg:hidden" : "block")}>Generate Dilaps</span>
    </Link>
  );
}

export function NavLink({ label, icon: Icon, href, disabled, comingSoon, collapsed, pathname, onNavigate }: {
  label: string; icon: React.ComponentType<{ className?: string }>; href: string
  disabled: boolean; comingSoon: boolean; collapsed: boolean; pathname: string | null; onNavigate: () => void
}) {
  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({ variant: "ghost" }),
        "w-full gap-3 text-white/90 hover:bg-white/10 hover:text-white transition-colors relative group",
        collapsed ? "lg:justify-center lg:px-0" : "justify-start",
        disabled && "opacity-70 hover:opacity-90",
        pathname?.startsWith(href) && "bg-white/10 text-white"
      )}
      onClick={onNavigate}
    >
      <Icon className="h-5 w-5" />
      <span className={cn(collapsed ? "lg:hidden" : "block")}>{label}</span>
      {comingSoon && !collapsed && (
        <span className="ml-auto text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white/90 font-medium">Soon</span>
      )}
    </Link>
  );
}

export function BottomNavLink({ label, icon: Icon, href, collapsed, pathname, onNavigate }: {
  label: string; icon: React.ComponentType<{ className?: string }>; href: string
  collapsed: boolean; pathname: string | null; onNavigate: () => void
}) {
  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({ variant: "ghost" }),
        "w-full gap-3 text-white/90 hover:bg-white/10 hover:text-white transition-colors",
        collapsed ? "lg:justify-center lg:px-0" : "justify-start",
        pathname?.startsWith(href) && "bg-white/10 text-white"
      )}
      onClick={onNavigate}
    >
      <Icon className="h-5 w-5" />
      <span className={cn(collapsed ? "lg:hidden" : "block")}>{label}</span>
    </Link>
  );
}
