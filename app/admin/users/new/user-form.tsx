"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Save } from "lucide-react";

export default function AdminUserForm() {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFeedback("");
    setFailed(false);
    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.get("fullName"),
          email: formData.get("email"),
          password: formData.get("password"),
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setFailed(true);
        setFeedback(result.error ?? "Could not create this account.");
        return;
      }

      router.push("/admin/users");
      router.refresh();
    } catch {
      setFailed(true);
      setFeedback("Could not reach the server. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "mt-2 h-12 w-full rounded-xl border border-[#d6dfd8] bg-white px-4 text-base text-[#263b33] outline-none focus:border-[#39806d] focus:ring-2 focus:ring-[#39806d]/20";

  return (
    <form className="mt-8 rounded-2xl border border-[#e2e8e1] bg-white p-5 shadow-sm sm:p-7" onSubmit={handleSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-medium text-[#40564c]">
          Full name
          <input className={inputClass} name="fullName" maxLength={100} autoComplete="name" required />
        </label>
        <label className="text-sm font-medium text-[#40564c]">
          Email / username
          <input className={inputClass} name="email" type="email" maxLength={254} autoComplete="email" required />
        </label>
        <label className="text-sm font-medium text-[#40564c] sm:col-span-2">
          Temporary password
          <input className={inputClass} name="password" type="password" minLength={8} maxLength={256} autoComplete="new-password" required />
          <span className="mt-1 block text-xs font-normal text-[#738078]">At least 8 characters. Share it securely with the user.</span>
        </label>
      </div>
      {feedback && (
        <p className={`mt-5 flex items-center gap-2 text-sm ${failed ? "text-[#b42318]" : "text-[#347361]"}`} role={failed ? "alert" : "status"}>
          {failed ? <AlertCircle size={17} /> : <CheckCircle2 size={17} />} {feedback}
        </p>
      )}
      <button className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#286d5c] px-5 text-base font-semibold text-white hover:bg-[#205b4d] disabled:opacity-70" disabled={saving} type="submit">
        <Save size={18} /> {saving ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
