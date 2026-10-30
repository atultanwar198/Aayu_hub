import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentPatient } from "@/lib/auth";
import LogoutButton from "./logout-button";

export default async function PatientPage() {
  const patient = await getCurrentPatient();
  if (!patient) redirect("/login");

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_86%_0%,#172b2b_0%,#0c1516_45%,#0b1113_85%)] px-[6%] md:px-[8%]">
      <header className="flex min-h-[88px] items-center justify-between border-b border-white/10">
        <Link
          className="inline-flex items-center gap-[11px] text-[13px] font-bold tracking-[.16em]"
          href="/"
        >
          <span
            className="grid size-[31px] place-items-center border border-[#e7a85b]/65 font-display text-[18px] text-[#e7a85b]"
            aria-hidden="true"
          >
            A
          </span>
          <span>
            AAYU <b className="font-medium text-[#d7a66e]">HUB</b>
          </span>
        </Link>
        <div className="flex items-center gap-3 md:gap-[25px]">
          <span className="hidden font-mono text-[9px] tracking-[.15em] text-[#9da9a5] md:inline">
            <span className="mr-[7px] text-[#d7a66e]" aria-hidden="true">
              ⌑
            </span>{" "}
            SECURE SESSION
          </span>
          <LogoutButton />
        </div>
      </header>

      <section className="mx-auto max-w-[1060px] py-[54px] pb-[70px]">
        <p className="mb-[14px] flex items-center gap-[10px] font-mono text-[10px] tracking-[.17em] text-[#d2b58f]">
          <span className="size-[6px] rounded-full bg-[#d6a467] shadow-[0_0_12px_rgba(214,164,103,.7)]" />{" "}
          PATIENT OVERVIEW
        </p>
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="mb-2 text-[clamp(42px,5vw,58px)] font-medium tracking-[-.055em]">
              Hello,{" "}
              <em className="font-display font-medium text-[#d8aa75]">
                {patient.fullName.split(" ")[0]}.
              </em>
            </h1>
            <p className="text-sm leading-[1.8] text-[#aeb8b3]">
              Here is your health information at a glance.
            </p>
          </div>
          <span className="flex flex-col gap-[7px] font-mono text-[9px] tracking-[.12em] text-[#85918d]">
            PATIENT ID{" "}
            <strong className="text-xs font-normal text-[#e0e0d9]">
              {patient.patientId}
            </strong>
          </span>
        </div>

        <section
          className="mt-[35px] grid grid-cols-1 gap-[14px] md:grid-cols-3"
          aria-label="Patient details"
        >
          <article className="border border-white/10 bg-[rgba(18,28,29,.7)] p-5">
            <p className="mb-3 font-mono text-[9px] tracking-[.12em] text-[#929e99]">
              FULL NAME
            </p>
            <p className="m-0 text-[15px] text-[#f0eee7]">{patient.fullName}</p>
          </article>
          <article className="border border-white/10 bg-[rgba(18,28,29,.7)] p-5">
            <p className="mb-3 font-mono text-[9px] tracking-[.12em] text-[#929e99]">
              DATE OF BIRTH
            </p>
            <p className="m-0 text-[15px] text-[#f0eee7]">
              {patient.dateOfBirth}
            </p>
          </article>
          <article className="border border-white/10 bg-[rgba(18,28,29,.7)] p-5">
            <p className="mb-3 font-mono text-[9px] tracking-[.12em] text-[#929e99]">
              BLOOD TYPE
            </p>
            <p className="m-0 text-[15px] text-[#f0eee7]">
              {patient.bloodType}
            </p>
          </article>
        </section>

        <section
          className="mt-[14px] grid grid-cols-1 gap-[14px] md:grid-cols-2"
          aria-label="Health information"
        >
          <article className="min-h-[148px] border border-white/10 bg-[rgba(18,28,29,.7)] p-[22px]">
            <h2 className="mb-[17px] text-sm font-medium text-[#e9e5dc]">
              Allergies
            </h2>
            {patient.allergies.length ? (
              <ul className="m-0 flex list-none flex-col items-start gap-[10px] p-0">
                {patient.allergies.map((allergy) => (
                  <li
                    className="border border-[#d7a66e]/25 bg-[#d7a66e]/[.06] px-[10px] py-[7px] text-[11px] text-[#d9c5a9]"
                    key={allergy}
                  >
                    {allergy}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="m-0 text-[11px] leading-[1.7] text-[#9da9a5]">
                No allergies on record.
              </p>
            )}
          </article>
          <article className="min-h-[148px] border border-white/10 bg-[rgba(18,28,29,.7)] p-[22px]">
            <h2 className="mb-[17px] text-sm font-medium text-[#e9e5dc]">
              Conditions
            </h2>
            {patient.conditions.length ? (
              <ul className="m-0 flex list-none flex-col items-start gap-[10px] p-0">
                {patient.conditions.map((condition) => (
                  <li
                    className="border border-[#d7a66e]/25 bg-[#d7a66e]/[.06] px-[10px] py-[7px] text-[11px] text-[#d9c5a9]"
                    key={condition}
                  >
                    {condition}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="m-0 text-[11px] leading-[1.7] text-[#9da9a5]">
                No conditions on record.
              </p>
            )}
          </article>
          <article className="min-h-[148px] border border-white/10 bg-[rgba(18,28,29,.7)] p-[22px]">
            <h2 className="mb-[17px] text-sm font-medium text-[#e9e5dc]">
              Medications
            </h2>
            {patient.medications.length ? (
              <ul className="m-0 flex list-none flex-col gap-[10px] p-0">
                {patient.medications.map((medication) => (
                  <li
                    className="flex flex-col gap-[5px] text-xs text-[#d9ddd7]"
                    key={medication.name}
                  >
                    <strong>{medication.name}</strong>
                    <span className="text-[11px] leading-[1.7] text-[#9da9a5]">
                      {medication.instructions}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="m-0 text-[11px] leading-[1.7] text-[#9da9a5]">
                No medications on record.
              </p>
            )}
          </article>
          <article className="min-h-[148px] border border-white/10 bg-[rgba(18,28,29,.7)] p-[22px]">
            <h2 className="mb-[17px] text-sm font-medium text-[#e9e5dc]">
              Emergency contact
            </h2>
            <p className="mb-[5px] text-[13px] text-[#e8e5de]">
              {patient.emergencyContact.name}
            </p>
            <p className="m-0 text-[11px] leading-[1.7] text-[#9da9a5]">
              {patient.emergencyContact.relationship} ·{" "}
              {patient.emergencyContact.phone}
            </p>
          </article>
        </section>
        <p className="mt-[22px] text-[10px] text-[#77827e]">
          Demo patient record only. This portal is not for medical advice or
          emergencies.
        </p>
      </section>
    </main>
  );
}
