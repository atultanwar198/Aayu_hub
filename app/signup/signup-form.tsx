"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Check } from "lucide-react";

export default function SignupForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div
        className="rounded-2xl border border-[#dce9df] bg-[#f5f8f4] p-6"
        role="status"
      >
        <span
          className="grid size-10 place-items-center rounded-full bg-[#dff0e4] text-[#347361]"
          aria-hidden="true"
        >
          <Check size={20} />
        </span>
        <h2 className="mb-2 mt-5 text-xl font-semibold text-[#2c433a]">
          Thanks for reaching out.
        </h2>
        <p className="m-0 text-base leading-7 text-[#687970]">
          We appreciate your interest in Aayu Hub.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="mt-2 text-sm font-medium text-[#40564c]" htmlFor="name">
        Your name
      </label>
      <input
        className="h-12 rounded-xl border border-[#d6dfd8] bg-white px-4 text-base text-[#263b33] outline-none placeholder:text-[#89968e] focus:border-[#39806d] focus:ring-2 focus:ring-[#39806d]/20"
        id="name"
        name="name"
        type="text"
        placeholder="Alex Morgan"
        autoComplete="name"
        required
      />
      <label className="mt-2 text-sm font-medium text-[#40564c]" htmlFor="email">
        Email address
      </label>
      <input
        className="h-12 rounded-xl border border-[#d6dfd8] bg-white px-4 text-base text-[#263b33] outline-none placeholder:text-[#89968e] focus:border-[#39806d] focus:ring-2 focus:ring-[#39806d]/20"
        id="email"
        name="email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        required
      />
      <button
        className="mt-3 flex min-h-12 w-full items-center justify-between rounded-xl bg-[#286d5c] px-4 text-base font-semibold text-white transition-colors hover:bg-[#205b4d] focus:outline-none focus:ring-2 focus:ring-[#286d5c] focus:ring-offset-2"
        type="submit"
      >
        Contact me{" "}
        <ArrowRight size={19} aria-hidden="true" />
      </button>
      <p className="text-sm leading-6 text-[#738078]">
        This demo form does not store or send your information.
      </p>
    </form>
  );
}
