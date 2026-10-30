import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Building2,
  ClipboardCheck,
  ClipboardPlus,
  FileHeart,
  MapPin,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import AdminNav from "@/components/admin-nav";
import { getAdminPatientRecords, hasAdminSession } from "@/lib/auth";
import { getHospitalUpdateRequests } from "@/lib/hospital-management";
import { getHospitals } from "@/lib/hospitals";

const cardClass =
  "rounded-2xl border border-[#e2e8e1] bg-white p-5 shadow-[0_8px_24px_rgba(47,78,66,.04)] sm:p-6";

export default async function AdminPage() {
  if (!(await hasAdminSession())) redirect("/login");

  const [records, hospitals, updateRequests] = await Promise.all([
    getAdminPatientRecords(),
    getHospitals(),
    getHospitalUpdateRequests(),
  ]);
  const profilesAdded = records.filter(({ patient }) =>
    patient?.fullName.trim(),
  ).length;
  const emergencyHospitals = hospitals.filter(
    (hospital) => hospital.emergencyServices,
  ).length;
  const specialtiesCount = new Set(
    hospitals.flatMap((hospital) => hospital.specialties),
  ).size;
  const citiesCount = new Set(
    hospitals
      .map((hospital) => hospital.city.trim().toLowerCase())
      .filter(Boolean),
  ).size;
  const pendingRequests = updateRequests.filter(
    (request) => request.status === "pending",
  ).length;

  const stats = [
    {
      label: "User accounts",
      value: records.length,
      detail: "Registered patient accounts",
      icon: Users,
      tone: "bg-[#eaf4ed] text-[#39806d]",
    },
    {
      label: "Patient profiles",
      value: profilesAdded,
      detail: `${records.length - profilesAdded} need profile details`,
      icon: FileHeart,
      tone: "bg-[#edf1fb] text-[#5b6eaa]",
    },
    {
      label: "Hospitals",
      value: hospitals.length,
      detail: `${citiesCount} ${citiesCount === 1 ? "city" : "cities"} listed`,
      icon: Building2,
      tone: "bg-[#fbf1e1] text-[#ac762e]",
    },
    {
      label: "Emergency services",
      value: emergencyHospitals,
      detail: `${specialtiesCount} listed ${specialtiesCount === 1 ? "specialty" : "specialties"}`,
      icon: ShieldCheck,
      tone: "bg-[#f9ecea] text-[#a75c50]",
    },
    {
      label: "Info requests",
      value: pendingRequests,
      detail: "Hospital updates awaiting review",
      icon: ClipboardCheck,
      tone: "bg-[#fff3df] text-[#9a6d25]",
    },
  ];

  const actions = [
    {
      href: "/admin/users/new",
      title: "Add a user",
      description: "Create an account and its patient profile.",
      icon: UserPlus,
    },
    {
      href: "/admin/hospitals/new",
      title: "Add a hospital",
      description: "Publish a verified hospital directory listing.",
      icon: Building2,
    },
    {
      href: "/admin/patients",
      title: "Edit patient records",
      description: "Review and update patient information.",
      icon: ClipboardPlus,
    },
  ];

  return (
    <main className="min-h-screen bg-[#f4f7f3] text-[#243b34]">
      <AdminNav />
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-11">
        <div className="relative overflow-hidden rounded-[28px] bg-[#205b4d] px-6 py-8 text-white shadow-[0_20px_50px_rgba(32,91,77,.18)] sm:px-9 sm:py-10">
          <div className="pointer-events-none absolute -right-12 -top-28 size-72 rounded-full border-[40px] border-white/[.06]" />
          <div className="pointer-events-none absolute -bottom-36 right-40 size-64 rounded-full bg-[#84ae91]/20 blur-3xl" />
          <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[.13em] text-[#d9eee0]">
                <ShieldCheck size={15} /> Aayu Hub administration
              </p>
              <h1 className="mt-5 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">
                Dashboard overview
              </h1>
              <p className="mt-3 max-w-xl text-base leading-7 text-[#e1eee5]">
                A clear view of patient accounts and the hospital directory,
                with the tools to keep information up to date.
              </p>
            </div>
            <Link
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-[#205b4d] transition hover:bg-[#edf5ef]"
              href="/hospitals"
            >
              View public directory <ArrowRight size={17} />
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {stats.map(({ label, value, detail, icon: Icon, tone }) => (
            <article className={cardClass} key={label}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[#687970]">{label}</p>
                  <p className="mt-3 text-3xl font-semibold tracking-[-.04em] text-[#243b34]">
                    {value}
                  </p>
                </div>
                <span
                  className={`grid size-11 place-items-center rounded-xl ${tone}`}
                >
                  <Icon size={21} />
                </span>
              </div>
              <p className="mt-3 text-xs leading-5 text-[#849087]">{detail}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 grid items-start gap-6 xl:grid-cols-[1.4fr_.8fr]">
          <section className={cardClass}>
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.13em] text-[#6b8d78]">
                  Quick actions
                </p>
                <h2 className="mt-2 text-xl font-semibold text-[#2c433a]">
                  What would you like to manage?
                </h2>
              </div>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {actions.map(({ href, title, description, icon: Icon }) => (
                <Link
                  className="group rounded-xl border border-[#e7ece6] bg-[#fcfdfb] p-4 transition hover:-translate-y-0.5 hover:border-[#bed5c5] hover:bg-[#f8fbf8] hover:shadow-sm"
                  href={href}
                  key={title}
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-[#eaf4ed] text-[#39806d]">
                    <Icon size={19} />
                  </span>
                  <h3 className="mt-4 flex items-center justify-between gap-2 text-sm font-semibold text-[#2c433a]">
                    {title}
                    <ArrowRight
                      className="shrink-0 text-[#65927a] transition group-hover:translate-x-1"
                      size={16}
                    />
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-[#738078]">
                    {description}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          <section className={cardClass}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.13em] text-[#6b8d78]">
                  Patient accounts
                </p>
                <h2 className="mt-2 text-xl font-semibold text-[#2c433a]">
                  Account directory
                </h2>
              </div>
              <Link
                className="text-sm font-semibold text-[#347361] hover:text-[#205b4d]"
                href="/admin/users"
              >
                View all
              </Link>
            </div>
            {records.length ? (
              <ul className="mt-4 divide-y divide-[#edf0eb]">
                {records.slice(0, 5).map((record) => (
                  <li
                    className="flex items-center gap-3 py-3"
                    key={record.userId}
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#edf5ef] text-xs font-bold text-[#347361]">
                      {record.username.slice(0, 1).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#40564c]">
                        {record.username}
                      </p>
                      <p className="truncate text-xs text-[#87948c]">
                        {record.userId}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${record.patient?.fullName ? "bg-[#edf5ef] text-[#347361]" : "bg-[#fbf1e1] text-[#916b32]"}`}
                    >
                      {record.patient?.fullName
                        ? "Profile added"
                        : "Needs details"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-5 rounded-xl bg-[#f7f9f6] p-5 text-center">
                <Users className="mx-auto text-[#8ca795]" size={23} />
                <p className="mt-2 text-sm text-[#738078]">
                  No user accounts to show yet.
                </p>
              </div>
            )}
          </section>
        </div>

        <section className={`${cardClass} mt-6`}>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.13em] text-[#6b8d78]">
                Hospital directory
              </p>
              <h2 className="mt-2 text-xl font-semibold text-[#2c433a]">
                Directory snapshot
              </h2>
              <p className="mt-1 text-sm text-[#738078]">
                Hospital information currently available to visitors.
              </p>
            </div>
            <Link
              className="inline-flex min-h-10 items-center justify-center gap-2 self-start rounded-lg border border-[#d6dfd8] px-4 text-sm font-semibold text-[#347361] transition hover:bg-[#f2f7f3] sm:self-auto"
              href="/admin/hospitals"
            >
              Manage hospitals <ArrowRight size={16} />
            </Link>
          </div>
          {hospitals.length ? (
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {hospitals.slice(0, 3).map((hospital) => (
                <article
                  className="rounded-xl border border-[#e7ece6] bg-[#fcfdfb] p-4"
                  key={hospital.id}
                >
                  <div className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#fbf1e1] text-[#ac762e]">
                      <Building2 size={18} />
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-[#40564c]">
                        {hospital.name}
                      </h3>
                      <p className="mt-1 flex items-center gap-1 text-xs text-[#849087]">
                        <MapPin size={13} />{" "}
                        {[hospital.city, hospital.state]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-2 text-xs leading-5 text-[#738078]">
                    {hospital.specialties.length
                      ? hospital.specialties.slice(0, 3).join(" · ")
                      : "No specialties listed"}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 flex flex-col items-start justify-between gap-4 rounded-xl bg-[#f7f9f6] p-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-semibold text-[#40564c]">
                  The directory is ready for its first listing.
                </p>
                <p className="mt-1 text-xs leading-5 text-[#738078]">
                  Add verified hospital details to make them visible to
                  visitors.
                </p>
              </div>
              <Link
                className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg bg-[#286d5c] px-4 text-sm font-semibold text-white hover:bg-[#205b4d]"
                href="/admin/hospitals/new"
              >
                Add a hospital <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
