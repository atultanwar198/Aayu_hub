import { NextResponse } from "next/server";
import { createUserSession, registerUser } from "@/lib/auth";

export async function POST(request: Request) {
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
    return NextResponse.json(
      { error: "Enter your name, a valid email address, and a password." },
      { status: 400 },
    );
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
      {
        error:
          "Use a valid email, a name under 100 characters, and a password between 8 and 256 characters.",
      },
      { status: 400 },
    );
  }

  const user = await registerUser({
    fullName,
    email,
    password: body.password,
  });
  if (!user) {
    return NextResponse.json(
      { error: "An account with this email already exists. Please sign in." },
      { status: 409 },
    );
  }

  await createUserSession(user);
  return NextResponse.json({ ok: true });
}
