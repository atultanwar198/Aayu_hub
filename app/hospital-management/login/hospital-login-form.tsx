"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function HospitalLoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/hospital-management/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.get("username"),
          password: formData.get("password"),
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "Unable to sign in. Please try again.");
        return;
      }
      router.replace("/hospital-management");
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "mt-2 h-12 w-full rounded-xl border border-[#d6dfd8] bg-white px-4 text-base text-[#263b33] outline-none focus:border-[#39806d] focus:ring-2 focus:ring-[#39806d]/20";

  return (
    <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
      <label className="text-sm font-medium text-[#40564c]">
        Username
        <input className={inputClass} name="username" autoComplete="username" maxLength={100} required />
      </label>
      <label className="text-sm font-medium text-[#40564c]">
        Password
        <input className={inputClass} name="password" type="password" autoComplete="current-password" maxLength={256} required />
      </label>
      {error && <p className="text-sm text-[#b42318]" role="alert">{error}</p>}
      <button className="mt-1 flex min-h-12 items-center justify-between rounded-xl bg-[#286d5c] px-4 text-base font-semibold text-white hover:bg-[#205b4d] disabled:opacity-70" disabled={loading} type="submit">
        {loading ? "Signing in..." : "Sign in to workspace"} <ArrowRight size={18} />
      </button>
    </form>
  );
}
