import Link from "next/link";
import AdminLogoutButton from "@/app/admin/login/logout-button";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/patients", label: "Patient records" },
  { href: "/admin/hospitals", label: "Hospitals" },
  { href: "/admin/hospital-requests", label: "Info requests" },
];

export default function AdminNav() {
  return (
    <header className="border-b border-[#e5e9e3] bg-white">
      <div className="mx-auto flex min-h-[76px] max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <div>
          <Link className="text-sm font-bold tracking-[-.02em] text-[#183d38]" href="/">
            Aayu Hub
          </Link>
          <p className="text-xs text-[#738078]">Admin console</p>
        </div>
        <nav className="flex flex-wrap items-center gap-2 sm:gap-4" aria-label="Admin navigation">
          {links.map(({ href, label }) => (
            <Link
              className="rounded-lg px-3 py-2 text-sm font-medium text-[#52645e] transition hover:bg-[#f2f7f3] hover:text-[#287360]"
              href={href}
              key={href}
            >
              {label}
            </Link>
          ))}
          <AdminLogoutButton />
        </nav>
      </div>
    </header>
  );
}
