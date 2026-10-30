import Link from "next/link";
import SignupForm from "./signup-form";

export default function Signup() {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[radial-gradient(ellipse_at_75%_50%,#152729_0%,#0b1113_58%)] px-[7%] md:px-[8.2%]">
      <nav className="relative z-10 flex items-center justify-between border-b border-white/10 py-[25px] md:py-[34px]">
        <Link className="text-[17px] font-bold tracking-[.22em]" href="/">
          AAYU <span className="text-[#e7a85b]">HUB</span>
        </Link>
        <Link className="text-[13px] text-[#e9e5dc]" href="/">
          ← Back to Aayu Hub
        </Link>
      </nav>
      <section className="relative z-10 m-auto w-full max-w-[460px] py-[45px] md:py-[54px]">
        <p className="flex items-center gap-[11px] font-mono text-[11px] tracking-[.19em] text-[#d4b991]">
          <span className="inline-block size-[7px] rounded-full bg-[#e7a85b] shadow-[0_0_14px_#e7a85b]" />{" "}
          STAY CONNECTED
        </p>
        <h1 className="my-[26px] text-[clamp(52px,6vw,72px)] font-medium leading-[.99] tracking-[-.055em]">
          Be here
          <br />
          <em className="font-display font-medium text-[#e6b778]">
            for your health.
          </em>
        </h1>
        <p className="mb-[30px] max-w-[390px] text-sm leading-[1.8] text-[#c2c2bc]">
          Leave your details to hear more about Aayu Hub and ways to get support
          with your health questions.
        </p>
        <SignupForm />
      </section>
      <div
        className="pointer-events-none absolute -right-[12%] -bottom-[35%] size-[55vw] rounded-full bg-[rgba(194,132,66,.08)] blur-[100px]"
        aria-hidden="true"
      />
    </main>
  );
}
