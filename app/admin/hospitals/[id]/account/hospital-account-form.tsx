"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, KeyRound } from "lucide-react";

export default function HospitalAccountForm({
  hospitalId,
}: {
  hospitalId: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch(`/api/admin/hospitals/${encodeURIComponent(hospitalId)}/account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.get("username"),
          password: formData.get("password"),
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "Could not save hospital account.");
        return;
      }
      router.push("/admin/hospitals");
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "mt-2 h-12 w-full rounded-xl border border-[#d6dfd8] bg-white px-4 text-base text-[#263b33] outline-none focus:border-[#39806d] focus:ring-2 focus:ring-[#39806d]/20";

  return (
    <form className="mt-6 rounded-2xl border border-[#e2e8e1] bg-white p-5 shadow-sm sm:p-7" onSubmit={handleSubmit}>
      <label className="block text-sm font-medium text-[#40564c]">
        Hospital sign-in username
        <input className={inputClass} name="username" autoComplete="username" minLength={3} maxLength={100} required />
      </label>
      <label className="mt-5 block text-sm font-medium text-[#40564c]">
        Set a password
        <input className={inputClass} name="password" type="password" autoComplete="new-password" minLength={12} maxLength={256} required />
        <span className="mt-1 block text-xs font-normal text-[#738078]">Use at least 12 characters. Passwords are stored as secure hashes.</span>
      </label>
      {error && (
        <p className="mt-4 flex items-center gap-2 text-sm text-[#b42318]" role="alert">
          <AlertCircle size={17} /> {error}
        </p>
      )}
      {!error && (
        <p className="mt-4 flex items-center gap-2 text-xs leading-5 text-[#738078]">
          <CheckCircle2 size={16} /> Existing patient and admin accounts remain separate.
        </p>
      )}
      <button className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#286d5c] px-5 text-sm font-semibold text-white hover:bg-[#205b4d] disabled:opacity-70" disabled={saving} type="submit">
        <KeyRound size={17} /> {saving ? "Saving credentials..." : "Save hospital credentials"}
      </button>
    </form>
  );
}
