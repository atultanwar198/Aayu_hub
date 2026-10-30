"use client";

import { FormEvent, useState } from "react";

export default function SignupForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div
        className="mt-[35px] border border-[#e7a85b]/[.35] bg-[#e7a85b]/[.06] p-[25px]"
        role="status"
      >
        <span
          className="grid size-[34px] place-items-center rounded-full bg-[#e7a85b] text-[#15120d]"
          aria-hidden="true"
        >
          ✓
        </span>
        <h2 className="mb-2 mt-5 font-display text-[27px] font-medium">
          Thanks for reaching out.
        </h2>
        <p className="m-0 text-sm text-[#b8bcb8]">
          We appreciate your interest in Aayu Hub.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[10px]">
      <label className="mt-2 text-xs text-[#d2cec5]" htmlFor="name">
        Your name
      </label>
      <input
        className="h-[50px] border border-white/[.18] bg-white/[.04] px-[14px] text-sm text-[#f4f0e8] outline-none placeholder:text-[#777c7b] focus:border-[#e7a85b]"
        id="name"
        name="name"
        type="text"
        placeholder="Alex Morgan"
        autoComplete="name"
        required
      />
      <label className="mt-2 text-xs text-[#d2cec5]" htmlFor="email">
        Email address
      </label>
      <input
        className="h-[50px] border border-white/[.18] bg-white/[.04] px-[14px] text-sm text-[#f4f0e8] outline-none placeholder:text-[#777c7b] focus:border-[#e7a85b]"
        id="email"
        name="email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        required
      />
      <button
        className="mt-4 flex min-h-[52px] w-full items-center justify-between border-0 bg-[#e7a85b] px-[21px] text-[13px] font-semibold text-[#15120d] transition-colors hover:bg-[#f0bd7f]"
        type="submit"
      >
        Contact me{" "}
        <span className="text-lg" aria-hidden="true">
          →
        </span>
      </button>
      <p className="text-[11px] leading-[1.6] text-[#818886]">
        This demo form does not store or send your information.
      </p>
    </form>
  );
}
