import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Siren,
} from "lucide-react";
import HospitalNav from "@/components/hospital-nav";
import { getCurrentHospitalSession } from "@/lib/auth";
import {
  getHospitalAppointments,
  getHospitalUpdateRequests,
} from "@/lib/hospital-management";
import { getHospital } from "@/lib/hospitals";

export default async function HospitalManagementPage() {
  const session = await getCurrentHospitalSession();
  if (!session) redirect("/hospital-management/login");
  const hospital = await getHospital(session.hospitalId);
  if (!hospital) redirect("/hospital-management/login");

  const [appointments, requests] = await Promise.all([
    getHospitalAppointments(hospital.id),
    getHospitalUpdateRequests(hospital.id),
  ]);
  const emergencyCount = appointments.filter(
    (appointment) => appointment.priority === "emergency",
  ).length;
  const todayAppointments = appointments.filter(
    (appointment) =>
      new Date(appointment.scheduledAt).toDateString() ===
      new Date().toDateString(),
  ).length;
  const pendingRequests = requests.filter(
    (request) => request.status === "pending",
  ).length;

  return (
    <main className="min-h-screen bg-[#f5f8f5] text-[#243b34]">
      <HospitalNav hospitalName={hospital.name} />
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-11">
        <div className="rounded-3xl bg-[#205b4d] p-6 text-white shadow-[0_20px_50px_rgba(32,91,77,.16)] sm:p-9">
          <p className="text-sm font-semibold text-[#d3ebdd]">Hospital workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">{hospital.name}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#e2f0e7]">
            Review appointments for your hospital and submit directory updates for administrator approval.
          </p>
          <p className="mt-4 text-xs text-[#c5dfce]">
            Demo workspace: appointment entries and patient details shown here are fictional examples.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard icon={CalendarDays} label="All appointments" value={appointments.length} />
          <SummaryCard icon={Clock3} label="Scheduled today" value={todayAppointments} />
          <SummaryCard icon={Siren} label="Emergency priority" value={emergencyCount} danger />
          <SummaryCard icon={CheckCircle2} label="Pending info requests" value={pendingRequests} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_.8fr]">
          <section className="rounded-2xl border border-[#e2e8e1] bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.13em] text-[#6b8d78]">Appointment overview</p>
                <h2 className="mt-2 text-xl font-semibold text-[#2c433a]">Upcoming schedule</h2>
              </div>
              <Link className="inline-flex items-center gap-1 text-sm font-semibold text-[#347361] hover:text-[#205b4d]" href="/hospital-management/appointments">
                View all appointments <ArrowRight size={16} />
              </Link>
            </div>
            {appointments.length ? (
              <ul className="mt-4 divide-y divide-[#edf0eb]">
                {appointments.slice(0, 5).map((appointment) => (
                  <li className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between" key={appointment.id}>
                    <div className="flex items-start gap-3">
                      <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${appointment.priority === "emergency" ? "bg-[#fff0ec] text-[#b34e3d]" : "bg-[#edf5ef] text-[#39806d]"}`}>
                        {appointment.priority === "emergency" ? <Siren size={19} /> : <CalendarDays size={19} />}
                      </span>
                      <div>
                        <p className="font-semibold text-[#354b41]">{appointment.patientName}</p>
                        <p className="mt-1 text-sm text-[#738078]">{appointment.department} · {appointment.clinician}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <time className="text-sm text-[#687970]">
                        {new Date(appointment.scheduledAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </time>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${appointment.priority === "emergency" ? "bg-[#fff0ec] text-[#a64234]" : "bg-[#f0f5f0] text-[#4c6f58]"}`}>
                        {appointment.priority === "emergency" ? "Emergency" : appointment.status.replace("_", " ")}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-5 rounded-xl bg-[#f7f9f6] p-5 text-sm text-[#738078]">No appointments are currently listed.</p>
            )}
          </section>

          <aside className="space-y-4">
            <Link className="group block rounded-2xl border border-[#e2e8e1] bg-white p-5 shadow-sm transition hover:border-[#c5daca] hover:shadow-md sm:p-6" href="/hospital-management/appointments">
              <span className="grid size-11 place-items-center rounded-xl bg-[#eaf4ed] text-[#39806d]"><CalendarDays size={21} /></span>
              <h2 className="mt-4 flex items-center justify-between text-base font-semibold text-[#2c433a]">
                Manage appointments <ArrowRight className="transition group-hover:translate-x-1" size={17} />
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#738078]">Review patient schedule, identify emergency cases, and update appointment status.</p>
            </Link>
            <Link className="group block rounded-2xl border border-[#e2e8e1] bg-white p-5 shadow-sm transition hover:border-[#c5daca] hover:shadow-md sm:p-6" href="/hospital-management/update-request">
              <span className="grid size-11 place-items-center rounded-xl bg-[#fbf1e1] text-[#ac762e]"><CheckCircle2 size={21} /></span>
              <h2 className="mt-4 flex items-center justify-between text-base font-semibold text-[#2c433a]">
                Request info update <ArrowRight className="transition group-hover:translate-x-1" size={17} />
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#738078]">Send proposed directory changes to Aayu Hub admins for review.</p>
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  danger = false,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <article className="flex items-center gap-4 rounded-2xl border border-[#e2e8e1] bg-white p-5 shadow-sm">
      <span className={`grid size-11 place-items-center rounded-xl ${danger ? "bg-[#fff0ec] text-[#b34e3d]" : "bg-[#eaf4ed] text-[#39806d]"}`}>
        <Icon size={21} />
      </span>
      <div>
        <p className="text-sm text-[#738078]">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-[#2c433a]">{value}</p>
      </div>
    </article>
  );
}
