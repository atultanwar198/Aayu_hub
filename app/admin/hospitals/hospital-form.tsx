"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Save } from "lucide-react";
import type { Hospital } from "@/lib/hospitals";

export default function AdminHospitalForm({ hospital }: { hospital?: Hospital }) {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const inputClass = "mt-2 h-12 w-full rounded-xl border border-[#d6dfd8] bg-white px-4 text-base text-[#263b33] outline-none focus:border-[#39806d] focus:ring-2 focus:ring-[#39806d]/20";
  const areaClass = "mt-2 w-full rounded-xl border border-[#d6dfd8] bg-white px-4 py-3 text-base leading-6 text-[#263b33] outline-none focus:border-[#39806d] focus:ring-2 focus:ring-[#39806d]/20";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFeedback("");
    setFailed(false);
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/admin/hospitals", {
        method: hospital ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(hospital ? { id: hospital.id } : {}),
          name: formData.get("name"),
          description: formData.get("description"),
          address: formData.get("address"),
          city: formData.get("city"),
          state: formData.get("state"),
          postalCode: formData.get("postalCode"),
          phone: formData.get("phone"),
          website: formData.get("website"),
          specialties: String(formData.get("specialties") ?? "")
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean),
          emergencyServices: formData.get("emergencyServices") === "on",
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setFailed(true);
        setFeedback(result.error ?? "Could not save this hospital.");
        return;
      }

      router.push("/admin/hospitals");
      router.refresh();
    } catch {
      setFailed(true);
      setFeedback("Could not reach the server. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="mt-8 rounded-2xl border border-[#e2e8e1] bg-white p-5 shadow-sm sm:p-7" onSubmit={handleSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium text-[#40564c] sm:col-span-2">
          Hospital name
          <input className={inputClass} name="name" defaultValue={hospital?.name ?? ""} maxLength={150} required />
        </label>
        <label className="text-sm font-medium text-[#40564c] sm:col-span-2">
          Description
          <textarea className={areaClass} name="description" defaultValue={hospital?.description ?? ""} maxLength={1000} rows={3} />
        </label>
        <label className="text-sm font-medium text-[#40564c] sm:col-span-2">
          Street address
          <input className={inputClass} name="address" defaultValue={hospital?.address ?? ""} maxLength={250} required />
        </label>
        <label className="text-sm font-medium text-[#40564c]">
          City
          <input className={inputClass} name="city" defaultValue={hospital?.city ?? ""} maxLength={100} required />
        </label>
        <label className="text-sm font-medium text-[#40564c]">
          State / region
          <input className={inputClass} name="state" defaultValue={hospital?.state ?? ""} maxLength={100} />
        </label>
        <label className="text-sm font-medium text-[#40564c]">
          Postal code
          <input className={inputClass} name="postalCode" defaultValue={hospital?.postalCode ?? ""} maxLength={20} />
        </label>
        <label className="text-sm font-medium text-[#40564c]">
          Phone
          <input className={inputClass} name="phone" type="tel" defaultValue={hospital?.phone ?? ""} maxLength={40} />
        </label>
        <label className="text-sm font-medium text-[#40564c] sm:col-span-2">
          Website
          <input className={inputClass} name="website" type="url" defaultValue={hospital?.website ?? ""} maxLength={500} placeholder="https://example.org" />
        </label>
        <label className="text-sm font-medium text-[#40564c] sm:col-span-2">
          Specialties / services
          <textarea className={areaClass} name="specialties" defaultValue={hospital?.specialties.join("\n") ?? ""} rows={3} placeholder="One per line" />
        </label>
      </div>
      <label className="mt-5 flex items-center gap-3 text-sm font-medium text-[#40564c]">
        <input className="size-4 accent-[#286d5c]" name="emergencyServices" type="checkbox" defaultChecked={hospital?.emergencyServices ?? false} />
        Emergency services are available
      </label>
      <p className="mt-3 text-xs leading-5 text-[#738078]">Only select emergency services after confirming availability directly with the hospital.</p>
      {feedback && (
        <p className={`mt-5 flex items-center gap-2 text-sm ${failed ? "text-[#b42318]" : "text-[#347361]"}`} role={failed ? "alert" : "status"}>
          {failed ? <AlertCircle size={17} /> : <CheckCircle2 size={17} />} {feedback}
        </p>
      )}
      <button className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#286d5c] px-5 text-base font-semibold text-white hover:bg-[#205b4d] disabled:opacity-70" disabled={saving} type="submit">
        <Save size={18} /> {saving ? "Saving..." : hospital ? "Save changes" : "Add hospital"}
      </button>
    </form>
  );
}
