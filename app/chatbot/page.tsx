import Link from "next/link";
import {
  ArrowLeft,
  HeartPulse,
  MessageCircleHeart,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import Chatbot from "./chatbot";

export default function ChatbotPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_50%_0%,#eaf4ed_0%,#f7f9f6_36rem,#f7f9f6_100%)] text-[#243b34]">
      <header className="border-b border-[#e5e9e3]/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex min-h-[76px] max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link className="inline-flex items-center gap-3 text-lg font-bold tracking-[-.04em] text-[#183d38]" href="/">
            <span className="grid size-10 place-items-center rounded-xl bg-[#e6f1e9] text-[#357465] shadow-sm" aria-hidden="true">
              <HeartPulse size={23} />
            </span>
            Aayu<span className="-ml-3 text-[#4c8778]">Hub</span>
          </Link>
          <Link className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium text-[#52645e] transition hover:bg-[#f2f7f3] hover:text-[#287360]" href="/">
            <ArrowLeft size={17} /> Back to home
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-12">
        <div className="mb-7 flex flex-col justify-between gap-5 sm:mb-8 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#d9e8dc] bg-white/80 px-3 py-1.5 text-sm font-semibold text-[#347361]">
              <MessageCircleHeart size={16} /> Aayu Hub assistant
            </p>
            <h1 className="text-3xl font-semibold tracking-[-.04em] text-[#213b32] sm:text-4xl">
              What’s on your mind?
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#66766e] sm:text-lg">
              Ask in your own words, or pick a suggested question to get started.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-xl border border-[#e1e9e1] bg-white/80 px-3 py-2 text-sm text-[#60746a] sm:self-auto">
            <ShieldCheck size={17} className="text-[#42806d]" />
            Prepared guide · No diagnosis
          </div>
        </div>
        <Chatbot />
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#f0dfc0] bg-[#fffaf0] px-4 py-4 text-sm leading-6 text-[#705a35] sm:px-5">
          <ShieldAlert className="mt-0.5 shrink-0 text-[#ad7b31]" size={19} />
          <p>
            <strong className="font-semibold">For your safety:</strong> This assistant shares general information only; it cannot diagnose or replace a healthcare professional. For urgent or emergency symptoms, contact your local emergency service now.
          </p>
        </div>
      </section>
    </main>
  );
}
