"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  Folder,
  Home,
  LogOut,
  Settings,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AppShellProps = {
  userEmail?: string;
  children: React.ReactNode;
};

const NAV_ITEMS = [
  { label: "Saved templates", icon: FileText },
  { label: "Org templates", icon: Folder },
  { label: "Past jobs", icon: Clock3 },
  { label: "Account", icon: User },
  { label: "Settings", icon: Settings },
];

export function AppShell({ userEmail, children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-secondary text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[auto_1fr]">
        <aside
          className={`relative flex flex-col gap-6 bg-primary text-primary-foreground transition-[width] duration-200 ${
            collapsed ? "w-[84px]" : "w-64"
          }`}
        >
          <div className="flex items-center justify-between px-4 pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                <Home className="h-5 w-5" />
              </div>
              {!collapsed && (
                <div>
                  <p className="text-sm text-white/80">DocGen</p>
                  <p className="text-lg font-semibold">Workspace</p>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={() => setCollapsed((state) => !state)}
            >
              {collapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </Button>
          </div>

          <nav className="space-y-1 px-2">
            {NAV_ITEMS.map(({ label, icon: Icon }) => (
              <Button
                key={label}
                variant="ghost"
                className="w-full justify-start gap-3 text-white/90 hover:bg-white/10 hover:text-white"
                asChild
              >
                <a href="#">
                  <Icon className="h-4 w-4" />
                  {!collapsed && <span>{label}</span>}
                </a>
              </Button>
            ))}
          </nav>

          <div className="mt-auto px-4 pb-6">
            <Button
              className="w-full justify-start gap-3 bg-white text-slate-900 hover:bg-white/90"
              asChild
            >
              <a href="/auth/logout">
                <LogOut className="h-4 w-4" />
                {!collapsed && <span>Log out</span>}
              </a>
            </Button>
          </div>
        </aside>

        <main className="p-6 lg:p-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-3">
                <p className="text-sm text-muted-foreground">Document builder</p>
                <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                  Smart fill enabled
                </span>
              </div>
              <h1 className="text-2xl font-semibold text-foreground">
                Generate documents
              </h1>
            </div>
            {userEmail && (
              <Card className="border-border shadow-sm shrink-0 min-w-[260px] max-w-sm relative overflow-hidden">
                <span className="absolute inset-x-0 top-0 h-1 bg-accent/60" />
                <CardHeader className="py-3">
                  <CardTitle className="text-sm font-medium truncate">
                    {userEmail}
                  </CardTitle>
                  <CardDescription>Signed in</CardDescription>
                </CardHeader>
              </Card>
            )}
          </div>

          <Card className="border-border shadow-sm">
            <CardContent className="pt-6">{children}</CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
