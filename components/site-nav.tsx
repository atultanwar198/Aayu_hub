import Link from "next/link";
import { ArrowLeft, ArrowRight, HeartPulse } from "lucide-react";
import type { ReactNode } from "react";

type SiteNavProps = {
  variant?: "main" | "back";
  backHref?: string;
  backLabel?: string;
  children?: ReactNode;
};

export default function SiteNav({
  variant = "main",
  backHref = "/",
  backLabel = "Back to home",
  children,
}: SiteNavProps) {
  return (
    <header
      className={
        variant === "main"
          ? "sticky top-0 z-20 border-b border-[#e7e9e3] bg-[#fbfaf7]/95 backdrop-blur"
          : "border-b border-[#e5e9e3] bg-white/90 backdrop-blur"
      }
    >
      <div className="mx-auto flex min-h-[76px] max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link
          className="inline-flex items-center gap-3 text-lg font-bold tracking-[-.04em] text-[#183d38]"
          href="/"
        >
          <span
            className="grid size-10 place-items-center rounded-xl bg-[#e6f1e9] text-[#357465]"
            aria-hidden="true"
          >
            <HeartPulse size={23} strokeWidth={2} />
          </span>
          Aayu<span className="-ml-3 text-[#4c8778]">Hub</span>
        </Link>

        {children ??
          (variant === "main" ? (
            <>
              <nav
                className="hidden items-center gap-8 text-sm font-medium text-[#52645e] md:flex"
                aria-label="Main navigation"
              >
                <Link
                  className="transition-colors hover:text-[#287360]"
                  href="/#how-it-works"
                >
                  How it works
                </Link>
                <Link
                  className="transition-colors hover:text-[#287360]"
                  href="/#topics"
                >
                  Explore topics
                </Link>
                <Link
                  className="transition-colors hover:text-[#287360]"
                  href="/#about"
                >
                  About
                </Link>
                <Link
                  className="transition-colors hover:text-[#287360]"
                  href="/chatbot"
                >
                  Ask a question
                </Link>
                <Link
                  className="transition-colors hover:text-[#287360]"
                  href="/hospitals"
                >
                  Hospitals
                </Link>
              </nav>
              <Link
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#286d5c] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#205b4d] focus:outline-none focus:ring-2 focus:ring-[#286d5c] focus:ring-offset-2"
                href="/login"
              >
                Patient portal <ArrowRight size={17} />
              </Link>
            </>
          ) : (
            <Link
              className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-[#52645e] transition hover:bg-[#f2f7f3] hover:text-[#287360]"
              href={backHref}
            >
              <ArrowLeft size={17} /> {backLabel}
            </Link>
          ))}
      </div>
    </header>
  );
}
