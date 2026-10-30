"use client";

import { useState } from "react";
import { AlertCircle, Check, Clock3, X } from "lucide-react";
import type { HospitalUpdateRequest } from "@/lib/hospital-management-types";

type ReviewItem = HospitalUpdateRequest & { hospitalName: string };

export default function HospitalRequestReview({
  initialRequests,
}: {
  initialRequests: ReviewItem[];
}) {
  const [requests, setRequests] = useState(initialRequests);
  const [workingId, setWorkingId] = useState("");
  const [error, setError] = useState("");

  async function review(requestId: string, status: "approved" | "rejected") {
    setWorkingId(requestId);
    setError("");
    try {
      const response = await fetch("/api/admin/hospital-update-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, status }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "Could not review this request.");
        return;
      }
      setRequests((current) =>
        current.map((request) =>
          request.id === requestId
            ? { ...request, status, reviewedAt: new Date().toISOString() }
            : request,
        ),
      );
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setWorkingId("");
    }
  }

  const pendingCount = requests.filter((request) => request.status === "pending").length;

  return (
    <div className="mt-7">
      <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#fff3df] px-3 py-1.5 text-sm font-semibold text-[#9a6d25]">
        <Clock3 size={16} /> {pendingCount} pending review
      </p>
      {error && (
        <p className="mb-4 flex items-center gap-2 text-sm text-[#b42318]" role="alert">
          <AlertCircle size={17} /> {error}
        </p>
      )}
      {requests.length ? (
        <div className="space-y-4">
          {requests.map((request) => (
            <article className="rounded-2xl border border-[#e2e8e1] bg-white p-5 shadow-sm sm:p-7" key={request.id}>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[.12em] text-[#6b8d78]">{request.hospitalName}</p>
                  <h2 className="mt-1 text-lg font-semibold text-[#2c433a]">{request.proposedInfo.name}</h2>
                  <p className="mt-1 text-sm text-[#738078]">Submitted {new Date(request.createdAt).toLocaleString()}</p>
                </div>
                <span className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${request.status === "pending" ? "bg-[#fff3df] text-[#9a6d25]" : request.status === "approved" ? "bg-[#eaf4ed] text-[#347361]" : "bg-[#fbecea] text-[#a64f43]"}`}>
                  {request.status === "pending" ? "Pending review" : request.status === "approved" ? "Approved" : "Rejected"}
                </span>
              </div>

              <div className="mt-5 grid gap-4 border-t border-[#edf0eb] pt-5 sm:grid-cols-2 lg:grid-cols-3">
                <Detail label="Address" value={[request.proposedInfo.address, request.proposedInfo.city, request.proposedInfo.state, request.proposedInfo.postalCode].filter(Boolean).join(", ")} />
                <Detail label="Contact" value={request.proposedInfo.phone || "Not provided"} />
                <Detail label="Website" value={request.proposedInfo.website || "Not provided"} />
                <Detail label="Specialties" value={request.proposedInfo.specialties.join(", ") || "None listed"} />
                <Detail label="Emergency services" value={request.proposedInfo.emergencyServices ? "Listed as available" : "Not listed"} />
                <Detail label="Review note" value={request.message || "No note supplied"} />
              </div>
              <p className="mt-4 text-sm leading-6 text-[#687970]">{request.proposedInfo.description}</p>

              {request.status === "pending" && (
                <div className="mt-5 flex flex-wrap gap-3 border-t border-[#edf0eb] pt-5">
                  <button className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#286d5c] px-4 text-sm font-semibold text-white hover:bg-[#205b4d] disabled:opacity-60" disabled={workingId === request.id} onClick={() => review(request.id, "approved")} type="button">
                    <Check size={16} /> {workingId === request.id ? "Saving..." : "Approve and publish"}
                  </button>
                  <button className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#e6c9c4] px-4 text-sm font-semibold text-[#a64f43] hover:bg-[#fff6f4] disabled:opacity-60" disabled={workingId === request.id} onClick={() => review(request.id, "rejected")} type="button">
                    <X size={16} /> Reject request
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#cbd9ce] bg-white p-10 text-center">
          <Clock3 className="mx-auto text-[#8ca795]" size={30} />
          <h2 className="mt-3 text-lg font-semibold text-[#2c433a]">No update requests</h2>
          <p className="mt-2 text-sm text-[#738078]">Hospital-submitted directory updates will appear here.</p>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-[#849087]">{label}</p>
      <p className="mt-1 break-words text-sm text-[#40564c]">{value}</p>
    </div>
  );
}
