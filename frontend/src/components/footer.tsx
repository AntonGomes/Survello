import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/70 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-6 py-6 text-sm text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="font-semibold text-slate-800">DocGen</span>
        <div className="flex items-center gap-4 text-slate-500">
          <Link href="/about" className="hover:text-slate-800 transition">
            About
          </Link>
          <Link href="/pricing" className="hover:text-slate-800 transition">
            Pricing
          </Link>
          <Link href="/contact" className="hover:text-slate-800 transition">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}
