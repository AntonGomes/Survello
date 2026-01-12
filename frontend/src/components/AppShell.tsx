"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Plus,
  Settings,
  User,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/app/dashboard", disabled: false, comingSoon: false },
  { label: "Jobs", icon: Briefcase, href: "/app/jobs", disabled: false, comingSoon: false },
  { label: "Clients", icon: FileText, href: "/app/clients", disabled: false, comingSoon: false },
  { label: "Chat", icon: MessageSquare, href: "/app/chat", disabled: false, comingSoon: true },
];

const BOTTOM_ITEMS = [
  { label: "Settings", icon: Settings, href: "/app/settings" },
  { label: "Account", icon: User, href: "/app/account" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-muted text-foreground flex flex-col lg:block">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-primary text-primary-foreground sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hidden">
            <Image
              src="/logo-translate.png"
              alt="Survello Logo"
              width={20}
              height={20}
              className="object-contain"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg font-tiempos italic">Survello</span>
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-white/20 text-white hover:bg-white/30 border-none">Alpha</Badge>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      <div className="flex-1 grid lg:grid-cols-[auto_1fr]">
        {/* Mobile Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex flex-col gap-6 bg-primary text-primary-foreground transition-all duration-300 ease-in-out border-r border-white/10 lg:relative lg:translate-x-0",
            mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
            collapsed ? "lg:w-[84px]" : "lg:w-64",
            "w-64" // Mobile width
          )}
        >
          <div className="flex items-center justify-between px-4 pt-6">
            <div className={cn("flex items-center gap-3 overflow-hidden", collapsed && "lg:justify-center lg:w-full")}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 hidden">
                <Image
                  src="/logo-translate.png"
                  alt="Survello Logo"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
              <div className={cn("truncate transition-opacity duration-200", collapsed ? "lg:hidden" : "block")}>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-tiempos italic font-medium text-white">Survello</p>
                  <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-white/20 text-white hover:bg-white/30 border-none">Alpha</Badge>
                </div>
                <p className="text-xs text-blue-200 mt-1">Workspace</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 shrink-0 hidden lg:flex"
              onClick={() => setCollapsed((state) => !state)}
            >
              {collapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </Button>
          </div>

          <nav className="space-y-1 px-2 flex-1">
            <Button
              className={cn(
                "w-full gap-3 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold shadow-md transition-all mb-4",
                collapsed ? "lg:justify-center lg:px-0" : "justify-start"
              )}
              asChild
              onClick={() => setMobileMenuOpen(false)}
            >
              <Link href="/app/generate">
                <Plus className="h-5 w-5" strokeWidth={3} />
                <span className={cn(collapsed ? "lg:hidden" : "block")}>Generate Document</span>
              </Link>
            </Button>

            {NAV_ITEMS.map(({ label, icon: Icon, href, disabled, comingSoon }) => (
              <Button
                key={label}
                variant="ghost"
                className={cn(
                  "w-full gap-3 text-white/90 hover:bg-white/10 hover:text-white transition-colors relative group",
                  collapsed ? "lg:justify-center lg:px-0" : "justify-start",
                  disabled && "opacity-70 hover:opacity-90",
                  pathname?.startsWith(href) && "bg-white/10 text-white"
                )}
                asChild
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link href={href}>
                  <Icon className="h-5 w-5" />
                  <span className={cn(collapsed ? "lg:hidden" : "block")}>{label}</span>
                  {comingSoon && !collapsed && (
                    <span className="ml-auto text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white/90 font-medium">
                      Soon
                    </span>
                  )}
                </Link>
              </Button>
            ))}
          </nav>

          <div className="mt-auto px-2 pb-6 space-y-1">
            {BOTTOM_ITEMS.map(({ label, icon: Icon, href }) => (
              <Button
                key={label}
                variant="ghost"
                className={cn(
                  "w-full gap-3 text-white/90 hover:bg-white/10 hover:text-white transition-colors",
                  collapsed ? "lg:justify-center lg:px-0" : "justify-start",
                  pathname?.startsWith(href) && "bg-white/10 text-white"
                )}
                asChild
                onClick={() => setMobileMenuOpen(false)}
              >
                <Link href={href}>
                  <Icon className="h-5 w-5" />
                  <span className={cn(collapsed ? "lg:hidden" : "block")}>{label}</span>
                </Link>
              </Button>
            ))}
            <Button
              variant="ghost"
              className={cn(
                "w-full gap-3 text-white/90 hover:bg-white/10 hover:text-white transition-colors",
                collapsed ? "lg:justify-center lg:px-0" : "justify-start"
              )}
              onClick={() => logout()}
            >
              <span className={cn(collapsed ? "lg:hidden" : "block")}>Log out</span>
            </Button>
          </div>
        </aside>

        <main className="p-4 lg:p-10 space-y-6 overflow-auto h-[calc(100vh-64px)] lg:h-screen">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              {pathname === "/" && (
                <>
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-muted-foreground">Document builder</p>
                    <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                      Smart fill enabled
                    </span>
                  </div>
                  <h1 className="text-2xl font-semibold text-foreground mt-1">
                    Generate documents
                  </h1>
                </>
              )}
            </div>
            
          </div>

          <Card className="border-border shadow-sm min-h-[500px]">
            <CardContent className="pt-6 h-full">{children}</CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

