import Link from "next/link";
import Image from "next/image";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type HeaderProps = {
  authenticated?: boolean;
};

export function Header({ authenticated = false }: HeaderProps) {
  return (
    <header className="bg-primary text-primary-foreground backdrop-blur-sm border-b border-white/10 sticky top-0 z-10">
      <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-10 h-10 hidden">
              <Image
                src="/logo-translate.png"
                alt="Survello Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-2xl font-tiempos italic font-medium tracking-tight mr-2">
              Survello
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium opacity-90">
            <Link href="/about" className="hover:text-secondary transition">
              About
            </Link>
            <Link href="/pricing" className="hover:text-secondary transition">
              Pricing
            </Link>
            <Link href="/contact" className="hover:text-secondary transition">
              Contact
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!authenticated ? (
            <>
              <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }))}>
                Log in
              </Link>
              <Link href="/register" className={cn(buttonVariants())}>
                Sign up
              </Link>
            </>
          ) : (
            <Link href="/app" className={cn(buttonVariants())}>
              Dashboard
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
