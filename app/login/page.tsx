import Link from "next/link";
import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_82%_30%,#172b2b_0%,#0c1516_44%,#0b1113_78%)] px-[6%] md:px-[8%]">
      <header className="flex min-h-[88px] items-center justify-between border-b border-white/10">
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
        <span className="font-mono text-[9px] tracking-[.15em] text-[#9da9a5]">
          <span className="mr-[7px] text-[#d7a66e]" aria-hidden="true">
            ⌑
          </span>{" "}
          SECURE PATIENT PORTAL
        </span>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-156px)] max-w-[1100px] grid-cols-1 items-center gap-[35px] py-12 md:grid-cols-[1fr_minmax(320px,430px)] md:gap-[10%] md:py-[55px]">
        <div className="max-w-[560px]">
          <p className="flex items-center gap-[10px] font-mono text-[10px] tracking-[.17em] text-[#d2b58f]">
            <span className="size-[6px] rounded-full bg-[#d6a467] shadow-[0_0_12px_rgba(214,164,103,.7)]" />{" "}
            YOUR CARE, IN ONE PLACE
          </p>
          <h1 className="my-[25px] text-[58px] font-medium leading-[1.02] tracking-[-.055em] md:text-[clamp(52px,6vw,78px)]">
            Your health,
            <br />
            <em className="font-display font-medium text-[#d8aa75]">
              within reach.
            </em>
          </h1>
          <p className="text-sm leading-[1.8] text-[#aeb8b3]">
            Sign in to view your patient information and care details.
          </p>
          <div className="mt-[25px] flex items-center gap-[14px] text-xs leading-[1.7] text-[#aeb8b3] md:mt-[46px]">
            <span
              className="grid size-8 shrink-0 place-items-center rounded-full border border-[#e7a85b]/40 text-[#e7a85b]"
              aria-hidden="true"
            >
              ✓
            </span>
            <p>
              <strong className="text-[13px] font-medium text-[#e6e3db]">
                Private by design
              </strong>
              <br />
              Your information is only shown after you sign in.
            </p>
          </div>
        </div>

        <div className="border border-white/[.11] bg-[rgba(15,24,25,.82)] p-[27px] shadow-[0_24px_80px_rgba(0,0,0,.2)] md:p-9">
          <div className="flex items-center gap-[11px]">
            <span
              className="grid size-[30px] place-items-center bg-[#e7a85b]/10 text-[#dfb47f]"
              aria-hidden="true"
            >
              ↗
            </span>
            <p className="font-mono text-[10px] tracking-[.17em] text-[#d2b58f]">
              WELCOME BACK
            </p>
          </div>
          <h2 className="mb-2 mt-6 text-[29px] font-medium tracking-[-.03em]">
            Sign in
          </h2>
          <p className="mb-6 text-xs leading-[1.7] text-[#9da9a5]">
            Use your patient ID or username to continue.
          </p>
          <LoginForm />
          <p className="mt-5 border-t border-white/[.09] pt-4 text-[10px] leading-[1.8] text-[#8e9994]">
            Demo access:{" "}
            <strong className="font-medium text-[#c9c9bf]">AAYU-1001</strong> /{" "}
            <strong className="font-medium text-[#c9c9bf]">Patient@123</strong>
          </p>
        </div>
      </section>

      <footer className="flex flex-col gap-3 border-t border-white/10 py-[19px] font-mono text-[9px] tracking-[.08em] text-[#77827e] md:flex-row md:justify-between">
        <span>
          AAYU HUB <span className="text-[#d7a66e]">·</span> PATIENT PORTAL
        </span>
        <span>
          For demonstration only — do not enter real health information.
        </span>
      </footer>
    </main>
  );
}
