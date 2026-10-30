export const APPOINTMENT_STATUSES = [
  "scheduled",
  "confirmed",
  "checked_in",
  "completed",
  "cancelled",
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];
export type AppointmentPriority = "routine" | "emergency";

export type Appointment = {
  id: string;
  hospitalId: string;
  patientId?: string;
  patientName: string;
  patientPhone: string;
  department: string;
  clinician: string;
  scheduledAt: string;
  status: AppointmentStatus;
  priority: AppointmentPriority;
  notes: string;
};

export type HospitalUpdateRequestStatus = "pending" | "approved" | "rejected";

export type HospitalUpdateRequest = {
  id: string;
  hospitalId: string;
  proposedInfo: Omit<Hospital, "id">;
  message: string;
  status: HospitalUpdateRequestStatus;
  createdAt: string;
  reviewedAt: string | null;
};
import type { Hospital } from "@/lib/hospitals";
