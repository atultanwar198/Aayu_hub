import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, KeyRound } from "lucide-react";
import AdminNav from "@/components/admin-nav";
import {
  getHospitalAccountSummaries,
  hasAdminSession,
} from "@/lib/auth";
import { getHospital } from "@/lib/hospitals";
import HospitalAccountForm from "./hospital-account-form";

export default async function HospitalAccountPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await hasAdminSession())) redirect("/login");
  const { id } = await params;
  const [hospital, accounts] = await Promise.all([
    getHospital(id),
    getHospitalAccountSummaries(),
  ]);
  if (!hospital) notFound();

  const account = accounts.find((entry) => entry.hospitalId === id);

  return (
    <main className="min-h-screen bg-[#f7f9f6] text-[#243b34]">
      <AdminNav />
      <section className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-12">
        <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[#347361] hover:text-[#205b4d]" href="/admin/hospitals">
          <ArrowLeft size={17} /> Back to hospitals
        </Link>
        <div className="mt-6 flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#eaf4ed] text-[#39806d]">
            <KeyRound size={23} />
          </span>
          <div>
            <p className="text-sm font-bold uppercase tracking-[.13em] text-[#48816e]">Hospital access</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">Management account</h1>
            <p className="mt-2 text-base text-[#66766e]">{hospital.name}</p>
          </div>
        </div>
        {account && (
          <p className="mt-6 rounded-xl border border-[#dce9df] bg-white p-4 text-sm text-[#52645e]">
            Current sign-in username: <strong>{account.username}</strong>. Saving a new password replaces the previous credentials.
          </p>
        )}
        {!account && (
          <p className="mt-6 rounded-xl border border-[#f0dfc0] bg-[#fffaf0] p-4 text-sm leading-6 text-[#705a35]">
            No hospital account exists yet. Create credentials below and share them securely with the authorized hospital contact.
          </p>
        )}
        <HospitalAccountForm hospitalId={id} />
      </section>
    </main>
  );
}
