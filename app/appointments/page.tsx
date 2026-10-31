import { redirect } from "next/navigation";
import SiteFooter from "@/components/site-footer";
import { getCurrentPatient } from "@/lib/auth";
import { getPatientAppointments } from "@/lib/hospital-management";
import { getHospitals } from "@/lib/hospitals";
import PatientNavigation from "@/app/patients/patient-navigation";
import AppointmentBooking from "./appointment-booking";
import "leaflet/dist/leaflet.css";

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ specialty?: string | string[] }>;
}) {
  const patient = await getCurrentPatient();
  if (!patient) redirect("/login");

  const params = await searchParams;
  const [hospitals, appointments] = await Promise.all([
    getHospitals(),
    getPatientAppointments(patient.patientId),
  ]);
  const requestedSpecialty = Array.isArray(params.specialty)
    ? params.specialty[0]
    : params.specialty;
  const specialties = [
    "Emergency",
    "General Medicine",
    ...new Set(hospitals.flatMap((hospital) => hospital.specialties)),
  ];
  const initialSpecialty =
    specialties.find(
      (specialty) =>
        specialty.toLowerCase() === requestedSpecialty?.trim().toLowerCase(),
    ) ?? "";

  return (
    <main className="min-h-screen bg-[#f7f9f6] text-[#243b34]">
      <PatientNavigation activePage="appointments" />
      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <p className="text-sm font-bold uppercase tracking-[.13em] text-[#48816e]">
          Patient appointments
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">
          Find care that fits your journey, {patient.fullName.split(" ")[0]}.
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-[#66766e] sm:text-lg">
          Choose a care area to see only hospitals listing that specialty.
          Your browser asks for location permission when this page opens, then
          matching hospitals are ordered by driving distance.
        </p>
        <AppointmentBooking
          hospitals={hospitals}
          initialAppointments={appointments}
          patientName={patient.fullName}
          initialSpecialty={initialSpecialty}
        />
        <SiteFooter note="Appointment requests are not confirmed until the hospital contacts you. Route times are estimates, not guarantees. For emergencies, contact local emergency services." />
      </section>
    </main>
  );
}
