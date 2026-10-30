import { NextResponse } from "next/server";
import {
  authenticateHospital,
  createHospitalSession,
} from "@/lib/auth";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (
    typeof body !== "object" ||
    body === null ||
    !("username" in body) ||
    !("password" in body) ||
    typeof body.username !== "string" ||
    typeof body.password !== "string" ||
    body.username.length > 100 ||
    body.password.length > 256
  ) {
    return NextResponse.json({ error: "Enter a valid username and password." }, { status: 400 });
  }

  const account = await authenticateHospital(body.username, body.password);
  if (!account) {
    return NextResponse.json({ error: "The hospital username or password is incorrect." }, { status: 401 });
  }

  await createHospitalSession(account);
  return NextResponse.json({ ok: true, redirectTo: "/hospital-management" });
}
