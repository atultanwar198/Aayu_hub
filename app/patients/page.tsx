import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  HeartPulse,
  MapPin,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import SiteFooter from "@/components/site-footer";
import { getCurrentPatient } from "@/lib/auth";
import { getPatientAppointments } from "@/lib/hospital-management";
import { getHospitals } from "@/lib/hospitals";
import PatientNavigation from "./patient-navigation";

function formatAppointmentDate(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "Date to be confirmed";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function PatientPage() {
  const patient = await getCurrentPatient();
  if (!patient) redirect("/login");

  const [appointments, hospitals] = await Promise.all([
    getPatientAppointments(patient.patientId),
    getHospitals(),
  ]);
  const upcoming = appointments.filter(
    (appointment) =>
      appointment.status !== "cancelled" &&
      appointment.status !== "completed",
  );
  const firstAppointment = upcoming[0];
  const firstAppointmentHospital = firstAppointment
    ? hospitals.find((hospital) => hospital.id === firstAppointment.hospitalId)
    : undefined;
  const firstName = patient.fullName.trim().split(/\s+/)[0] || "there";

  return (
    <main className="min-h-screen bg-[#f7f9f6] text-[#243b34]">
      <PatientNavigation activePage="overview" />

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <section className="relative overflow-hidden rounded-[30px] bg-[#173f37] px-6 py-8 text-white shadow-[0_24px_70px_rgba(27,71,59,.16)] sm:px-10 sm:py-10">
          <div
            className="pointer-events-none absolute -right-20 -top-32 size-80 rounded-full border border-white/10"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -right-4 -top-16 size-56 rounded-full border border-white/10"
            aria-hidden="true"
          />
          <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-[#d3e8da]">
                <Sparkles size={14} /> YOUR PATIENT SPACE
              </p>
              <h1 className="mt-5 text-3xl font-semibold tracking-[-.045em] sm:text-5xl">
                Welcome back, {firstName}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#d2e0d9] sm:text-base">
                Your care details, upcoming visits, and next steps in one place.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 md:justify-end">
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-[#205b4d] shadow-sm transition hover:bg-[#edf5ef] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#173f37]"
                href="/appointments"
              >
                <CalendarDays size={17} /> Find a hospital
              </Link>
              <Link
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/25 px-5 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white"
                href="/chatbot"
              >
                Ask a question <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </section>

        <section
          className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Patient summary"
        >
          <article className="flex items-center gap-4 rounded-2xl border border-[#e5eae4] bg-white p-5 shadow-sm">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#edf5ef] text-[#39806d]">
              <UserRound size={20} />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-[#89968e]">
                Patient
              </p>
              <p className="mt-1 truncate font-semibold text-[#2c433a]">
                {patient.fullName}
              </p>
              <p className="mt-0.5 text-xs text-[#738078]">{patient.patientId}</p>
            </div>
          </article>
          <article className="flex items-center gap-4 rounded-2xl border border-[#e5eae4] bg-white p-5 shadow-sm">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#eff1fa] text-[#596ca5]">
              <CalendarDays size={20} />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#89968e]">
                Date of birth
              </p>
              <p className="mt-1 font-semibold text-[#2c433a]">
                {patient.dateOfBirth || "Not provided"}
              </p>
            </div>
          </article>
          <article className="flex items-center gap-4 rounded-2xl border border-[#e5eae4] bg-white p-5 shadow-sm">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#fff3e2] text-[#b77d31]">
              <TriangleAlert size={20} />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#89968e]">
                Allergies
              </p>
              <p className="mt-1 font-semibold text-[#2c433a]">
                {patient.allergies.length
                  ? `${patient.allergies.length} on record`
                  : "None listed"}
              </p>
            </div>
          </article>
          <article className="flex items-center gap-4 rounded-2xl border border-[#e5eae4] bg-white p-5 shadow-sm">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#f2effa] text-[#78629c]">
              <HeartPulse size={20} />
            </span>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-[#89968e]">
                Health record
              </p>
              <p className="mt-1 font-semibold text-[#2c433a]">
                {patient.conditions.length}{" "}
                {patient.conditions.length === 1 ? "condition" : "conditions"}
              </p>
            </div>
          </article>
        </section>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,.8fr)]">
          <section
            className="rounded-2xl border border-[#e5eae4] bg-white p-5 shadow-sm sm:p-7"
            aria-labelledby="next-visit-heading"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.13em] text-[#48816e]">
                  Your care
                </p>
                <h2
                  className="mt-1 text-xl font-semibold text-[#243b34]"
                  id="next-visit-heading"
                >
                  {firstAppointment ? "Upcoming appointment" : "Plan your next visit"}
                </h2>
              </div>
              <span className="grid size-10 place-items-center rounded-xl bg-[#edf5ef] text-[#39806d]">
                <CalendarDays size={19} />
              </span>
            </div>

            {firstAppointment ? (
              <div className="mt-5 rounded-xl bg-[#f5f8f4] p-4 sm:p-5">
                <p className="font-semibold text-[#2c433a]">
                  {firstAppointmentHospital?.name ?? "Hospital"}
                </p>
                <p className="mt-1 text-sm text-[#738078]">
                  {firstAppointment.department}
                </p>
                <p className="mt-3 flex items-center gap-2 text-sm text-[#52645e]">
                  <Clock3 size={15} className="text-[#48816e]" />
                  {formatAppointmentDate(firstAppointment.scheduledAt)}
                </p>
                <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#fff4df] px-3 py-1.5 text-xs font-semibold capitalize text-[#8a682e]">
                  {firstAppointment.status === "confirmed" ? (
                    <Check size={13} />
                  ) : (
                    <Clock3 size={13} />
                  )}
                  {firstAppointment.status.replaceAll("_", " ")}
                </p>
              </div>
            ) : (
              <div className="mt-5 rounded-xl bg-[#f5f8f4] p-4 sm:p-5">
                <p className="text-sm leading-6 text-[#687970]">
                  Browse nearby hospitals by care area and route distance, then
                  send an appointment request.
                </p>
                <Link
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#347361] hover:text-[#205b4d]"
                  href="/appointments"
                >
                  Find a hospital <ArrowRight size={15} />
                </Link>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#286d5c] px-4 text-sm font-semibold text-white transition hover:bg-[#205b4d]"
                href="/appointments"
              >
                View appointments <ArrowRight size={15} />
              </Link>
              {firstAppointmentHospital?.address && (
                <span className="inline-flex items-center gap-1.5 text-sm text-[#738078]">
                  <MapPin size={15} /> {firstAppointmentHospital.city}
                </span>
              )}
            </div>
          </section>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-[#dce9df] bg-[#edf5ef] p-5 sm:p-6">
              <span className="grid size-11 place-items-center rounded-2xl bg-white text-[#39806d] shadow-sm">
                <HeartPulse size={20} />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-[#2c433a]">
                Your health record
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#687970]">
                Review allergies, conditions, medications, and your emergency
                contact in one private page.
              </p>
              <Link
                className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#286d5c] px-4 text-sm font-semibold text-white transition hover:bg-[#205b4d]"
                href="/patients/health"
              >
                Open health record <ArrowRight size={16} />
              </Link>
            </section>

            <section className="rounded-2xl border border-[#e5eae4] bg-white p-5 shadow-sm">
              <div className="flex gap-3">
                <ShieldCheck
                  className="mt-0.5 shrink-0 text-[#4d8975]"
                  size={18}
                />
                <div>
                  <h2 className="text-sm font-semibold text-[#354b41]">
                    A note about this demo
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-[#738078]">
                    Patient records are sample data. Don’t enter real medical
                    information. Aayu Hub is not emergency care or a substitute
                    for a clinician.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>

        <div className="mt-10">
          <SiteFooter note="Aayu Hub provides general health information, not medical diagnosis or emergency care. Talk to a qualified healthcare professional about your personal health." />
        </div>
      </div>
    </main>
  );
}
