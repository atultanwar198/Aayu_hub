import { redirect } from "next/navigation";
import {
  CalendarDays,
  Droplets,
  HeartPulse,
  Phone,
  Pill,
  ShieldCheck,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import SiteFooter from "@/components/site-footer";
import { getCurrentPatient } from "@/lib/auth";
import PatientNavigation from "../patient-navigation";

export default async function PatientHealthPage() {
  const patient = await getCurrentPatient();
  if (!patient) redirect("/login");

  return (
    <main className="min-h-screen bg-[#f7f9f6] text-[#243b34]">
      <PatientNavigation activePage="health" />
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <section className="rounded-[28px] border border-[#dce9df] bg-white p-6 shadow-sm sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[.13em] text-[#48816e]">
            Your information
          </p>
          <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-semibold tracking-[-.045em] text-[#243b34] sm:text-4xl">
                Health record
              </h1>
              <p className="mt-2 text-base leading-7 text-[#66766e]">
                A clear view of the health details saved to your patient
                profile.
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#edf5ef] px-4 py-3 text-sm font-semibold text-[#347361]">
              <UserRound size={17} /> {patient.fullName}
            </span>
          </div>
        </section>

        <section
          className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Personal health details"
        >
          <article className="rounded-2xl border border-[#e5eae4] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[#edf5ef] text-[#39806d]">
                <UserRound size={18} />
              </span>
              <p className="text-sm font-medium text-[#738078]">Full name</p>
            </div>
            <p className="mt-4 text-lg font-semibold text-[#2c433a]">
              {patient.fullName}
            </p>
            <p className="mt-1 text-xs text-[#89968e]">
              Patient ID · {patient.patientId}
            </p>
          </article>
          <article className="rounded-2xl border border-[#e5eae4] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[#eff1fa] text-[#596ca5]">
                <CalendarDays size={18} />
              </span>
              <p className="text-sm font-medium text-[#738078]">Date of birth</p>
            </div>
            <p className="mt-4 text-lg font-semibold text-[#2c433a]">
              {patient.dateOfBirth || "Not provided"}
            </p>
          </article>
          <article className="rounded-2xl border border-[#e5eae4] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-[#fff3e2] text-[#b77d31]">
                <Droplets size={18} />
              </span>
              <p className="text-sm font-medium text-[#738078]">Blood type</p>
            </div>
            <p className="mt-4 text-lg font-semibold text-[#2c433a]">
              {patient.bloodType || "Not provided"}
            </p>
          </article>
        </section>

        <section
          className="mt-10"
          aria-labelledby="health-details-heading"
        >
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[.13em] text-[#48816e]">
              Care details
            </p>
            <h2
              className="mt-1 text-2xl font-semibold tracking-[-.035em] text-[#243b34]"
              id="health-details-heading"
            >
              Health information
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-[#f0dfc7] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-[#fff3e2] text-[#b77d31]">
                  <TriangleAlert size={19} />
                </span>
                <div>
                  <h3 className="font-semibold text-[#2c433a]">Allergies</h3>
                  <p className="text-xs text-[#89968e]">
                    Important information to share with a clinician
                  </p>
                </div>
              </div>
              {patient.allergies.length ? (
                <ul className="mt-5 flex flex-wrap gap-2">
                  {patient.allergies.map((allergy) => (
                    <li
                      className="rounded-full bg-[#fff5e8] px-3 py-1.5 text-sm font-medium text-[#815b28]"
                      key={allergy}
                    >
                      {allergy}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm leading-6 text-[#738078]">
                  No allergies are listed in this record.
                </p>
              )}
            </article>

            <article className="rounded-2xl border border-[#e5eae4] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-[#eaf4ed] text-[#39806d]">
                  <HeartPulse size={19} />
                </span>
                <div>
                  <h3 className="font-semibold text-[#2c433a]">Conditions</h3>
                  <p className="text-xs text-[#89968e]">Health conditions on file</p>
                </div>
              </div>
              {patient.conditions.length ? (
                <ul className="mt-5 flex flex-wrap gap-2">
                  {patient.conditions.map((condition) => (
                    <li
                      className="rounded-full bg-[#eef6f0] px-3 py-1.5 text-sm font-medium text-[#386a54]"
                      key={condition}
                    >
                      {condition}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm leading-6 text-[#738078]">
                  No conditions have been added to this record.
                </p>
              )}
            </article>

            <article className="rounded-2xl border border-[#e5eae4] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-[#eff1fa] text-[#596ca5]">
                  <Pill size={19} />
                </span>
                <div>
                  <h3 className="font-semibold text-[#2c433a]">Medications</h3>
                  <p className="text-xs text-[#89968e]">Current medications on file</p>
                </div>
              </div>
              {patient.medications.length ? (
                <ul className="mt-5 space-y-4">
                  {patient.medications.map((medication) => (
                    <li
                      className="border-t border-[#edf0eb] pt-3 first:border-0 first:pt-0"
                      key={medication.name}
                    >
                      <p className="font-semibold text-[#40564c]">
                        {medication.name}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[#738078]">
                        {medication.instructions}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm leading-6 text-[#738078]">
                  No medications have been added to this record.
                </p>
              )}
            </article>

            <article className="rounded-2xl border border-[#e5eae4] bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-[#edf5ef] text-[#39806d]">
                  <Phone size={19} />
                </span>
                <div>
                  <h3 className="font-semibold text-[#2c433a]">
                    Emergency contact
                  </h3>
                  <p className="text-xs text-[#89968e]">Your chosen contact</p>
                </div>
              </div>
              {patient.emergencyContact.name ||
              patient.emergencyContact.phone ? (
                <div className="mt-5 border-t border-[#edf0eb] pt-3">
                  <p className="font-semibold text-[#40564c]">
                    {patient.emergencyContact.name || "Name not provided"}
                  </p>
                  <p className="mt-1 text-sm text-[#738078]">
                    {[
                      patient.emergencyContact.relationship,
                      patient.emergencyContact.phone,
                    ]
                      .filter(Boolean)
                      .join(" · ") || "Contact details not provided"}
                  </p>
                </div>
              ) : (
                <p className="mt-4 text-sm leading-6 text-[#738078]">
                  No emergency contact has been added.
                </p>
              )}
            </article>
          </div>
        </section>

        <p className="mt-6 flex items-start gap-2 rounded-2xl border border-[#e5eae4] bg-white p-4 text-sm leading-6 text-[#738078]">
          <ShieldCheck className="mt-0.5 shrink-0 text-[#4d8975]" size={17} />
          This demo uses sample records. Don’t enter real medical information.
          Contact a qualified healthcare professional about personal care.
        </p>

        <div className="mt-10">
          <SiteFooter />
        </div>
      </div>
    </main>
  );
}
