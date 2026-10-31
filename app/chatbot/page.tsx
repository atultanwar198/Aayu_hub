import { MessageCircleHeart, ShieldCheck } from "lucide-react";
import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";
import Chatbot from "./chatbot";

export default function ChatbotPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_50%_0%,#eaf4ed_0%,#f7f9f6_36rem,#f7f9f6_100%)] text-[#243b34]">
      <SiteNav variant="back" />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-12">
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
      </section>
      <SiteFooter note="Aayu Hub’s assistant uses prepared answers for general information only. It cannot diagnose or provide emergency care." />
    </main>
  );
}
