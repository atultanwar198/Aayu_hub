import { Sparkles } from "lucide-react";
import SignupForm from "./signup-form";
import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";

export default function Signup() {
  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_75%_25%,#e6f1e9_0%,#fbfaf7_50%,#f8f6f0_100%)] px-5 sm:px-8">
      <SiteNav variant="back" backLabel="Back to Aayu Hub" />
      <section className="mx-auto grid min-h-[calc(100vh-80px)] max-w-5xl items-center gap-12 py-12 md:grid-cols-2 md:gap-16">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#dce9df] bg-white/80 px-4 py-2 text-sm font-semibold text-[#347361]">
            <Sparkles size={16} /> Stay connected
          </p>
          <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-[-.04em] text-[#1e3531] sm:text-5xl">
            Create your account<br /><span className="text-[#39806d]">with Aayu Hub.</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-[#596b64]">
            Access your patient portal. Your new profile starts with no health details; you can add information when you are ready.
          </p>
        </div>
        <div className="rounded-3xl border border-[#e2e8e1] bg-white p-6 shadow-[0_24px_70px_rgba(47,78,66,.10)] sm:p-9">
          <h2 className="mb-2 text-2xl font-semibold text-[#243b34]">Create your account</h2>
          <p className="mb-6 text-base leading-7 text-[#687970]">Enter your details to set up secure access.</p>
          <SignupForm />
          <p className="mt-5 text-center text-sm text-[#687970]">
            Already have an account?{" "}
            <Link className="font-semibold text-[#347361] hover:text-[#205b4d]" href="/login">
              Sign in
            </Link>
          </p>
        </div>
      </section>
      <SiteFooter note="This signup form is for demonstration only. It does not store or send your information." />
    </main>
  );
}
