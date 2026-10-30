import { NextResponse } from "next/server";
import { getCurrentHospitalSession } from "@/lib/auth";
import {
  APPOINTMENT_STATUSES,
  updateHospitalAppointmentStatus,
} from "@/lib/hospital-management";

export async function PATCH(request: Request) {
  const session = await getCurrentHospitalSession();
  if (!session) {
    return NextResponse.json({ error: "Hospital sign-in is required." }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  if (
    typeof body !== "object" ||
    body === null ||
    !("appointmentId" in body) ||
    typeof body.appointmentId !== "string" ||
    !body.appointmentId.trim() ||
    !("status" in body) ||
    typeof body.status !== "string" ||
    !APPOINTMENT_STATUSES.includes(
      body.status as (typeof APPOINTMENT_STATUSES)[number],
    )
  ) {
    return NextResponse.json({ error: "Choose a valid appointment status." }, { status: 400 });
  }

  const updated = await updateHospitalAppointmentStatus(
    session.hospitalId,
    body.appointmentId,
    body.status as (typeof APPOINTMENT_STATUSES)[number],
  );
  if (!updated) {
    return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, appointment: updated });
}
