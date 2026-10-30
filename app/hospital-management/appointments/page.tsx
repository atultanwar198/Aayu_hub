import { redirect } from "next/navigation";
import HospitalNav from "@/components/hospital-nav";
import { getCurrentHospitalSession } from "@/lib/auth";
import { getHospitalAppointments } from "@/lib/hospital-management";
import { getHospital } from "@/lib/hospitals";
import AppointmentManager from "./appointment-manager";

export default async function HospitalAppointmentsPage() {
  const session = await getCurrentHospitalSession();
  if (!session) redirect("/hospital-management/login");
  const hospital = await getHospital(session.hospitalId);
  if (!hospital) redirect("/hospital-management/login");
  const appointments = await getHospitalAppointments(hospital.id);

  return (
    <main className="min-h-screen bg-[#f5f8f5] text-[#243b34]">
      <HospitalNav hospitalName={hospital.name} />
      <section className="mx-auto max-w-7xl px-5 py-9 sm:px-8 sm:py-12">
        <div>
          <p className="text-sm font-bold uppercase tracking-[.13em] text-[#48816e]">Schedule management</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">Appointments</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#66766e]">
            View all appointments for {hospital.name}, identify emergency-priority visits, and update appointment status.
          </p>
        </div>
        <p className="mt-6 rounded-xl border border-[#f0dfc0] bg-[#fffaf0] px-4 py-3 text-sm leading-6 text-[#705a35]">
          Demo data only: patient details and appointments below are fictional examples. Do not use for clinical decisions.
        </p>
        <AppointmentManager initialAppointments={appointments} />
      </section>
    </main>
  );
}
