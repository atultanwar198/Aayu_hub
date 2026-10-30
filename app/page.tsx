import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Tell us what’s going on",
    description:
      "Put your concern into your own words. You don’t need to know the right medical terms.",
  },
  {
    number: "02",
    title: "Get help finding clarity",
    description:
      "Use your questions to understand what information may be useful to discuss with a health professional.",
  },
  {
    number: "03",
    title: "Keep your care in view",
    description:
      "Sign in to access your patient portal and keep important health details together.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_79%_20%,#1b3231_0%,#0c1516_39%,#0b1113_76%)] px-[6%] md:px-[8%]">
      <header className="mx-auto flex min-h-[76px] max-w-[1100px] items-center justify-between border-b border-white/10 md:min-h-[88px]">
        <Link
          className="inline-flex items-center gap-[11px] text-[13px] font-bold tracking-[.16em]"
          href="/"
        >
          <span
            className="grid size-[31px] place-items-center border border-[#e7a85b]/65 font-display text-[18px] text-[#e7a85b]"
            aria-hidden="true"
          >
            A
          </span>
          <span>
            AAYU <b className="font-medium text-[#d7a66e]">HUB</b>
          </span>
        </Link>
        <nav
          className="flex items-center gap-3 text-[11px] text-[#aeb8b3] md:gap-[34px] md:text-xs"
          aria-label="Main navigation"
        >
          <a
            className="transition-colors hover:text-[#e7b77e]"
            href="#how-it-works"
          >
            How it works
          </a>
          <Link
            className="px-[9px] py-[10px] text-[#e8e5dc] transition-colors hover:text-[#e7b77e] md:px-[15px]"
            href="/login"
          >
            Log in
          </Link>
          <Link
            className="border border-[#d7a66e] bg-[#dbaa70] px-[12px] py-[10px] text-[#15120d] transition-colors hover:bg-[#efbd82] md:px-[15px]"
            href="/signup"
          >
            Sign up
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-[1100px] grid-cols-1 items-center gap-[34px] py-[55px] md:min-h-[590px] md:grid-cols-[minmax(0,1fr)_minmax(260px,360px)] md:gap-[8%] md:pb-[76px] md:pt-[60px]">
        <div className="max-w-[640px]">
          <p className="mb-[25px] flex items-center gap-[10px] font-mono text-[10px] tracking-[.17em] text-[#d2b58f]">
            <span className="size-[6px] rounded-full bg-[#d6a467] shadow-[0_0_12px_rgba(214,164,103,.7)]" />
            A CALMER WAY TO TALK ABOUT HEALTH
          </p>
          <h1 className="mb-[22px] text-[clamp(50px,12vw,68px)] font-medium leading-[1.02] tracking-[-.06em] md:text-[clamp(52px,6.5vw,82px)]">
            Questions about
            <br />
            your health?
            <br />
            <em className="font-display font-medium text-[#d8aa75]">
              Start here.
            </em>
          </h1>
          <p className="max-w-[480px] text-[15px] leading-[1.85] text-[#b1bbb6]">
            Aayu Hub is a welcoming place to share what is bothering you, ask
            health questions, and find a clearer next step.
          </p>
          <div className="mt-[30px] flex flex-col items-start gap-[18px] sm:flex-row sm:items-center sm:gap-[26px]">
            <Link
              className="inline-flex min-h-[49px] items-center justify-between gap-[35px] bg-[#dbaa70] px-[17px] text-xs font-semibold text-[#15120d] transition-colors hover:bg-[#efbd82]"
              href="/signup"
            >
              Create an account{" "}
              <span className="text-[17px]" aria-hidden="true">
                →
              </span>
            </Link>
            <a
              className="text-xs text-[#d3d5ce] transition-colors hover:text-[#e7b77e]"
              href="#how-it-works"
            >
              Explore Aayu Hub{" "}
              <span className="ml-2 text-[#d7a66e]" aria-hidden="true">
                ↓
              </span>
            </a>
          </div>
          <p className="mt-[19px] text-[10px] text-[#7f8b86]">
            Not sure where to begin? Just start with what you’re feeling.
          </p>
        </div>

        <aside
          className="relative min-h-[270px] max-w-[420px] overflow-hidden border border-[#d7a66e]/25 bg-[linear-gradient(145deg,rgba(28,45,43,.94),rgba(15,24,25,.94))] p-[27px] shadow-[0_25px_80px_rgba(0,0,0,.2)]"
          aria-label="Example health question"
        >
          <div className="flex items-center gap-[10px] font-mono text-[9px] tracking-[.15em] text-[#aab4ae]">
            <span
              className="font-sans text-[19px] text-[#dbaa70]"
              aria-hidden="true"
            >
              ✳
            </span>{" "}
            A SPACE TO ASK
          </div>
          <p className="relative z-10 my-[35px] font-display text-[23px] font-medium leading-[1.48] text-[#f0eee7]">
            “I’ve had a headache for a few days. What should I keep track of?”
          </p>
          <div className="h-px w-[42px] bg-[#d7a66e]" />
          <p className="relative z-10 mt-4 text-[10px] text-[#9fa9a4]">
            Every concern deserves to be heard.
          </p>
          <div
            className="pointer-events-none absolute -bottom-[76px] -right-10 size-[190px] rounded-full border border-[#d7a66e]/[.13]"
            aria-hidden="true"
          >
            <span className="absolute inset-5 rounded-full border border-[#d7a66e]/[.12]" />
            <span className="absolute inset-10 rounded-full border border-[#d7a66e]/[.12]" />
            <span className="absolute inset-[60px] rounded-full border border-[#d7a66e]/[.12]" />
          </div>
        </aside>
      </section>

      <section
        className="mx-auto grid max-w-[1100px] gap-7 border-t border-white/10 py-[42px] md:grid-cols-[minmax(210px,.75fr)_1.8fr] md:gap-[8%]"
        id="how-it-works"
      >
        <div>
          <p className="mb-[17px] font-mono text-[10px] tracking-[.17em] text-[#d2b58f]">
            HOW AAYU HUB HELPS
          </p>
          <h2 className="text-[34px] font-medium leading-[1.1] tracking-[-.04em]">
            Make room for
            <br />
            <em className="font-display text-[#d8aa75]">your questions.</em>
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-[22px]">
          {steps.map((step) => (
            <article
              className="grid grid-cols-[35px_1fr] gap-x-2 sm:block"
              key={step.number}
            >
              <span className="font-mono text-[10px] tracking-[.1em] text-[#d7a66e]">
                {step.number}
              </span>
              <h3 className="mb-[7px] text-[13px] font-medium text-[#e7e5dd] sm:mt-[15px]">
                {step.title}
              </h3>
              <p className="col-start-2 text-[11px] leading-[1.75] text-[#929e99] sm:col-auto">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <footer className="mx-auto flex max-w-[1100px] flex-col gap-3 border-t border-white/10 py-[18px] font-mono text-[9px] tracking-[.07em] text-[#77827e] md:flex-row md:justify-between">
        <span className="whitespace-nowrap">
          AAYU HUB <span className="text-[#d7a66e]">·</span> A PLACE TO ASK
        </span>
        <span>
          For urgent or emergency symptoms, contact your local emergency
          service.
        </span>
      </footer>
    </main>
  );
}
