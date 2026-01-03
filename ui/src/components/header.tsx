import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";

type HeaderProps = {
  authenticated?: boolean;
};

export function Header({ authenticated = false }: HeaderProps) {
  return (
    <header className="bg-chart-1 text-white backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <Image
                src="/logo-translate.png"
                alt="SiteNotes Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold tracking-tight mr-2">
              SiteNotes
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-white">
            <Link href="/about" className="hover:text-chart-5 transition">
              About
            </Link>
            <Link href="/pricing" className="hover:text-chart-5 transition">
              Pricing
            </Link>
            <Link href="/contact" className="hover:text-chart-5 transition">
              Contact
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!authenticated ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign up</Link>
              </Button>
            </>
          ) : (
            <Button asChild>
              <Link href="/app">Dashboard</Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
