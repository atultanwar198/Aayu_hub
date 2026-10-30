import { NextResponse } from "next/server";
import { getCurrentHospitalSession } from "@/lib/auth";
import type { Hospital } from "@/lib/hospitals";
import { getHospital } from "@/lib/hospitals";
import { submitHospitalUpdateRequest } from "@/lib/hospital-management";

function isString(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.trim().length <= maxLength;
}

function parseProposedInfo(value: unknown): Omit<Hospital, "id"> | null {
  if (
    typeof value !== "object" ||
    value === null ||
    !("name" in value) ||
    !("description" in value) ||
    !("address" in value) ||
    !("city" in value) ||
    !("state" in value) ||
    !("postalCode" in value) ||
    !("phone" in value) ||
    !("website" in value) ||
    !("specialties" in value) ||
    !("emergencyServices" in value)
  ) {
    return null;
  }

  const {
    name,
    description,
    address,
    city,
    state,
    postalCode,
    phone,
    website,
    specialties,
    emergencyServices,
  } = value;
  if (
    !isString(name, 150) || !name.trim() ||
    !isString(description, 1000) ||
    !isString(address, 250) || !address.trim() ||
    !isString(city, 100) || !city.trim() ||
    !isString(state, 100) ||
    !isString(postalCode, 20) ||
    !isString(phone, 40) ||
    !isString(website, 500) ||
    !Array.isArray(specialties) ||
    specialties.length > 30 ||
    !specialties.every(
      (specialty) => isString(specialty, 80) && specialty.trim(),
    ) ||
    typeof emergencyServices !== "boolean"
  ) {
    return null;
  }

  const normalizedWebsite = website.trim();
  if (normalizedWebsite) {
    try {
      const parsed = new URL(normalizedWebsite);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        return null;
      }
    } catch {
      return null;
    }
  }

  return {
    name: name.trim(),
    description: description.trim(),
    address: address.trim(),
    city: city.trim(),
    state: state.trim(),
    postalCode: postalCode.trim(),
    phone: phone.trim(),
    website: normalizedWebsite,
    specialties: specialties.map((specialty) => specialty.trim()).filter(Boolean),
    emergencyServices,
  };
}

export async function POST(request: Request) {
  const session = await getCurrentHospitalSession();
  if (!session) {
    return NextResponse.json({ error: "Hospital sign-in is required." }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  if (
    typeof body !== "object" ||
    body === null ||
    !("proposedInfo" in body) ||
    !("message" in body) ||
    typeof body.message !== "string" ||
    body.message.trim().length > 1000
  ) {
    return NextResponse.json({ error: "Enter the proposed details and a short note." }, { status: 400 });
  }

  const proposedInfo = parseProposedInfo(body.proposedInfo);
  if (!proposedInfo) {
    return NextResponse.json({ error: "One or more proposed hospital details are invalid." }, { status: 400 });
  }
  if (!(await getHospital(session.hospitalId))) {
    return NextResponse.json({ error: "Hospital not found." }, { status: 404 });
  }

  const updateRequest = await submitHospitalUpdateRequest({
    hospitalId: session.hospitalId,
    proposedInfo,
    message: body.message.trim(),
  });
  return NextResponse.json({ ok: true, request: updateRequest }, { status: 201 });
}
