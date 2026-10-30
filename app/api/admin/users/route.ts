import { NextResponse } from "next/server";
import { hasAdminSession, registerUser } from "@/lib/auth";

export async function POST(request: Request) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Admin sign-in is required." }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  if (
    typeof body !== "object" ||
    body === null ||
    !("fullName" in body) ||
    !("email" in body) ||
    !("password" in body) ||
    typeof body.fullName !== "string" ||
    typeof body.email !== "string" ||
    typeof body.password !== "string"
  ) {
    return NextResponse.json({ error: "Enter a name, valid email, and password." }, { status: 400 });
  }

  const fullName = body.fullName.trim();
  const email = body.email.trim();
  if (
    fullName.length < 1 ||
    fullName.length > 100 ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    body.password.length < 8 ||
    body.password.length > 256
  ) {
    return NextResponse.json(
      { error: "Use a valid email, a name under 100 characters, and a password between 8 and 256 characters." },
      { status: 400 },
    );
  }

  const user = await registerUser({ fullName, email, password: body.password });
  if (!user) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 },
    );
  }

  return NextResponse.json(
    { ok: true, user: { id: user.id, username: user.username, patientId: user.patientId } },
    { status: 201 },
  );
}
