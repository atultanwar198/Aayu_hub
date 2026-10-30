import Link from "next/link";
import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Brain,
  Building2,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Heart,
  HeartPulse,
  MessageCircle,
  Moon,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";

const topics = [
  {
    icon: HeartPulse,
    title: "Symptoms & concerns",
    description: "Find a clear way to describe what you’re feeling and what to ask next.",
  },
  {
    icon: Moon,
    title: "Nearest Hospital",
    description: "I want to know my nearest Hospital.",
  },
  {
    icon: ClipboardCheck,
    title: "Preparing for a visit",
    description: "Organize your questions and details before talking with a clinician.",
  },
  {
    icon: Brain,
    title: "Understanding health",
    description: "Get more comfortable with common health terms and care information.",
  },
];

const steps = [
  {
    number: "01",
    icon: MessageCircle,
    title: "Start with what’s on your mind",
    description: "Ask a health question in everyday language. You don’t need to know the medical terms.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Explore helpful information",
    description: "Use clear, general information to organize your thoughts and prepare for a conversation.",
  },
  {
    number: "03",
    icon: Stethoscope,
    title: "Talk with a professional",
    description: "Bring your questions to a qualified healthcare professional for advice about your situation.",
  },
];

export default function Home() {
  return (
    <main id="top" className="min-h-screen overflow-hidden bg-[#fafbf8] text-[#243331]">
      <SiteNav />

      <section className="relative isolate bg-[#f0f5ef]">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
          <div className="absolute -right-36 -top-56 size-[620px] rounded-full border border-[#dce9dd]" />
          <div className="absolute -right-20 -top-40 size-[480px] rounded-full border border-[#dce9dd]" />
          <div className="absolute -bottom-48 -left-36 size-[460px] rounded-full bg-[#f8ecd9]/70 blur-3xl" />
        </div>
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:py-24">
          <div className="relative z-10">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#d6e5d8] bg-white/80 px-4 py-2 text-sm font-semibold text-[#347361] shadow-sm">
              <span className="grid size-6 place-items-center rounded-full bg-[#e6f1e9]">
                <Sparkles size={14} />
              </span>
              A calmer place to begin
            </p>
            <h1 className="mt-7 max-w-2xl text-[2.7rem] font-semibold leading-[1.08] tracking-[-.055em] text-[#1d3731] sm:text-6xl lg:text-[4.25rem]">
              Make sense of your health,
              <span className="mt-1 block font-serif font-medium italic text-[#39806d]">
                one question at a time.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#596b64] sm:text-xl">
              Aayu Hub helps you put health questions into words, explore general information, and feel more prepared to talk with a healthcare professional.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-[#286d5c] px-6 text-base font-semibold text-white shadow-[0_8px_24px_rgba(40,109,92,.2)] transition hover:-translate-y-0.5 hover:bg-[#205b4d] focus:outline-none focus:ring-2 focus:ring-[#286d5c] focus:ring-offset-2"
                href="/chatbot"
              >
                Ask a question <MessageCircle size={19} />
              </Link>
              <Link
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl border border-[#cbdccf] bg-white/80 px-6 text-base font-semibold text-[#315d50] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#39806d] focus:ring-offset-2"
                href="/hospitals"
              >
                Find a hospital <Building2 size={18} />
              </Link>
            </div>
            <p className="mt-5 flex items-center gap-2 text-sm text-[#697a73]">
              <ShieldCheck size={17} className="shrink-0 text-[#42806d]" />
              A helpful starting point—not a diagnosis or a substitute for care.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-[540px]">
            <div className="absolute -right-5 top-6 size-28 rounded-full bg-[#d9e8d9] blur-2xl" aria-hidden="true" />
            <div className="absolute -bottom-6 -left-8 size-36 rounded-full bg-[#f5dfbd]/70 blur-3xl" aria-hidden="true" />
            <div className="relative rounded-[30px] border border-white/80 bg-white p-5 shadow-[0_28px_90px_rgba(36,65,52,.14)] sm:p-7">
              <div className="flex items-center justify-between gap-4 border-b border-[#edf0eb] pb-5">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-2xl bg-[#eaf4ed] text-[#39806d]">
                    <HeartPulse size={23} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#2c443c]">Aayu Hub</p>
                    <p className="mt-0.5 text-xs text-[#819087]">A space to think things through</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f0f6f1] px-3 py-1.5 text-xs font-semibold text-[#51816e]">
                  <span className="size-1.5 rounded-full bg-[#6da17f]" />
                  Here to help
                </span>
              </div>
              <div className="py-6">
                <p className="max-w-[90%] rounded-2xl rounded-tl-md bg-[#f2f6f1] px-4 py-3 text-sm leading-6 text-[#52655b]">
                  What would you like to understand today?
                </p>
                <div className="ml-auto mt-4 max-w-[88%] rounded-2xl rounded-tr-md bg-[#286d5c] px-4 py-3 text-sm leading-6 text-white">
                  What should I write down before my doctor’s appointment?
                </div>
                <div className="mt-4 flex max-w-[95%] gap-3 rounded-2xl border border-[#e6ece5] bg-white p-4">
                  <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-[#eaf4ed] text-[#39806d]">
                    <Sparkles size={16} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#354b41]">Let’s make a simple list</p>
                    <p className="mt-1 text-sm leading-6 text-[#687970]">
                      Note when it started, what you’ve noticed, and any questions you want to ask.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-xl border border-[#e7ece6] bg-[#fcfdfb] px-4 py-3">
                <p className="text-xs text-[#89968e]">Your next question can start here</p>
                <Link
                  aria-label="Open the health question chat"
                  className="grid size-9 shrink-0 place-items-center rounded-lg bg-[#286d5c] text-white transition hover:bg-[#205b4d]"
                  href="/chatbot"
                >
                  <ArrowRight size={17} />
                </Link>
              </div>
            </div>
            <div className="absolute -bottom-5 -right-2 hidden items-center gap-3 rounded-2xl border border-[#e5e9e1] bg-white px-4 py-3 shadow-lg sm:flex sm:-right-5">
              <span className="grid size-10 place-items-center rounded-full bg-[#fbf1e1] text-[#b77d31]">
                <Heart size={20} />
              </span>
              <span className="text-sm font-semibold text-[#465d52]">Care starts with a conversation</span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#e8ece6] bg-white">
        <div className="mx-auto grid max-w-7xl gap-5 px-5 py-6 sm:px-8 md:grid-cols-3 md:gap-8 md:py-7">
          {[
            { icon: MessageCircle, title: "Ask naturally", text: "No medical vocabulary needed" },
            { icon: ClipboardCheck, title: "Get organized", text: "Prepare for your next conversation" },
            { icon: ShieldCheck, title: "Know the limits", text: "General information, not diagnosis" },
          ].map(({ icon: Icon, title, text }) => (
            <div className="flex items-center gap-3" key={title}>
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#edf5ef] text-[#39806d]">
                <Icon size={19} />
              </span>
              <div>
                <p className="text-sm font-semibold text-[#354b41]">{title}</p>
                <p className="mt-0.5 text-xs text-[#7b8981]">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20" id="topics">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[.14em] text-[#48816e]">Explore what’s on your mind</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-.04em] text-[#243b34] sm:text-4xl">
              A good place to start,
              <span className="text-[#39806d]"> whatever your question.</span>
            </h2>
          </div>
          <p className="max-w-md text-base leading-7 text-[#66766e]">
            Choose a topic to get going, or ask in your own words. There’s no wrong place to begin.
          </p>
        </div>

        <div className="mt-9 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {topics.map(({ icon: Icon, title, description }, index) => (
            <Link
              className="group relative overflow-hidden rounded-2xl border border-[#e3e9e2] bg-white p-6 transition hover:-translate-y-1 hover:border-[#b9d5c5] hover:shadow-[0_16px_40px_rgba(47,78,66,.09)] focus:outline-none focus:ring-2 focus:ring-[#39806d]"
              href="/chatbot"
              key={title}
            >
              <span className="absolute right-5 top-5 text-xs font-semibold tracking-[.12em] text-[#b0bcb2]">
                0{index + 1}
              </span>
              <span className="grid size-12 place-items-center rounded-2xl bg-[#eaf4ed] text-[#39806d] transition group-hover:bg-[#dceee2]">
                <Icon size={23} strokeWidth={1.8} />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-[#2c433a]">{title}</h3>
              <p className="mt-2 min-h-[72px] text-sm leading-6 text-[#687970]">{description}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#347361]">
                Explore topic <ChevronRight className="transition group-hover:translate-x-1" size={17} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-[#f0f5ef]" id="how-it-works">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.14em] text-[#48816e]">A simple way forward</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-.04em] text-[#243b34] sm:text-4xl">
              From wondering
              <span className="text-[#39806d]"> to feeling prepared.</span>
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#66766e]">
              You don’t need to have everything figured out. Take one small step, then decide what feels helpful next.
            </p>
            <Link
              className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#286d5c] px-5 text-sm font-semibold text-white transition hover:bg-[#205b4d]"
              href="/chatbot"
            >
              Start with a question <ArrowRight size={17} />
            </Link>
          </div>
          <div className="space-y-3">
            {steps.map(({ number, icon: Icon, title, description }) => (
              <article className="flex gap-4 rounded-2xl border border-[#e0e9e0] bg-white p-5 sm:gap-5 sm:p-6" key={number}>
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#eaf4ed] text-[#39806d]">
                  <Icon size={22} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold tracking-[.12em] text-[#7b9588]">{number}</span>
                    <span className="h-px w-6 bg-[#dce7dd]" />
                    <span className="text-xs font-medium text-[#87948c]">Step</span>
                  </div>
                  <h3 className="mt-2 text-lg font-semibold text-[#2c433a]">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#687970]">{description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-5 lg:grid-cols-2">
          <article className="relative overflow-hidden rounded-[26px] bg-[#225d4e] p-7 text-white sm:p-9">
            <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full border-[34px] border-white/[.06]" aria-hidden="true" />
            <div className="relative">
              <span className="grid size-12 place-items-center rounded-2xl bg-white/10 text-[#d9eee0]">
                <MessageCircle size={23} />
              </span>
              <p className="mt-6 text-xs font-bold uppercase tracking-[.14em] text-[#c5e1ce]">A space to ask</p>
              <h2 className="mt-2 max-w-md text-2xl font-semibold tracking-[-.03em] sm:text-3xl">
                Get your thoughts in order before your next visit.
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-[#dcebe0]">
                Explore general health information and build a list of questions to discuss with a professional.
              </p>
              <Link
                className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-[#286d5c] transition hover:bg-[#eff6f0]"
                href="/chatbot"
              >
                Ask a question <ArrowRight size={16} />
              </Link>
            </div>
          </article>

          <article className="relative overflow-hidden rounded-[26px] border border-[#e1e9e0] bg-white p-7 sm:p-9">
            <div className="pointer-events-none absolute -bottom-28 -right-16 size-64 rounded-full bg-[#f7eddc] blur-3xl" aria-hidden="true" />
            <div className="relative">
              <span className="grid size-12 place-items-center rounded-2xl bg-[#fbf1e1] text-[#ac762e]">
                <Building2 size={23} />
              </span>
              <p className="mt-6 text-xs font-bold uppercase tracking-[.14em] text-[#9a743c]">Hospital directory</p>
              <h2 className="mt-2 max-w-md text-2xl font-semibold tracking-[-.03em] text-[#2c433a] sm:text-3xl">
                Find hospital information in one place.
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-[#687970]">
                Browse locations, contact details, and listed services. Contact hospitals directly to confirm current information.
              </p>
              <Link
                className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#d8e2db] bg-white px-4 text-sm font-semibold text-[#315d50] transition hover:bg-[#f5f8f4]"
                href="/hospitals"
              >
                Browse hospitals <ArrowUpRight size={16} />
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="border-y border-[#e4e9e2] bg-white" id="about">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1fr_.85fr] lg:items-center lg:gap-16">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.14em] text-[#48816e]">About Aayu Hub</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight tracking-[-.04em] text-[#243b34] sm:text-4xl">
              Health questions can feel big.
              <span className="text-[#39806d]"> Starting can feel simple.</span>
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[#66766e]">
              Aayu Hub is a calm place to explore general health information and get ready for a conversation with a qualified healthcare professional.
            </p>
          </div>
          <div className="rounded-2xl border border-[#e2e8e1] bg-[#f8faf7] p-6 sm:p-7">
            <div className="flex items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-[#39806d] shadow-sm">
                <ShieldCheck size={22} />
              </span>
              <div>
                <h3 className="text-base font-semibold text-[#2c433a]">Information with clear limits</h3>
                <p className="mt-2 text-sm leading-6 text-[#687970]">
                  Aayu Hub does not diagnose, replace a clinician, or provide emergency care.
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-start gap-3 border-t border-[#e5eae3] pt-5 text-sm leading-6 text-[#53675d]">
              <CircleHelp className="mt-0.5 shrink-0 text-[#4d8975]" size={19} />
              <p>If you may be having an emergency, contact your local emergency service now.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 sm:py-16">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-[26px] bg-[#e7f0e7] p-7 sm:p-10 lg:flex-row lg:items-center">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-[#48816e]">
              <HeartPulse size={18} /> Your next step starts here
            </p>
            <h2 className="mt-3 max-w-2xl text-2xl font-semibold tracking-[-.035em] text-[#243b34] sm:text-3xl">
              Bring your questions. We’ll help you get started.
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#66766e]">
              Explore a topic, prepare for a visit, or find hospital information.
            </p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#286d5c] px-5 text-sm font-semibold text-white transition hover:bg-[#205b4d]"
              href="/chatbot"
            >
              Ask a question <ArrowRight size={17} />
            </Link>
            <Link
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#cbdccf] bg-white px-5 text-sm font-semibold text-[#315d50] transition hover:bg-[#f8fbf8]"
              href="/login"
            >
              Patient portal <ArrowRight size={17} />
            </Link>
          </div>
        </div>
        <a className="mx-auto mt-6 flex w-fit items-center gap-2 text-xs font-medium text-[#87948c] hover:text-[#52645e]" href="#top">
          Back to top <ArrowDown className="rotate-180" size={14} />
        </a>
      </section>

      <SiteFooter />
    </main>
  );
}
