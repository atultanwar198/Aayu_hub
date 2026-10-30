import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import AdminNav from "@/components/admin-nav";
import { hasAdminSession } from "@/lib/auth";
import AdminUserForm from "./user-form";

export default async function NewAdminUserPage() {
  if (!(await hasAdminSession())) redirect("/login");

  return (
    <main className="min-h-screen bg-[#f7f9f6] text-[#243b34]">
      <AdminNav />
      <section className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-12">
        <Link className="inline-flex items-center gap-2 text-sm font-semibold text-[#347361] hover:text-[#205b4d]" href="/admin/users">
          <ArrowLeft size={17} /> Back to users
        </Link>
        <div className="mt-6">
          <p className="text-sm font-bold uppercase tracking-[.13em] text-[#48816e]">User management</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">Add a user</h1>
          <p className="mt-3 text-base leading-7 text-[#66766e]">Create an account and its blank patient record. The user can sign in with their email and password.</p>
        </div>
        <AdminUserForm />
      </section>
    </main>
  );
}
