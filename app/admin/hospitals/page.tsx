import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2, KeyRound, MapPin, Pencil, Plus } from "lucide-react";
import AdminNav from "@/components/admin-nav";
import { getHospitalAccountSummaries, hasAdminSession } from "@/lib/auth";
import { getHospitals } from "@/lib/hospitals";

export default async function AdminHospitalsPage() {
  if (!(await hasAdminSession())) redirect("/login");
  const [hospitals, accounts] = await Promise.all([
    getHospitals(),
    getHospitalAccountSummaries(),
  ]);
  const hospitalAccountIds = new Set(accounts.map((account) => account.hospitalId));

  return (
    <main className="min-h-screen bg-[#f7f9f6] text-[#243b34]">
      <AdminNav />
      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.13em] text-[#48816e]">Directory management</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">Hospitals</h1>
            <p className="mt-3 text-base leading-7 text-[#66766e]">{hospitals.length} hospital{hospitals.length === 1 ? "" : "s"} in the public directory.</p>
          </div>
          <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#286d5c] px-5 text-sm font-semibold text-white hover:bg-[#205b4d]" href="/admin/hospitals/new">
            <Plus size={18} /> Add hospital
          </Link>
        </div>

        {hospitals.length ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {hospitals.map((hospital) => (
              <article className="rounded-2xl border border-[#e2e8e1] bg-white p-5 shadow-sm sm:p-6" key={hospital.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#eaf4ed] text-[#39806d]"><Building2 size={20} /></span>
                    <div>
                      <h2 className="text-lg font-semibold text-[#2c433a]">{hospital.name}</h2>
                      <p className="mt-1 flex items-start gap-1 text-sm text-[#738078]">
                        <MapPin className="mt-0.5 shrink-0" size={15} />
                        {[hospital.city, hospital.state].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Link className="inline-flex items-center gap-1 rounded-lg border border-[#d6dfd8] px-3 py-2 text-sm font-medium text-[#347361] hover:bg-[#f2f7f3]" href={`/admin/hospitals/${hospital.id}/account`}>
                      <KeyRound size={15} /> {hospitalAccountIds.has(hospital.id) ? "Account" : "Set up login"}
                    </Link>
                    <Link className="inline-flex items-center gap-1 rounded-lg border border-[#d6dfd8] px-3 py-2 text-sm font-medium text-[#347361] hover:bg-[#f2f7f3]" href={`/admin/hospitals/${hospital.id}/edit`}>
                      <Pencil size={15} /> Edit
                    </Link>
                  </div>
                </div>
                <p className="mt-4 line-clamp-2 text-sm leading-6 text-[#687970]">{hospital.description}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-[#cbd9ce] bg-white p-8 text-center sm:p-12">
            <Building2 className="mx-auto text-[#6b927c]" size={32} />
            <h2 className="mt-4 text-xl font-semibold text-[#2c433a]">No hospitals added</h2>
            <p className="mt-2 text-base text-[#687970]">Add a hospital to publish its contact and service details in the directory.</p>
            <Link className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#286d5c] px-5 py-3 text-sm font-semibold text-white hover:bg-[#205b4d]" href="/admin/hospitals/new">
              <Plus size={17} /> Add first hospital
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
