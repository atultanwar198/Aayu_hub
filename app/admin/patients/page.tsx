import { redirect } from "next/navigation";
import AdminNav from "@/components/admin-nav";
import { getAdminPatientRecords, hasAdminSession } from "@/lib/auth";
import AdminDashboard from "../dashboard";

export default async function AdminPatientsPage() {
  if (!(await hasAdminSession())) redirect("/login");

  const records = await getAdminPatientRecords();

  return (
    <main className="min-h-screen bg-[#f7f9f6] text-[#243b34]">
      <AdminNav />
      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[.13em] text-[#48816e]">
            Patient management
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">
            Patient records
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#66766e]">
            View account IDs and update the patient information linked to each
            account. Passwords are never displayed.
          </p>
        </div>
        <AdminDashboard initialRecords={records} />
      </section>
    </main>
  );
}
