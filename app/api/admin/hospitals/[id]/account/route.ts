import { NextResponse } from "next/server";
import {
  createHospitalAccount,
  hasAdminSession,
} from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Admin sign-in is required." }, { status: 401 });
  }

  const { id } = await params;
  const body: unknown = await request.json().catch(() => null);
  if (
    typeof body !== "object" ||
    body === null ||
    !("username" in body) ||
    !("password" in body) ||
    typeof body.username !== "string" ||
    typeof body.password !== "string"
  ) {
    return NextResponse.json({ error: "Enter a username and password." }, { status: 400 });
  }

  const username = body.username.trim();
  if (
    username.length < 3 ||
    username.length > 100 ||
    !/^[a-zA-Z0-9._@+-]+$/.test(username) ||
    body.password.length < 12 ||
    body.password.length > 256
  ) {
    return NextResponse.json(
      { error: "Use a 3–100 character username and a password between 12 and 256 characters." },
      { status: 400 },
    );
  }

  const result = await createHospitalAccount({
    hospitalId: id,
    username,
    password: body.password,
  });
  if (result === "hospital-not-found") {
    return NextResponse.json({ error: "Hospital not found." }, { status: 404 });
  }
  if (result === "username-taken") {
    return NextResponse.json(
      { error: "That username is already used by another account." },
      { status: 409 },
    );
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
