import { NextResponse } from "next/server";
import { hasAdminSession, updatePatientRecord } from "@/lib/auth";

function isString(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.trim().length <= maxLength;
}

function isStringList(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length <= 50 &&
    value.every((item) => isString(item, 100))
  );
}

export async function PUT(request: Request) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Admin sign-in is required." }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  if (
    typeof body !== "object" ||
    body === null ||
    !("patientId" in body) ||
    !("fullName" in body) ||
    !("dateOfBirth" in body) ||
    !("bloodType" in body) ||
    !("allergies" in body) ||
    !("conditions" in body) ||
    !("medications" in body) ||
    !("emergencyContact" in body)
  ) {
    return NextResponse.json({ error: "Patient details are incomplete." }, { status: 400 });
  }

  const { patientId, fullName, dateOfBirth, bloodType, allergies, conditions, medications, emergencyContact } = body;
  if (
    !isString(patientId, 100) ||
    !isString(fullName, 100) ||
    fullName.trim().length === 0 ||
    !isString(dateOfBirth, 10) ||
    (dateOfBirth !== "" && !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) ||
    !isString(bloodType, 40) ||
    !isStringList(allergies) ||
    !isStringList(conditions) ||
    !Array.isArray(medications) ||
    medications.length > 30 ||
    !medications.every(
      (medication) =>
        typeof medication === "object" &&
        medication !== null &&
        "name" in medication &&
        "instructions" in medication &&
        isString(medication.name, 100) &&
        medication.name.trim().length > 0 &&
        isString(medication.instructions, 300),
    ) ||
    typeof emergencyContact !== "object" ||
    emergencyContact === null ||
    !("name" in emergencyContact) ||
    !("relationship" in emergencyContact) ||
    !("phone" in emergencyContact) ||
    !isString(emergencyContact.name, 100) ||
    !isString(emergencyContact.relationship, 100) ||
    !isString(emergencyContact.phone, 40)
  ) {
    return NextResponse.json({ error: "One or more patient details are invalid." }, { status: 400 });
  }

  const updated = await updatePatientRecord(patientId.trim(), {
    fullName: fullName.trim(),
    dateOfBirth: dateOfBirth.trim(),
    bloodType: bloodType.trim(),
    allergies: allergies.map((item) => item.trim()).filter(Boolean),
    conditions: conditions.map((item) => item.trim()).filter(Boolean),
    medications: medications.map((medication) => ({
      name: medication.name.trim(),
      instructions: medication.instructions.trim(),
    })),
    emergencyContact: {
      name: emergencyContact.name.trim(),
      relationship: emergencyContact.relationship.trim(),
      phone: emergencyContact.phone.trim(),
    },
  });

  if (!updated) {
    return NextResponse.json({ error: "The patient record could not be found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
