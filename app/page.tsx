import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  Brain,
  Check,
  ChevronRight,
  CircleHelp,
  ClipboardList,
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
    title: "Sleep & wellbeing",
    description: "Explore everyday questions about rest, stress, and healthy routines.",
  },
  {
    icon: ClipboardList,
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
    icon: MessageCircle,
    title: "Ask in your own words",
    description: "Start with what’s on your mind. You don’t need medical terms to ask a question.",
  },
  {
    icon: Sparkles,
    title: "Explore helpful information",
    description: "Use Aayu Hub to learn about your concern and think about what to discuss with a professional.",
  },
  {
    icon: Stethoscope,
    title: "Choose your next step",
    description: "Take your questions to a qualified healthcare professional when you need personal advice.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fbfaf7] text-[#243331]">
      <header className="sticky top-0 z-20 border-b border-[#e7e9e3] bg-[#fbfaf7]/95 backdrop-blur">
        <div className="mx-auto flex min-h-[76px] max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link className="inline-flex items-center gap-3 text-lg font-bold tracking-[-.04em] text-[#183d38]" href="/">
            <span className="grid size-10 place-items-center rounded-xl bg-[#e6f1e9] text-[#357465]" aria-hidden="true">
              <HeartPulse size={23} strokeWidth={2} />
            </span>
            Aayu<span className="-ml-3 text-[#4c8778]">Hub</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-[#52645e] md:flex" aria-label="Main navigation">
            <a className="transition-colors hover:text-[#287360]" href="#how-it-works">How it works</a>
            <a className="transition-colors hover:text-[#287360]" href="#topics">Explore topics</a>
            <a className="transition-colors hover:text-[#287360]" href="#about">About</a>
            <Link className="transition-colors hover:text-[#287360]" href="/chatbot">Ask a question</Link>
          </nav>
          <Link className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#286d5c] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#205b4d] focus:outline-none focus:ring-2 focus:ring-[#286d5c] focus:ring-offset-2" href="/login">
            Patient portal <ArrowRight size={17} />
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-36 -top-40 size-[520px] rounded-full bg-[#e5f1e8] blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -left-40 bottom-0 size-[380px] rounded-full bg-[#f7eddc] blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:py-24">
          <div>
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#dce9df] bg-white/80 px-4 py-2 text-sm font-semibold text-[#347361]">
              <Sparkles size={16} /> A friendlier place to start
            </p>
            <h1 className="max-w-2xl text-4xl font-semibold leading-[1.12] tracking-[-.045em] text-[#1e3531] sm:text-5xl lg:text-[60px]">
              Your health questions deserve <span className="text-[#39806d]">a good place to begin.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#596b64] sm:text-xl">
              Aayu Hub helps you ask questions about how you feel, understand health information, and prepare for a conversation with a healthcare professional.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-[#286d5c] px-6 text-base font-semibold text-white shadow-md shadow-[#286d5c]/15 transition hover:-translate-y-0.5 hover:bg-[#205b4d] focus:outline-none focus:ring-2 focus:ring-[#286d5c] focus:ring-offset-2" href="/chatbot">
                Ask a question <MessageCircle size={19} />
              </Link>
              <a className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl border border-[#d8e2db] bg-white px-6 text-base font-semibold text-[#315d50] transition hover:bg-[#f2f7f3]" href="#how-it-works">
                See how it works <ArrowDown size={18} />
              </a>
            </div>
            <p className="mt-5 flex items-center gap-2 text-sm text-[#697a73]">
              <ShieldCheck size={17} className="text-[#42806d]" /> Your questions are a starting point, not a diagnosis.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-[500px]">
            <div className="absolute -left-5 top-12 size-20 rounded-full bg-[#f4dfbb]/80 blur-2xl" aria-hidden="true" />
            <div className="relative rounded-[28px] border border-[#e3e9e1] bg-white p-6 shadow-[0_24px_70px_rgba(47,78,66,.12)] sm:p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-2xl bg-[#eaf4ed] text-[#39806d]"><MessageCircle size={22} /></span>
                  <div>
                    <p className="text-sm font-semibold text-[#2c443c]">A space to ask</p>
                    <p className="mt-1 text-xs text-[#819087]">Start wherever you are</p>
                  </div>
                </div>
                <span className="rounded-full bg-[#f2f7f2] px-3 py-1 text-xs font-medium text-[#51816e]">Your questions matter</span>
              </div>
              <div className="mt-8 rounded-2xl bg-[#f5f8f4] p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[.13em] text-[#77877e]">You might ask</p>
                <p className="mt-4 text-xl font-medium leading-8 text-[#344b42] sm:text-2xl">
                  “What details should I write down before I talk to my doctor?”
                </p>
                <div className="mt-6 flex items-center gap-2 text-sm text-[#648071]">
                  <Check size={17} /> A simple way to get prepared
                </div>
              </div>
              <p className="mt-5 text-sm leading-6 text-[#76857c]">
                Aayu Hub can help you organize your thoughts. A healthcare professional can give advice for your personal situation.
              </p>
            </div>
            <div className="absolute -bottom-5 -right-3 flex items-center gap-3 rounded-2xl border border-[#e5e9e1] bg-white px-4 py-3 shadow-lg sm:-right-6">
              <span className="grid size-10 place-items-center rounded-full bg-[#fbf1e1] text-[#b77d31]"><Heart size={20} /></span>
              <span className="text-sm font-semibold text-[#465d52]">Care starts with a question</span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#e9ece6] bg-white" id="topics">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[.14em] text-[#48816e]">Explore what’s on your mind</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-.035em] text-[#243b34] sm:text-4xl">A helpful place for everyday health questions</h2>
            <p className="mt-4 text-lg leading-8 text-[#66766e]">Start with a topic that feels relevant. You can ask in your own words.</p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {topics.map(({ icon: Icon, title, description }) => (
              <Link className="group rounded-2xl border border-[#e5eae4] bg-[#fcfdfb] p-6 transition hover:-translate-y-1 hover:border-[#b9d5c5] hover:shadow-lg hover:shadow-[#305b48]/[.07] focus:outline-none focus:ring-2 focus:ring-[#39806d]" href="/chatbot" key={title}>
                <span className="grid size-12 place-items-center rounded-2xl bg-[#eaf4ed] text-[#39806d] transition group-hover:bg-[#dceee2]">
                  <Icon size={23} strokeWidth={1.8} />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-[#2c433a]">{title}</h3>
                <p className="mt-2 text-base leading-7 text-[#687970]">{description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#347361]">
                  Explore <ChevronRight size={17} className="transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20" id="how-it-works">
        <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.14em] text-[#48816e]">How it works</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-.035em] text-[#243b34] sm:text-4xl">A little more clarity, one step at a time.</h2>
            <p className="mt-5 text-lg leading-8 text-[#66766e]">You don’t need to have everything figured out before you begin. Start with one question.</p>
            <Link className="mt-7 inline-flex items-center gap-2 text-base font-semibold text-[#347361] hover:text-[#205b4d]" href="/login">
              Ask Aayu Hub <ArrowRight size={18} />
            </Link>
          </div>
          <div className="space-y-4">
            {steps.map(({ icon: Icon, title, description }, index) => (
              <article className="flex gap-5 rounded-2xl border border-[#e5eae4] bg-white p-5 sm:p-6" key={title}>
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#eaf4ed] text-[#39806d]"><Icon size={23} /></span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.12em] text-[#7b9588]">Step 0{index + 1}</p>
                  <h3 className="mt-1 text-lg font-semibold text-[#2c433a]">{title}</h3>
                  <p className="mt-2 text-base leading-7 text-[#687970]">{description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#edf5ef]" id="about">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.14em] text-[#48816e]">Aayu Hub is here for you</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-[-.035em] text-[#243b34] sm:text-4xl">Feel more prepared to have the conversation.</h2>
            <p className="mt-5 text-lg leading-8 text-[#596e63]">
              Health questions can feel difficult to put into words. Aayu Hub gives you a calm place to organize what you’re wondering about and prepare to speak with a qualified professional.
            </p>
          </div>
          <div className="rounded-3xl border border-[#d9e7dc] bg-white p-6 sm:p-8">
            <div className="flex gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#eaf4ed] text-[#39806d]"><ShieldCheck size={24} /></span>
              <div>
                <h3 className="text-lg font-semibold text-[#2c433a]">Helpful information, with clear limits</h3>
                <p className="mt-2 text-base leading-7 text-[#687970]">
                  Aayu Hub is for general information and preparation. It does not diagnose, replace a clinician, or provide emergency care.
                </p>
              </div>
            </div>
            <div className="mt-6 border-t border-[#e8ede7] pt-5">
              <p className="flex items-start gap-3 text-base leading-7 text-[#53675d]">
                <CircleHelp className="mt-1 shrink-0 text-[#4d8975]" size={20} />
                If you may be having an emergency, contact your local emergency service now.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-16">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-[#286d5c] p-7 text-white sm:p-10 lg:flex-row lg:items-center">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-[#d3ebdd]"><HeartPulse size={18} /> Your next step starts here</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-.025em] sm:text-3xl">Have a question? Begin when you’re ready.</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[#e2f0e7]">Sign in to continue to the Aayu Hub patient portal.</p>
          </div>
          <Link className="inline-flex min-h-14 shrink-0 items-center gap-3 rounded-xl bg-white px-6 text-base font-semibold text-[#286d5c] transition hover:bg-[#f0f7f1] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#286d5c]" href="/login">
            Sign in to Aayu Hub <ArrowRight size={19} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#e5e9e3] bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-8 text-sm text-[#65766d] sm:px-8 md:flex-row md:items-center md:justify-between">
          <Link className="inline-flex items-center gap-2 font-semibold text-[#315d50]" href="/">
            <HeartPulse size={19} /> Aayu Hub
          </Link>
          <p className="max-w-2xl leading-6">
            Aayu Hub provides general health information, not medical diagnosis or emergency care. Talk to a qualified healthcare professional about your personal health.
          </p>
          <Link className="inline-flex items-center gap-2 font-semibold text-[#347361] hover:text-[#205b4d]" href="/login">Patient portal <ArrowRight size={16} /></Link>
        </div>
      </footer>
    </main>
  );
}
