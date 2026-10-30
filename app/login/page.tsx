import { HeartPulse, ShieldCheck } from "lucide-react";
import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";
import LoginForm from "./login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_80%_15%,#e6f1e9_0%,#fbfaf7_48%,#f8f6f0_100%)] px-5 sm:px-8">
      <SiteNav variant="back" />

      <section className="mx-auto grid min-h-[calc(100vh-150px)] max-w-5xl items-center gap-10 py-12 md:grid-cols-[1fr_minmax(320px,430px)] md:gap-16 md:py-16">
        <div className="max-w-xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#dce9df] bg-white/80 px-4 py-2 text-sm font-semibold text-[#347361]">
            <ShieldCheck size={17} /> Your care, in one place
          </p>
          <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-[-.04em] text-[#1e3531] sm:text-5xl">
            Your health,<br /><span className="text-[#39806d]">within reach.</span>
          </h1>
          <p className="mt-5 text-lg leading-8 text-[#596b64]">
            Sign in to view your patient information and care details.
          </p>
          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#dce9df] bg-white/80 p-5 text-base leading-7 text-[#596b64]">
            <ShieldCheck className="mt-1 shrink-0 text-[#39806d]" size={21} />
            <p><strong className="font-semibold text-[#2c433a]">Private by design</strong><br />Your information is only shown after you sign in.</p>
          </div>
        </div>

        <div className="rounded-3xl border border-[#e2e8e1] bg-white p-6 shadow-[0_24px_70px_rgba(47,78,66,.10)] sm:p-9">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-[#eaf4ed] text-[#39806d]"><HeartPulse size={22} /></span>
            <p className="text-sm font-semibold uppercase tracking-[.12em] text-[#48816e]">Welcome back</p>
          </div>
          <h2 className="mb-2 mt-6 text-3xl font-semibold tracking-[-.03em] text-[#243b34]">
            Sign in
          </h2>
          <p className="mb-6 text-base leading-7 text-[#687970]">
            Use your patient ID, username, or email to continue.
          </p>
          <LoginForm />
          <p className="mt-5 text-center text-sm text-[#687970]">
            New to Aayu Hub?{" "}
            <Link className="font-semibold text-[#347361] hover:text-[#205b4d]" href="/signup">
              Create an account
            </Link>
          </p>
          <p className="mt-5 rounded-xl bg-[#f5f8f4] p-4 text-sm leading-6 text-[#687970]">
            Demo access: <strong className="font-semibold text-[#405d4e]">AAYU-1001</strong> / <strong className="font-semibold text-[#405d4e]">Patient@123</strong>
          </p>
        </div>
      </section>

      <SiteFooter note="Demo only — do not enter real health information. Aayu Hub does not provide medical diagnosis or emergency care." />
    </main>
  );
}
