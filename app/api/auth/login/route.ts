import { NextResponse } from "next/server";
import {
  authenticateAdmin,
  authenticateHospital,
  authenticateUser,
  createAdminSession,
  createHospitalSession,
  createUserSession,
  isAdminCredentialsConfigured,
  isAdminLoginIdentifier,
} from "@/lib/auth";

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

  if (
    isAdminLoginIdentifier(body.userId) &&
    !isAdminCredentialsConfigured()
  ) {
    return NextResponse.json(
      { error: "Admin access is not configured. Check ADMIN_ID, ADMIN_USERNAME, and ADMIN_PASSWORD." },
      { status: 503 },
    );
  }

  if (await authenticateAdmin(body.userId, body.password)) {
    await createAdminSession();
    return NextResponse.json({ ok: true, redirectTo: "/admin" });
  }

  const user = await authenticateUser(body.userId, body.password);
  if (user) {
    await createUserSession(user);
    return NextResponse.json({ ok: true, redirectTo: "/appointments" });
  }

  const hospital = await authenticateHospital(body.userId, body.password);
  if (hospital) {
    await createHospitalSession(hospital);
    return NextResponse.json({
      ok: true,
      redirectTo: "/hospital-management",
    });
  }

  return NextResponse.json(
    { error: "The user ID or password is incorrect." },
    { status: 401 },
  );
}
