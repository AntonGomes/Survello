import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-primary backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 py-6 text-sm text-white flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="font-tiempos italic font-medium flex-1">Survello</span>
        <div className="flex items-center gap-6 flex-1 justify-center">
          <Link href="/about" className="hover:text-white/80 transition">
            About
          </Link>
          <Link href="/#faq" className="hover:text-white/80 transition">
            FAQ
          </Link>
        </div>
        <span className="text-white/60 text-xs flex-1 text-right">
          © {new Date().getFullYear()} Survello. All rights reserved.
        </span>
      </div>
    </footer>
  );
}
