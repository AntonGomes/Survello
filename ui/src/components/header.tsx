import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

type HeaderProps = {
  authenticated?: boolean;
};

export function Header({ authenticated = false }: HeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              DocGen
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-700">
            <Link href="/about" className="hover:text-slate-900 transition">
              About
            </Link>
            <Link href="/pricing" className="hover:text-slate-900 transition">
              Pricing
            </Link>
            <Link href="/contact" className="hover:text-slate-900 transition">
              Contact
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!authenticated ? (
            <>
              <Button variant="ghost" asChild>
                <a href="/auth/login">Log in</a>
              </Button>
              <Button asChild>
                <a href="/auth/login?screen_hint=signup">Sign up</a>
              </Button>
            </>
          ) : (
            <Button variant="outline" asChild>
              <a href="/auth/logout">Log out</a>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
