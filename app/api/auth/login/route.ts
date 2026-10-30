import { NextResponse } from "next/server";
import { authenticateUser, createUserSession } from "@/lib/auth";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  if (
    typeof body !== "object" ||
    body === null ||
    !("userId" in body) ||
    !("password" in body) ||
    typeof body.userId !== "string" ||
    typeof body.password !== "string" ||
    body.userId.length > 100 ||
    body.password.length > 256
  ) {
    return NextResponse.json({ error: "Enter a valid user ID and password." }, { status: 400 });
  }

  const user = await authenticateUser(body.userId, body.password);
  if (!user) {
    return NextResponse.json(
      { error: "The user ID or password is incorrect." },
      { status: 401 },
    );
  }

  await createUserSession(user);
  return NextResponse.json({ ok: true });
}
