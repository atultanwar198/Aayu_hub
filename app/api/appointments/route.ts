import { NextResponse } from "next/server";
import { getCurrentPatient } from "@/lib/auth";
import { createPatientAppointment } from "@/lib/hospital-management";
import { hospitalHasSpecialty } from "@/lib/hospital-routing";
import { getHospital } from "@/lib/hospitals";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export async function POST(request: Request) {
  const patient = await getCurrentPatient();
  if (!patient) {
    return NextResponse.json(
      { error: "Patient sign-in is required." },
      { status: 401 },
    );
  }

  const body: unknown = await request.json().catch(() => null);
  if (!isRecord(body)) {
    return NextResponse.json(
      { error: "Enter valid appointment details." },
      { status: 400 },
    );
  }

  const hospitalId =
    typeof body.hospitalId === "string" ? body.hospitalId.trim() : "";
  const department =
    typeof body.department === "string" ? body.department.trim() : "";
  const patientPhone =
    typeof body.patientPhone === "string" ? body.patientPhone.trim() : "";
  const scheduledAt =
    typeof body.scheduledAt === "string" ? new Date(body.scheduledAt) : null;
  const notesValue = body.notes ?? "";
  if (typeof notesValue !== "string") {
    return NextResponse.json(
      { error: "The scheduling note must be text." },
      { status: 400 },
    );
  }
  const notes = notesValue.trim();
  const phoneDigits = patientPhone.replace(/\D/g, "");

  if (
    !hospitalId ||
    hospitalId.length > 100 ||
    department.length < 2 ||
    department.length > 100 ||
    phoneDigits.length < 7 ||
    phoneDigits.length > 15 ||
    patientPhone.length > 32 ||
    !scheduledAt ||
    !Number.isFinite(scheduledAt.getTime()) ||
    scheduledAt.getTime() <= Date.now() ||
    notes.length > 500
  ) {
    return NextResponse.json(
      { error: "Check the hospital, specialty, phone, date, and notes." },
      { status: 400 },
    );
  }

  const hospital = await getHospital(hospitalId);
  if (!hospital) {
    return NextResponse.json(
      { error: "That hospital is no longer available." },
      { status: 404 },
    );
  }

  if (!hospitalHasSpecialty(hospital, department)) {
    return NextResponse.json(
      {
        error:
          "Choose a care area listed for the selected hospital before requesting an appointment.",
      },
      { status: 400 },
    );
  }

  const appointment = await createPatientAppointment({
    hospitalId: hospital.id,
    patientId: patient.patientId,
    patientName: patient.fullName,
    patientPhone,
    department,
    clinician: "To be assigned by the hospital",
    scheduledAt: scheduledAt.toISOString(),
    status: "scheduled",
    priority: "routine",
    notes,
  });

  return NextResponse.json({ ok: true, appointment }, { status: 201 });
}
