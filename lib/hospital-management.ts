import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Hospital } from "@/lib/hospitals";
import {
  APPOINTMENT_STATUSES,
  type Appointment,
  type AppointmentStatus,
  type HospitalUpdateRequest,
  type HospitalUpdateRequestStatus,
} from "@/lib/hospital-management-types";
import { updateHospital } from "@/lib/hospitals";

const APPOINTMENTS_FILE = join(process.cwd(), "data", "appointments.json");
const UPDATE_REQUESTS_FILE = join(
  process.cwd(),
  "data",
  "hospital-update-requests.json",
);

export { APPOINTMENT_STATUSES };
export type {
  Appointment,
  AppointmentStatus,
  HospitalUpdateRequest,
  HospitalUpdateRequestStatus,
};

let writeQueue = Promise.resolve();

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, "utf8")) as T;
}

function serializeWrite<T>(operation: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(operation, operation);
  writeQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

export async function getHospitalAppointments(
  hospitalId: string,
): Promise<Appointment[]> {
  const appointments = await readJson<Appointment[]>(APPOINTMENTS_FILE);
  return appointments
    .filter((appointment) => appointment.hospitalId === hospitalId)
    .sort(
      (left, right) =>
        new Date(left.scheduledAt).getTime() -
        new Date(right.scheduledAt).getTime(),
    );
}

export async function getPatientAppointments(
  patientId: string,
): Promise<Appointment[]> {
  const appointments = await readJson<Appointment[]>(APPOINTMENTS_FILE);
  return appointments
    .filter((appointment) => appointment.patientId === patientId)
    .sort(
      (left, right) =>
        new Date(left.scheduledAt).getTime() -
        new Date(right.scheduledAt).getTime(),
    );
}

export async function createPatientAppointment(
  appointment: Omit<Appointment, "id">,
): Promise<Appointment> {
  return serializeWrite(async () => {
    const appointments = await readJson<Appointment[]>(APPOINTMENTS_FILE);
    const created = { ...appointment, id: randomUUID() };
    await writeFile(
      APPOINTMENTS_FILE,
      `${JSON.stringify([...appointments, created], null, 2)}\n`,
      "utf8",
    );
    return created;
  });
}

export async function updateHospitalAppointmentStatus(
  hospitalId: string,
  appointmentId: string,
  status: AppointmentStatus,
): Promise<Appointment | null> {
  return serializeWrite(async () => {
    const appointments = await readJson<Appointment[]>(APPOINTMENTS_FILE);
    const appointment = appointments.find(
      (entry) =>
        entry.id === appointmentId && entry.hospitalId === hospitalId,
    );
    if (!appointment) return null;

    appointment.status = status;
    await writeFile(
      APPOINTMENTS_FILE,
      `${JSON.stringify(appointments, null, 2)}\n`,
      "utf8",
    );
    return appointment;
  });
}

export async function getHospitalUpdateRequests(
  hospitalId?: string,
): Promise<HospitalUpdateRequest[]> {
  const requests = await readJson<HospitalUpdateRequest[]>(
    UPDATE_REQUESTS_FILE,
  );
  return requests
    .filter((request) => !hospitalId || request.hospitalId === hospitalId)
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime(),
    );
}

export async function submitHospitalUpdateRequest({
  hospitalId,
  proposedInfo,
  message,
}: {
  hospitalId: string;
  proposedInfo: Omit<Hospital, "id">;
  message: string;
}): Promise<HospitalUpdateRequest> {
  return serializeWrite(async () => {
    const requests = await readJson<HospitalUpdateRequest[]>(
      UPDATE_REQUESTS_FILE,
    );
    const request: HospitalUpdateRequest = {
      id: randomUUID(),
      hospitalId,
      proposedInfo,
      message,
      status: "pending",
      createdAt: new Date().toISOString(),
      reviewedAt: null,
    };
    await writeFile(
      UPDATE_REQUESTS_FILE,
      `${JSON.stringify([...requests, request], null, 2)}\n`,
      "utf8",
    );
    return request;
  });
}

export async function reviewHospitalUpdateRequest(
  requestId: string,
  status: Exclude<HospitalUpdateRequestStatus, "pending">,
): Promise<HospitalUpdateRequest | null> {
  return serializeWrite(async () => {
    const requests = await readJson<HospitalUpdateRequest[]>(
      UPDATE_REQUESTS_FILE,
    );
    const request = requests.find((entry) => entry.id === requestId);
    if (!request || request.status !== "pending") return null;

    if (status === "approved") {
      const updated = await updateHospital(
        request.hospitalId,
        request.proposedInfo,
      );
      if (!updated) return null;
    }

    request.status = status;
    request.reviewedAt = new Date().toISOString();
    await writeFile(
      UPDATE_REQUESTS_FILE,
      `${JSON.stringify(requests, null, 2)}\n`,
      "utf8",
    );
    return request;
  });
}
