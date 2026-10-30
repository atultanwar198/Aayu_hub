"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function logout() {
    setError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        setError("Unable to sign out. Please try again.");
        return;
      }
      router.replace("/login");
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
    }
  }

  return (
    <div className="flex items-center gap-[10px]">
      <button
        className="border border-white/20 bg-transparent px-[14px] py-[9px] text-[11px] text-[#e1e3dc] transition-colors hover:border-[#d7a66e]"
        onClick={logout}
        type="button"
      >
        Sign out
      </button>
      {error && (
        <span className="text-[11px] text-[#f0a39a]" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
