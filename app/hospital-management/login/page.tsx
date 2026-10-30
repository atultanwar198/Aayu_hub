import { redirect } from "next/navigation";
import { Building2, ShieldCheck } from "lucide-react";
import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";
import { getCurrentHospitalSession } from "@/lib/auth";
import HospitalLoginForm from "./hospital-login-form";

export default async function HospitalLoginPage() {
  if (await getCurrentHospitalSession()) redirect("/hospital-management");

  return (
    <main className="min-h-screen bg-[#f7f9f6] px-5 text-[#243b34] sm:px-8">
      <SiteNav variant="back" />
      <section className="mx-auto grid min-h-[calc(100vh-150px)] max-w-5xl items-center gap-10 py-12 md:grid-cols-[1fr_minmax(320px,430px)] md:gap-16">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#dce9df] bg-white px-4 py-2 text-sm font-semibold text-[#347361]">
            <Building2 size={17} /> Hospital staff workspace
          </p>
          <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-[-.04em] sm:text-5xl">
            Your hospital,
            <br />
            <span className="text-[#39806d]">in one place.</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-[#596b64]">
            Review appointments, manage their status, and request changes to your hospital directory information.
          </p>
          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#dce9df] bg-white p-5 text-sm leading-6 text-[#596b64]">
            <ShieldCheck className="mt-0.5 shrink-0 text-[#39806d]" size={20} />
            <p>Hospital accounts are created by an Aayu Hub administrator. Your workspace only shows information for your hospital.</p>
          </div>
        </div>
        <div className="rounded-3xl border border-[#e2e8e1] bg-white p-6 shadow-[0_24px_70px_rgba(47,78,66,.10)] sm:p-9">
          <h2 className="text-2xl font-semibold text-[#243b34]">Staff sign in</h2>
          <p className="mt-2 text-sm leading-6 text-[#687970]">Use the username and password provided by your administrator.</p>
          <HospitalLoginForm />
          <div className="mt-6 rounded-xl border border-[#f0dfc0] bg-[#fffaf0] p-4 text-xs leading-5 text-[#705a35]">
            <p className="font-semibold">Local demo accounts only</p>
            <p className="mt-2">Medanta: <code>medanta-demo</code></p>
            <p>Fortis: <code>fortis-demo</code></p>
            <p>Artemis: <code>artemis-demo</code></p>
            <p className="mt-2">Demo password: <code>HospitalDemo@2026</code></p>
            <p className="mt-2">Do not use these credentials or sample records in a public deployment.</p>
          </div>
        </div>
      </section>
      <SiteFooter note="Hospital workspace demo. Appointment records are fictional sample data and are not for clinical use." />
    </main>
  );
}
