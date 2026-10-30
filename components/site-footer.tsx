import Link from "next/link";
import { ArrowRight, HeartPulse } from "lucide-react";

type SiteFooterProps = {
  note?: string;
};

export default function SiteFooter({
  note = "Aayu Hub provides general health information, not medical diagnosis or emergency care. Talk to a qualified healthcare professional about your personal health.",
}: SiteFooterProps) {
  return (
    <footer className="border-t border-[#e5e9e3] bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-7 text-sm text-[#65766d] sm:px-8 md:flex-row md:items-center md:justify-between">
        <Link
          className="inline-flex shrink-0 items-center gap-2 font-semibold text-[#315d50]"
          href="/"
        >
          <HeartPulse size={19} /> Aayu Hub
        </Link>
        <p className="max-w-2xl leading-6">{note}</p>
        <div className="flex shrink-0 flex-wrap gap-x-5 gap-y-2">
          <Link
            className="inline-flex items-center gap-1 font-semibold text-[#347361] transition hover:text-[#205b4d]"
            href="/chatbot"
          >
            Ask a question <ArrowRight size={16} />
          </Link>
          <Link
            className="inline-flex items-center gap-1 font-semibold text-[#347361] transition hover:text-[#205b4d]"
            href="/login"
          >
            Patient portal <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </footer>
  );
}
