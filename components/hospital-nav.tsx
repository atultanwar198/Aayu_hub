"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, LogOut } from "lucide-react";

const links = [
  { href: "/hospital-management", label: "Overview" },
  { href: "/hospital-management/appointments", label: "Appointments" },
  { href: "/hospital-management/update-request", label: "Update information" },
];

export default function HospitalNav({ hospitalName }: { hospitalName: string }) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function logout() {
    setError("");
    try {
      const response = await fetch("/api/hospital-management/logout", {
        method: "POST",
      });
      if (!response.ok) {
        setError("Unable to sign out. Please try again.");
        return;
      }
      router.replace("/hospital-management/login");
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
    }
  }

  return (
    <header className="border-b border-[#e5e9e3] bg-white">
      <div className="mx-auto flex min-h-[76px] max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Link className="flex min-w-0 items-center gap-3" href="/hospital-management">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e6f1e9] text-[#357465]">
            <Building2 size={21} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold text-[#183d38]">Hospital workspace</span>
            <span className="block max-w-[220px] truncate text-xs text-[#738078]">{hospitalName}</span>
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1" aria-label="Hospital workspace navigation">
          {links.map(({ href, label }) => (
            <Link
              className="rounded-lg px-3 py-2 text-sm font-medium text-[#52645e] transition hover:bg-[#f2f7f3] hover:text-[#287360]"
              href={href}
              key={href}
            >
              {label}
            </Link>
          ))}
          <button
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#d6dfd8] bg-white px-3 text-sm font-medium text-[#40564c] hover:bg-[#f5f8f4]"
            onClick={logout}
            type="button"
          >
            <LogOut size={16} /> Sign out
          </button>
        </nav>
      </div>
      {error && <p className="mx-auto max-w-7xl px-5 pb-2 text-sm text-[#b42318]" role="alert">{error}</p>}
    </header>
  );
}
