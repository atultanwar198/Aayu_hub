import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const HOSPITALS_FILE = join(process.cwd(), "data", "hospitals.json");

export type Hospital = {
  id: string;
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

let hospitalWriteQueue = Promise.resolve();

async function readHospitals(): Promise<Hospital[]> {
  return JSON.parse(await readFile(HOSPITALS_FILE, "utf8")) as Hospital[];
}

function serializeHospitalWrite<T>(operation: () => Promise<T>): Promise<T> {
  const result = hospitalWriteQueue.then(operation, operation);
  hospitalWriteQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

export async function getHospitals(): Promise<Hospital[]> {
  const hospitals = await readHospitals();
  return hospitals.sort((left, right) =>
    left.name.localeCompare(right.name),
  );
}

export async function addHospital(
  hospital: Omit<Hospital, "id">,
): Promise<Hospital> {
  return serializeHospitalWrite(async () => {
    const hospitals = await readHospitals();
    const created = { ...hospital, id: randomUUID() };
    await writeFile(
      HOSPITALS_FILE,
      `${JSON.stringify([...hospitals, created], null, 2)}\n`,
      "utf8",
    );
    return created;
  });
}

export async function updateHospital(
  id: string,
  updates: Omit<Hospital, "id">,
): Promise<Hospital | null> {
  return serializeHospitalWrite(async () => {
    const hospitals = await readHospitals();
    const index = hospitals.findIndex((hospital) => hospital.id === id);
    if (index === -1) return null;

    const updated = { ...updates, id };
    hospitals[index] = updated;
    await writeFile(HOSPITALS_FILE, `${JSON.stringify(hospitals, null, 2)}\n`, "utf8");
    return updated;
  });
}

export async function getHospital(id: string): Promise<Hospital | null> {
  const hospitals = await readHospitals();
  return hospitals.find((hospital) => hospital.id === id) ?? null;
}
