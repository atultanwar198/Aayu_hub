import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/auth";
import { addHospital, updateHospital } from "@/lib/hospitals";

type HospitalInput = {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  website: string;
  specialties: string[];
  emergencyServices: boolean;
};

function isString(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.trim().length <= maxLength;
}

function parseHospitalInput(value: unknown): HospitalInput | null {
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

  const { name, description, address, city, state, postalCode, phone, website, specialties, emergencyServices } = value;
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
    !specialties.every((specialty) => isString(specialty, 80) && specialty.trim()) ||
    typeof emergencyServices !== "boolean"
  ) {
    return null;
  }

  const normalizedWebsite = website.trim();
  if (normalizedWebsite) {
    try {
      const parsed = new URL(normalizedWebsite);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
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
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Admin sign-in is required." }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  const hospital = parseHospitalInput(body);
  if (!hospital) {
    return NextResponse.json({ error: "Enter valid hospital information." }, { status: 400 });
  }

  const created = await addHospital(hospital);
  return NextResponse.json({ ok: true, hospital: created }, { status: 201 });
}

export async function PUT(request: Request) {
  if (!(await hasAdminSession())) {
    return NextResponse.json({ error: "Admin sign-in is required." }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  if (
    typeof body !== "object" ||
    body === null ||
    !("id" in body) ||
    typeof body.id !== "string" ||
    !body.id.trim()
  ) {
    return NextResponse.json({ error: "A valid hospital ID is required." }, { status: 400 });
  }

  const hospital = parseHospitalInput(body);
  if (!hospital) {
    return NextResponse.json({ error: "Enter valid hospital information." }, { status: 400 });
  }

  const updated = await updateHospital(body.id.trim(), hospital);
  if (!updated) {
    return NextResponse.json({ error: "The hospital could not be found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, hospital: updated });
}
