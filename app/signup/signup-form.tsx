"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="mt-2 text-sm font-medium text-[#40564c]" htmlFor="fullName">
        Your name
      </label>
      <input
        className="h-12 rounded-xl border border-[#d6dfd8] bg-white px-4 text-base text-[#263b33] outline-none placeholder:text-[#89968e] focus:border-[#39806d] focus:ring-2 focus:ring-[#39806d]/20"
        id="fullName"
        name="fullName"
        type="text"
        placeholder="Alex Morgan"
        autoComplete="name"
        maxLength={100}
        required
      />
      <label className="mt-2 text-sm font-medium text-[#40564c]" htmlFor="email">
        Email address (used to sign in)
      </label>
      <input
        className="h-12 rounded-xl border border-[#d6dfd8] bg-white px-4 text-base text-[#263b33] outline-none placeholder:text-[#89968e] focus:border-[#39806d] focus:ring-2 focus:ring-[#39806d]/20"
        id="email"
        name="email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        maxLength={254}
        required
      />
      <label className="mt-2 text-sm font-medium text-[#40564c]" htmlFor="password">
        Password
      </label>
      <input
        className="h-12 rounded-xl border border-[#d6dfd8] bg-white px-4 text-base text-[#263b33] outline-none placeholder:text-[#89968e] focus:border-[#39806d] focus:ring-2 focus:ring-[#39806d]/20"
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
        <p className="mt-1 text-sm text-[#b42318]" role="alert">
          {error}
        </p>
      )}
      <button
        className="mt-3 flex min-h-12 w-full items-center justify-between rounded-xl bg-[#286d5c] px-4 text-base font-semibold text-white transition-colors hover:bg-[#205b4d] focus:outline-none focus:ring-2 focus:ring-[#286d5c] focus:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
        type="submit"
        disabled={loading}
      >
        {loading ? "Creating account..." : "Create account"}
        <ArrowRight size={19} aria-hidden="true" />
      </button>
      <p className="text-sm leading-6 text-[#738078]">
        Demo account details are stored in local JSON files on this server.
      </p>
    </form>
  );
}
