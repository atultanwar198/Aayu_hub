import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/auth";
import { reviewHospitalUpdateRequest } from "@/lib/hospital-management";

export async function PATCH(request: Request) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Admin sign-in is required." }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  if (
    typeof body !== "object" ||
    body === null ||
    !("requestId" in body) ||
    typeof body.requestId !== "string" ||
    !body.requestId.trim() ||
    !("status" in body) ||
    (body.status !== "approved" && body.status !== "rejected")
  ) {
    return NextResponse.json({ error: "Choose approve or reject for a valid request." }, { status: 400 });
  }

  const updated = await reviewHospitalUpdateRequest(body.requestId, body.status);
  if (!updated) {
    return NextResponse.json(
      { error: "Request not found, already reviewed, or linked hospital is unavailable." },
      { status: 404 },
    );
  }
  return NextResponse.json({ ok: true, request: updated });
}
