"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: formData.get("userId"),
          password: formData.get("password"),
        }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "Unable to sign in. Please try again.");
        return;
      }

      router.replace("/patients");
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="flex flex-col gap-[10px]" onSubmit={handleSubmit}>
      <label className="mt-2 text-[11px] text-[#d1d6d1]" htmlFor="userId">
        Patient ID or username
      </label>
      <input
        className="h-12 w-full border border-white/[.14] bg-white/[.035] px-[13px] text-xs text-[#f4f0e8] outline-none placeholder:text-[#737d7a] focus:border-[#d7a66e]"
        id="userId"
        name="userId"
        type="text"
        autoComplete="username"
        placeholder="Enter your patient ID or username"
        required
      />
      <label className="mt-2 text-[11px] text-[#d1d6d1]" htmlFor="password">
        Password
      </label>
      <input
        className="h-12 w-full border border-white/[.14] bg-white/[.035] px-[13px] text-xs text-[#f4f0e8] outline-none placeholder:text-[#737d7a] focus:border-[#d7a66e]"
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="Enter your password"
        required
      />
      {error && (
        <p className="mt-[3px] text-xs text-[#f0a39a]" role="alert">
          {error}
        </p>
      )}
      <button
        className="mt-3 flex min-h-[49px] items-center justify-between border-0 bg-[#dbaa70] px-[15px] text-xs font-semibold text-[#15120d] transition-colors hover:bg-[#efbd82] disabled:cursor-wait disabled:opacity-70"
        type="submit"
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign in securely"}
        <span className="text-[17px]" aria-hidden="true">
          →
        </span>
      </button>
    </form>
  );
}
