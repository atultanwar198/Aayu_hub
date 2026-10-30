"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function AdminLogoutButton() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function logout() {
    setError("");
    try {
      const response = await fetch("/api/admin/logout", { method: "POST" });
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
    <div className="flex items-center gap-3">
      {error && <span className="text-sm text-[#b42318]" role="alert">{error}</span>}
      <button
        className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#d6dfd8] bg-white px-4 text-sm font-medium text-[#40564c] transition-colors hover:border-[#9dbdac] hover:bg-[#f5f8f4]"
        onClick={logout}
        type="button"
      >
        <LogOut size={16} /> Sign out
      </button>
    </div>
  );
}
