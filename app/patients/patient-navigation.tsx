import Link from "next/link";
import SiteNav from "@/components/site-nav";
import LogoutButton from "./logout-button";

type PatientNavigationProps = {
  activePage: "overview" | "health" | "appointments";
};

const links = [
  { id: "overview", label: "Overview", href: "/patients" },
  { id: "health", label: "Health record", href: "/patients/health" },
  { id: "appointments", label: "Appointments", href: "/appointments" },
] as const;

export default function PatientNavigation({
  activePage,
}: PatientNavigationProps) {
  return (
    <SiteNav variant="back" backHref="/" backLabel="Aayu Hub">
      <div className="flex min-w-0 items-center gap-2">
        <nav
          aria-label="Patient dashboard"
          className="flex min-w-0 items-center gap-1 overflow-x-auto"
        >
          {links.map((link) => {
            const active = link.id === activePage;
            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-10 shrink-0 items-center rounded-xl px-2.5 text-xs font-semibold transition sm:px-3 sm:text-sm ${
                  active
                    ? "bg-[#eaf4ed] text-[#286d5c]"
                    : "text-[#65766d] hover:bg-[#f2f7f3] hover:text-[#286d5c]"
                }`}
                href={link.href}
                key={link.id}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <LogoutButton />
      </div>
    </SiteNav>
  );
}
