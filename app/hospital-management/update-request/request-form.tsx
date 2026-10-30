"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Clock3, Send } from "lucide-react";
import type { Hospital } from "@/lib/hospitals";
import type { HospitalUpdateRequest } from "@/lib/hospital-management-types";

function requestStatus(status: HospitalUpdateRequest["status"]) {
  if (status === "pending") return "Pending review";
  if (status === "approved") return "Approved";
  return "Not approved";
}

export default function HospitalUpdateRequestForm({
  hospital,
  requests,
}: {
  hospital: Hospital;
  requests: HospitalUpdateRequest[];
}) {
  const router = useRouter();
  const [requestHistory, setRequestHistory] = useState(requests);
  const [feedback, setFeedback] = useState("");
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputClass = "mt-2 h-12 w-full rounded-xl border border-[#d6dfd8] bg-white px-4 text-base text-[#263b33] outline-none focus:border-[#39806d] focus:ring-2 focus:ring-[#39806d]/20";
  const areaClass = "mt-2 w-full rounded-xl border border-[#d6dfd8] bg-white px-4 py-3 text-base leading-6 text-[#263b33] outline-none focus:border-[#39806d] focus:ring-2 focus:ring-[#39806d]/20";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setSaving(true);
    setFeedback("");
    setFailed(false);
    const formData = new FormData(event.currentTarget);
    const proposedInfo = {
      name: String(formData.get("name") ?? ""),
      description: String(formData.get("description") ?? ""),
      address: String(formData.get("address") ?? ""),
      city: String(formData.get("city") ?? ""),
      state: String(formData.get("state") ?? ""),
      postalCode: String(formData.get("postalCode") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      website: String(formData.get("website") ?? ""),
      specialties: String(formData.get("specialties") ?? "")
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      emergencyServices: formData.get("emergencyServices") === "on",
    };

    try {
      const response = await fetch("/api/hospital-management/update-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposedInfo,
          message: formData.get("message"),
        }),
      });
      const result = (await response.json()) as {
        error?: string;
        request?: HospitalUpdateRequest;
      };
      if (!response.ok) {
        setFailed(true);
        setFeedback(result.error ?? "Could not submit the update request.");
        return;
      }
      setFeedback("Request submitted for administrator review.");
      if (result.request) {
        setRequestHistory((current) => [result.request!, ...current]);
      }
      form.reset();
      router.refresh();
    } catch {
      setFailed(true);
      setFeedback("Could not reach the server. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-7 grid items-start gap-6 lg:grid-cols-[1.4fr_.8fr]">
      <form className="rounded-2xl border border-[#e2e8e1] bg-white p-5 shadow-sm sm:p-7" onSubmit={handleSubmit}>
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[#2c433a]">Proposed directory information</h2>
          <p className="mt-1 text-sm leading-6 text-[#738078]">Complete fields with the current correct information. This creates a review request; it does not immediately publish changes.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-[#40564c] sm:col-span-2">
            Hospital name
            <input className={inputClass} name="name" defaultValue={hospital.name} maxLength={150} required />
          </label>
          <label className="text-sm font-medium text-[#40564c] sm:col-span-2">
            Description
            <textarea className={areaClass} name="description" defaultValue={hospital.description} maxLength={1000} rows={3} />
          </label>
          <label className="text-sm font-medium text-[#40564c] sm:col-span-2">
            Street address
            <input className={inputClass} name="address" defaultValue={hospital.address} maxLength={250} required />
          </label>
          <label className="text-sm font-medium text-[#40564c]">
            City
            <input className={inputClass} name="city" defaultValue={hospital.city} maxLength={100} required />
          </label>
          <label className="text-sm font-medium text-[#40564c]">
            State / region
            <input className={inputClass} name="state" defaultValue={hospital.state} maxLength={100} />
          </label>
          <label className="text-sm font-medium text-[#40564c]">
            Postal code
            <input className={inputClass} name="postalCode" defaultValue={hospital.postalCode} maxLength={20} />
          </label>
          <label className="text-sm font-medium text-[#40564c]">
            Contact phone
            <input className={inputClass} name="phone" type="tel" defaultValue={hospital.phone} maxLength={40} />
          </label>
          <label className="text-sm font-medium text-[#40564c] sm:col-span-2">
            Website
            <input className={inputClass} name="website" type="url" defaultValue={hospital.website} maxLength={500} />
          </label>
          <label className="text-sm font-medium text-[#40564c] sm:col-span-2">
            Specialties and services (one per line)
            <textarea className={areaClass} name="specialties" defaultValue={hospital.specialties.join("\n")} rows={3} />
          </label>
        </div>
        <label className="mt-5 flex items-center gap-3 text-sm font-medium text-[#40564c]">
          <input className="size-4 accent-[#286d5c]" name="emergencyServices" type="checkbox" defaultChecked={hospital.emergencyServices} />
          Emergency services are available
        </label>
        <label className="mt-5 block text-sm font-medium text-[#40564c]">
          Note for the reviewer
          <textarea className={areaClass} name="message" rows={3} maxLength={1000} placeholder="Briefly explain what changed or provide verification context." />
        </label>
        {feedback && (
          <p className={`mt-4 flex items-center gap-2 text-sm ${failed ? "text-[#b42318]" : "text-[#347361]"}`} role={failed ? "alert" : "status"}>
            {failed ? <AlertCircle size={17} /> : <CheckCircle2 size={17} />} {feedback}
          </p>
        )}
        <button className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#286d5c] px-5 text-sm font-semibold text-white hover:bg-[#205b4d] disabled:opacity-70" disabled={saving} type="submit">
          <Send size={17} /> {saving ? "Submitting..." : "Submit for review"}
        </button>
      </form>

      <aside className="rounded-2xl border border-[#e2e8e1] bg-white p-5 shadow-sm sm:p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-[#2c433a]">
          <Clock3 size={19} className="text-[#39806d]" /> Request history
        </h2>
        <p className="mt-1 text-sm text-[#738078]">Updates appear here after the page refreshes.</p>
        {requestHistory.length ? (
          <ul className="mt-4 space-y-3">
            {requestHistory.map((request) => (
              <li className="rounded-xl border border-[#e8ede7] bg-[#fcfdfb] p-4" key={request.id}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-[#849087]">{new Date(request.createdAt).toLocaleDateString()}</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${request.status === "pending" ? "bg-[#fff3df] text-[#9a6d25]" : request.status === "approved" ? "bg-[#eaf4ed] text-[#347361]" : "bg-[#fbecea] text-[#a64f43]"}`}>
                    {requestStatus(request.status)}
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold text-[#40564c]">{request.proposedInfo.name}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#738078]">{request.message || "No reviewer note supplied."}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-xl bg-[#f7f9f6] p-4 text-sm text-[#738078]">No update requests submitted yet.</p>
        )}
      </aside>
    </div>
  );
}
