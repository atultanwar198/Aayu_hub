"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

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
      const result = (await response.json()) as {
        error?: string;
        redirectTo?: string;
      };

      if (!response.ok) {
        setError(result.error ?? "Unable to sign in. Please try again.");
        return;
      }

      router.replace(result.redirectTo ?? "/patients");
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
      <label className="mt-2 text-sm font-medium text-[#40564c]" htmlFor="userId">
        Account ID, username, or email
      </label>
      <input
        className="h-12 w-full rounded-xl border border-[#d6dfd8] bg-white px-4 text-base text-[#263b33] outline-none placeholder:text-[#89968e] focus:border-[#39806d] focus:ring-2 focus:ring-[#39806d]/20"
        id="userId"
        name="userId"
        type="text"
        autoComplete="username"
        placeholder="Enter your ID, username, or email"
        required
      />
      <label className="mt-2 text-sm font-medium text-[#40564c]" htmlFor="password">
        Password
      </label>
      <input
        className="h-12 w-full rounded-xl border border-[#d6dfd8] bg-white px-4 text-base text-[#263b33] outline-none placeholder:text-[#89968e] focus:border-[#39806d] focus:ring-2 focus:ring-[#39806d]/20"
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="Enter your password"
        required
      />
      {error && (
        <p className="mt-1 text-sm text-[#b42318]" role="alert">
          {error}
        </p>
      )}
      <button
        className="mt-3 flex min-h-12 items-center justify-between rounded-xl bg-[#286d5c] px-4 text-base font-semibold text-white transition-colors hover:bg-[#205b4d] focus:outline-none focus:ring-2 focus:ring-[#286d5c] focus:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
        type="submit"
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign in securely"}
        <ArrowRight size={19} aria-hidden="true" />
      </button>
    </form>
  );
}
