import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import AdminNav from "@/components/admin-nav";
import { hasAdminSession } from "@/lib/auth";
import AdminHospitalForm from "../hospital-form";

export default async function NewHospitalPage() {
  if (!(await hasAdminSession())) redirect("/login");

  return (
    <main className="min-h-screen bg-[#f7f9f6] text-[#243b34]">
      <AdminNav />
      <section className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-12">
        <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[#347361] hover:text-[#205b4d]" href="/admin/hospitals">
          <ArrowLeft size={17} /> Back to hospitals
        </Link>
        <div className="mt-6">
          <p className="text-sm font-bold uppercase tracking-[.13em] text-[#48816e]">Directory management</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">Add a hospital</h1>
          <p className="mt-3 text-base leading-7 text-[#66766e]">Information submitted here will be displayed publicly. Verify details with the hospital before publishing.</p>
        </div>
        <AdminHospitalForm />
      </section>
    </main>
  );
}
