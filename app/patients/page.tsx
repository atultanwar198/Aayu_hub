import { redirect } from "next/navigation";
import {
  CalendarDays,
  HeartPulse,
  Phone,
  Pill,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { getCurrentPatient } from "@/lib/auth";
import LogoutButton from "./logout-button";
import SiteNav from "@/components/site-nav";
import SiteFooter from "@/components/site-footer";

export default async function PatientPage() {
  const patient = await getCurrentPatient();
  if (!patient) redirect("/login");

  return (
    <main className="min-h-screen bg-[#f7f9f6] text-[#243b34]">
      <SiteNav variant="back" backLabel="Sign out">
        <LogoutButton />
      </SiteNav>

      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.13em] text-[#48816e]">Patient overview</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-.04em] text-[#243b34] sm:text-4xl">
              Hello, <span className="text-[#39806d]">{patient.fullName.split(" ")[0]}.</span>
            </h1>
            <p className="mt-3 text-lg leading-7 text-[#66766e]">Here is your health information at a glance.</p>
          </div>
          <p className="rounded-xl border border-[#dce9df] bg-white px-4 py-3 text-sm text-[#738078]">
            Patient ID <strong className="ml-2 font-semibold text-[#2c433a]">{patient.patientId}</strong>
          </p>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-3" aria-label="Patient details">
          <article className="rounded-2xl border border-[#e5eae4] bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-[#738078]">Full name</p>
            <p className="mt-2 text-lg font-semibold text-[#2c433a]">{patient.fullName}</p>
          </article>
          <article className="rounded-2xl border border-[#e5eae4] bg-white p-5 shadow-sm">
            <p className="flex items-center gap-2 text-sm font-medium text-[#738078]"><CalendarDays size={16} /> Date of birth</p>
            <p className="mt-2 text-lg font-semibold text-[#2c433a]">{patient.dateOfBirth}</p>
          </article>
          <article className="rounded-2xl border border-[#e5eae4] bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-[#738078]">Blood type</p>
            <p className="mt-2 text-lg font-semibold text-[#2c433a]">{patient.bloodType}</p>
          </article>
        </section>
        <SiteFooter note="Demo patient record only. Do not enter real health information. This portal is not for medical advice or emergencies." />

        <section className="mt-4 grid gap-4 md:grid-cols-2" aria-label="Health information">
          <article className="rounded-2xl border border-[#e5eae4] bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-3 text-lg font-semibold text-[#2c433a]">
              <span className="grid size-10 place-items-center rounded-xl bg-[#fff3e2] text-[#b77d31]"><TriangleAlert size={20} /></span> Allergies
            </h2>
            {patient.allergies.length ? (
              <ul className="mt-5 flex flex-wrap gap-2">
                {patient.allergies.map((allergy) => <li className="rounded-full bg-[#fff5e8] px-3 py-2 text-sm font-medium text-[#815b28]" key={allergy}>{allergy}</li>)}
              </ul>
            ) : <p className="mt-4 text-base text-[#687970]">No allergies on record.</p>}
          </article>
          <article className="rounded-2xl border border-[#e5eae4] bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-3 text-lg font-semibold text-[#2c433a]">
              <span className="grid size-10 place-items-center rounded-xl bg-[#eaf4ed] text-[#39806d]"><HeartPulse size={20} /></span> Conditions
            </h2>
            {patient.conditions.length ? (
              <ul className="mt-5 flex flex-wrap gap-2">
                {patient.conditions.map((condition) => <li className="rounded-full bg-[#eef6f0] px-3 py-2 text-sm font-medium text-[#386a54]" key={condition}>{condition}</li>)}
              </ul>
            ) : <p className="mt-4 text-base text-[#687970]">No conditions on record.</p>}
          </article>
          <article className="rounded-2xl border border-[#e5eae4] bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-3 text-lg font-semibold text-[#2c433a]">
              <span className="grid size-10 place-items-center rounded-xl bg-[#eef0fa] text-[#5669a3]"><Pill size={20} /></span> Medications
            </h2>
            {patient.medications.length ? (
              <ul className="mt-5 space-y-4">
                {patient.medications.map((medication) => (
                  <li className="text-base text-[#40564c]" key={medication.name}>
                    <strong className="font-semibold">{medication.name}</strong>
                    <p className="mt-1 leading-6 text-[#687970]">{medication.instructions}</p>
                  </li>
                ))}
              </ul>
            ) : <p className="mt-4 text-base text-[#687970]">No medications on record.</p>}
          </article>
          <article className="rounded-2xl border border-[#e5eae4] bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-3 text-lg font-semibold text-[#2c433a]">
              <span className="grid size-10 place-items-center rounded-xl bg-[#eaf4ed] text-[#39806d]"><Phone size={20} /></span> Emergency contact
            </h2>
            <p className="mt-5 text-base font-semibold text-[#40564c]">{patient.emergencyContact.name}</p>
            <p className="mt-1 text-base leading-6 text-[#687970]">
              {patient.emergencyContact.relationship} · {patient.emergencyContact.phone}
            </p>
          </article>
        </section>

        <p className="mt-6 flex items-start gap-2 text-sm leading-6 text-[#738078]">
          <ShieldCheck className="mt-0.5 shrink-0 text-[#4d8975]" size={17} />
          Demo patient record only. This portal is not for medical advice or emergencies.
        </p>
      </section>
    </main>
  );
}
