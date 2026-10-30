"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/signup", {
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
        setError(
          result.error ?? "Unable to create your account. Please try again.",
        );
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-[10px]">
      <label className="mt-2 text-xs text-[#d2cec5]" htmlFor="fullName">
        Your name
      </label>
      <input
        className="h-[50px] border border-white/[.18] bg-white/[.04] px-[14px] text-sm text-[#f4f0e8] outline-none placeholder:text-[#777c7b] focus:border-[#e7a85b]"
        id="fullName"
        name="fullName"
        type="text"
        placeholder="Alex Morgan"
        autoComplete="name"
        maxLength={100}
        required
      />
      <label className="mt-2 text-xs text-[#d2cec5]" htmlFor="email">
        Email address (used to sign in)
      </label>
      <input
        className="h-[50px] border border-white/[.18] bg-white/[.04] px-[14px] text-sm text-[#f4f0e8] outline-none placeholder:text-[#777c7b] focus:border-[#e7a85b]"
        id="email"
        name="email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        maxLength={254}
        required
      />
      <label className="mt-2 text-xs text-[#d2cec5]" htmlFor="password">
        Password
      </label>
      <input
        className="h-[50px] border border-white/[.18] bg-white/[.04] px-[14px] text-sm text-[#f4f0e8] outline-none placeholder:text-[#777c7b] focus:border-[#e7a85b]"
        id="password"
        name="password"
        type="password"
        placeholder="At least 8 characters"
        autoComplete="new-password"
        minLength={8}
        maxLength={256}
        required
      />
      {error && (
        <p className="mt-[3px] text-xs text-[#f0a39a]" role="alert">
          {error}
        </p>
      )}
      <button
        className="mt-4 flex min-h-[52px] w-full items-center justify-between border-0 bg-[#e7a85b] px-[21px] text-[13px] font-semibold text-[#15120d] transition-colors hover:bg-[#f0bd7f] disabled:cursor-wait disabled:opacity-70"
        type="submit"
        disabled={loading}
      >
        {loading ? "Creating account..." : "Create account"}{" "}
        <span className="text-lg" aria-hidden="true">
          →
        </span>
      </button>
      <p className="text-[11px] leading-[1.6] text-[#818886]">
        Demo account details are stored in local JSON files on this server.
      </p>
    </form>
  );
}
