"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { NAV_ITEMS, BOTTOM_ITEMS, GenerateDocButton, NavLink, BottomNavLink } from "./app-shell-nav";

function MobileHeader({ mobileMenuOpen, onToggle }: { mobileMenuOpen: boolean; onToggle: () => void }) {
  return (
    <div className="lg:hidden flex items-center justify-between p-4 bg-primary text-primary-foreground sticky top-0 z-50 shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg font-tiempos italic">Survello</span>
          <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-white/20 text-white hover:bg-white/30 border-none">Alpha</Badge>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={onToggle}>
        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>
    </div>
  );
}

function SidebarHeader({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between px-6 py-6 min-h-[88px] border-b border-white/5">
      <div className={cn("flex items-center gap-3 overflow-hidden", collapsed && "lg:justify-center lg:w-full")}>
        <div className={cn("truncate transition-opacity duration-200", collapsed ? "lg:hidden" : "block")}>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-tiempos italic font-medium text-white">Survello</p>
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-white/20 text-white hover:bg-white/30 border-none">Alpha</Badge>
          </div>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 shrink-0 hidden lg:flex" onClick={onToggle}>
        {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
      </Button>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:block">
      <MobileHeader mobileMenuOpen={mobileMenuOpen} onToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
      <div className="flex-1 grid lg:grid-cols-[auto_1fr]">
        {mobileMenuOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={closeMobile} />}
        <aside className={cn("fixed inset-y-0 left-0 z-50 flex flex-col gap-6 bg-primary text-primary-foreground transition-all duration-300 ease-in-out border-r border-white/10 lg:relative lg:translate-x-0", mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full", collapsed ? "lg:w-[84px]" : "lg:w-64", "w-64")}>
          <SidebarHeader collapsed={collapsed} onToggle={() => setCollapsed((s) => !s)} />
          <nav className="space-y-1 px-2 flex-1">
            <GenerateDocButton collapsed={collapsed} onNavigate={closeMobile} />
            {NAV_ITEMS.map((item) => <NavLink key={item.label} {...item} collapsed={collapsed} pathname={pathname} onNavigate={closeMobile} />)}
          </nav>
          <div className="mt-auto px-2 pb-6 space-y-1">
            {BOTTOM_ITEMS.map((item) => <BottomNavLink key={item.label} {...item} collapsed={collapsed} pathname={pathname} onNavigate={closeMobile} />)}
            <Button variant="ghost" className={cn("w-full gap-3 text-white/90 hover:bg-white/10 hover:text-white transition-colors", collapsed ? "lg:justify-center lg:px-0" : "justify-start")} onClick={() => logout()}>
              <span className={cn(collapsed ? "lg:hidden" : "block")}>Log out</span>
            </Button>
          </div>
        </aside>
        <main className="flex-1 overflow-auto h-[calc(100vh-64px)] lg:h-screen p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
