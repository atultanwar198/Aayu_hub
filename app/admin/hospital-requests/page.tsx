import { redirect } from "next/navigation";
import AdminNav from "@/components/admin-nav";
import { hasAdminSession } from "@/lib/auth";
import { getHospitalUpdateRequests } from "@/lib/hospital-management";
import { getHospitals } from "@/lib/hospitals";
import HospitalRequestReview from "./request-review";

export default async function HospitalUpdateRequestsPage() {
  if (!(await hasAdminSession())) redirect("/login");
  const [requests, hospitals] = await Promise.all([
    getHospitalUpdateRequests(),
    getHospitals(),
  ]);
  const hospitalNames = Object.fromEntries(
    hospitals.map((hospital) => [hospital.id, hospital.name]),
  );

  return (
    <main className="min-h-screen bg-[#f7f9f6] text-[#243b34]">
      <AdminNav />
      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
        <p className="text-sm font-bold uppercase tracking-[.13em] text-[#48816e]">Hospital directory</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">Information update requests</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[#66766e]">
          Review proposed changes from hospital staff. Approving a request publishes its proposed information in the public directory.
        </p>
        <HospitalRequestReview
          initialRequests={requests.map((request) => ({
            ...request,
            hospitalName: hospitalNames[request.hospitalId] ?? "Unknown hospital",
          }))}
        />
      </section>
    </main>
  );
}
