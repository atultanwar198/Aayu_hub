import { redirect } from "next/navigation";
import HospitalNav from "@/components/hospital-nav";
import { getCurrentHospitalSession } from "@/lib/auth";
import { getHospitalUpdateRequests } from "@/lib/hospital-management";
import { getHospital } from "@/lib/hospitals";
import HospitalUpdateRequestForm from "./request-form";

export default async function HospitalUpdateRequestPage() {
  const session = await getCurrentHospitalSession();
  if (!session) redirect("/hospital-management/login");
  const hospital = await getHospital(session.hospitalId);
  if (!hospital) redirect("/hospital-management/login");
  const requests = await getHospitalUpdateRequests(hospital.id);

  return (
    <main className="min-h-screen bg-[#f5f8f5] text-[#243b34]">
      <HospitalNav hospitalName={hospital.name} />
      <section className="mx-auto max-w-5xl px-5 py-9 sm:px-8 sm:py-12">
        <div>
          <p className="text-sm font-bold uppercase tracking-[.13em] text-[#48816e]">Hospital directory</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">Request an information update</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#66766e]">
            Submit proposed changes for review. Your public directory listing changes only after an Aayu Hub admin approves the request.
          </p>
        </div>
        <HospitalUpdateRequestForm hospital={hospital} requests={requests} />
      </section>
    </main>
  );
}
