import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  HeartPulse,
  MessageCircleHeart,
  ShieldCheck,
} from "lucide-react";

type SiteFooterProps = {
  note?: string;
};

const footerLinkClass =
  "group inline-flex w-fit items-center gap-2 text-sm text-[#c3d2c8] transition hover:text-white focus:outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-[#a8cda9]";

export default function SiteFooter({
  note = "Aayu Hub provides general health information, not medical diagnosis or emergency care. Talk to a qualified healthcare professional about your personal health.",
}: SiteFooterProps) {
  return (
    <footer className="relative mt-16 overflow-hidden bg-[#193a30] text-white">
      <div className="pointer-events-none absolute -right-24 -top-36 size-[26rem] rounded-full border border-white/[.06]" />
      <div className="pointer-events-none absolute -right-8 -top-20 size-[18rem] rounded-full border border-white/[.06]" />
      <div className="h-1 bg-gradient-to-r from-[#a8c998] via-[#5a9877] to-[#d7bd83]" />

      <div className="relative mx-auto max-w-6xl px-5 pb-6 pt-10 sm:px-8 sm:pt-14">
        <div className="grid gap-10 border-b border-white/10 pb-10 md:grid-cols-[1.3fr_.7fr_.8fr] md:gap-14 md:pb-12">
          <div>
            <Link
              className="group inline-flex items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a8cda9]"
              href="/"
            >
              <span className="grid size-12 place-items-center rounded-[18px] bg-white/10 text-[#c6e0c0] ring-1 ring-white/10 transition group-hover:bg-white/[.15]">
                <HeartPulse size={23} strokeWidth={1.8} />
              </span>
              <span>
                <span className="block text-lg font-semibold tracking-[-.02em]">Aayu Hub</span>
                <span className="mt-0.5 block text-xs text-[#a9bdb0]">Care starts with clarity</span>
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-6 text-[#bdcec3]">
              Find helpful health information, explore care options, and take the next step with confidence.
            </p>
            <Link
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#d5e7cf] px-4 text-sm font-semibold text-[#244b3a] transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#193a30]"
              href="/chatbot"
            >
              <MessageCircleHeart size={17} /> Start a check-in <ArrowRight size={15} />
            </Link>
          </div>

          <nav aria-label="Explore Aayu Hub">
            <h2 className="text-xs font-semibold uppercase tracking-[.14em] text-[#d2dfd6]">Explore</h2>
            <ul className="mt-4 space-y-3">
              <li><Link className={footerLinkClass} href="/chatbot"><MessageCircleHeart size={16} className="text-[#8fb49a]" /> Health assistant</Link></li>
              <li><Link className={footerLinkClass} href="/hospitals"><Building2 size={16} className="text-[#8fb49a]" /> Hospitals</Link></li>
              <li><Link className={footerLinkClass} href="/appointments"><CalendarDays size={16} className="text-[#8fb49a]" /> Appointments</Link></li>
            </ul>
          </nav>

          <nav aria-label="Aayu Hub portals">
            <h2 className="text-xs font-semibold uppercase tracking-[.14em] text-[#d2dfd6]">Portals</h2>
            <ul className="mt-4 space-y-3">
              <li><Link className={footerLinkClass} href="/login">Patient portal <ArrowUpRight size={14} className="opacity-60 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></Link></li>
              <li><Link className={footerLinkClass} href="/hospital-management/login">Hospital workspace <ArrowUpRight size={14} className="opacity-60 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></Link></li>
            </ul>
          </nav>
        </div>

        <div className="flex flex-col gap-4 border-b border-white/10 py-6 sm:flex-row sm:items-start">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#a8cda9]" />
          <p className="max-w-5xl text-xs leading-5 text-[#b8c9be]">{note}</p>
        </div>

        <div className="flex flex-col gap-2 pt-5 text-xs text-[#9fb2a5] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Aayu Hub</p>
          <p>For emergencies, contact your local emergency services.</p>
        </div>
      </div>
    </footer>
  );
}
