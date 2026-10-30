import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, UserPlus, Users } from "lucide-react";
import AdminNav from "@/components/admin-nav";
import { getAdminPatientRecords, hasAdminSession } from "@/lib/auth";

export default async function AdminUsersPage() {
  if (!(await hasAdminSession())) redirect("/login");
  const users = await getAdminPatientRecords();

  return (
    <main className="min-h-screen bg-[#f7f9f6] text-[#243b34]">
      <AdminNav />
      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.13em] text-[#48816e]">User management</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">User accounts</h1>
            <p className="mt-3 text-base leading-7 text-[#66766e]">{users.length} account{users.length === 1 ? "" : "s"} in Aayu Hub.</p>
          </div>
          <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#286d5c] px-5 text-sm font-semibold text-white hover:bg-[#205b4d]" href="/admin/users/new">
            <UserPlus size={18} /> Add user
          </Link>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-[#e2e8e1] bg-white shadow-sm">
          {users.length ? (
            <ul className="divide-y divide-[#e8ede7]">
              {users.map((user) => (
                <li className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6" key={user.userId}>
                  <div className="flex items-start gap-3">
                    <span className="mt-1 grid size-9 shrink-0 place-items-center rounded-xl bg-[#eaf4ed] text-[#39806d]"><Users size={18} /></span>
                    <div>
                      <p className="font-semibold text-[#2c433a]">{user.username}</p>
                      <p className="mt-1 break-all text-sm text-[#738078]">Account: {user.userId} · Patient: {user.patientId}</p>
                    </div>
                  </div>
                  <Link className="inline-flex items-center gap-1 self-start text-sm font-semibold text-[#347361] hover:text-[#205b4d] sm:self-auto" href="/admin/patients">
                    Edit patient record <ArrowRight size={16} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-8 text-center text-[#687970]">No accounts have been added.</p>
          )}
        </div>
      </section>
    </main>
  );
}
