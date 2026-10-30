"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Check,
  Clock3,
  Phone,
  Search,
  Siren,
} from "lucide-react";
import {
  APPOINTMENT_STATUSES,
  type Appointment,
  type AppointmentStatus,
} from "@/lib/hospital-management-types";

const statusLabels: Record<AppointmentStatus, string> = {
  scheduled: "Scheduled",
  confirmed: "Confirmed",
  checked_in: "Checked in",
  completed: "Completed",
  cancelled: "Cancelled",
};

const statusTones: Record<AppointmentStatus, string> = {
  scheduled: "bg-[#eef2fb] text-[#546a9d]",
  confirmed: "bg-[#eaf4ed] text-[#347361]",
  checked_in: "bg-[#fff3df] text-[#9a6d25]",
  completed: "bg-[#edf1ef] text-[#617169]",
  cancelled: "bg-[#fbecea] text-[#a64f43]",
};

export default function AppointmentManager({
  initialAppointments,
}: {
  initialAppointments: Appointment[];
}) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [pendingStatus, setPendingStatus] = useState<Record<string, AppointmentStatus>>({});
  const [savingId, setSavingId] = useState("");
  const [feedback, setFeedback] = useState("");
  const [failed, setFailed] = useState(false);

  const visibleAppointments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return appointments.filter((appointment) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "emergency"
          ? appointment.priority === "emergency"
          : appointment.status === filter);
      const matchesSearch =
        !query ||
        [
          appointment.patientName,
          appointment.patientPhone,
          appointment.department,
          appointment.clinician,
          appointment.id,
        ].some((value) => value.toLowerCase().includes(query));
      return matchesFilter && matchesSearch;
    });
  }, [appointments, filter, search]);

  async function saveStatus(appointment: Appointment) {
    const status = pendingStatus[appointment.id];
    if (!status || status === appointment.status) return;
    setSavingId(appointment.id);
    setFeedback("");
    setFailed(false);
    try {
      const response = await fetch("/api/hospital-management/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: appointment.id, status }),
      });
      const result = (await response.json()) as {
        error?: string;
        appointment?: Appointment;
      };
      if (!response.ok || !result.appointment) {
        setFailed(true);
        setFeedback(result.error ?? "Could not update appointment.");
        return;
      }
      setAppointments((current) =>
        current.map((item) =>
          item.id === appointment.id ? result.appointment! : item,
        ),
      );
      setPendingStatus((current) => {
        const next = { ...current };
        delete next[appointment.id];
        return next;
      });
      setFeedback(`Appointment ${appointment.id} updated.`);
    } catch {
      setFailed(true);
      setFeedback("Could not reach the server. Please try again.");
    } finally {
      setSavingId("");
    }
  }

  const filters = [
    { value: "all", label: `All (${appointments.length})` },
    { value: "emergency", label: `Emergency (${appointments.filter((a) => a.priority === "emergency").length})` },
    ...APPOINTMENT_STATUSES.map((status) => ({
      value: status,
      label: `${statusLabels[status]} (${appointments.filter((a) => a.status === status).length})`,
    })),
  ];

  return (
    <div className="mt-6">
      <div className="rounded-2xl border border-[#e2e8e1] bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative block w-full lg:max-w-sm">
            <span className="sr-only">Search appointments</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#89968e]" size={17} />
            <input
              className="h-11 w-full rounded-xl border border-[#d6dfd8] bg-[#fcfdfb] pl-10 pr-3 text-sm outline-none focus:border-[#39806d] focus:ring-2 focus:ring-[#39806d]/20"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search patient, department, or appointment ID"
              type="search"
              value={search}
            />
          </label>
          <p className="text-sm text-[#738078]">
            Showing <strong className="text-[#40564c]">{visibleAppointments.length}</strong> of {appointments.length} appointments
          </p>
        </div>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {filters.map((item) => (
            <button
              className={`shrink-0 rounded-full px-3 py-2 text-xs font-semibold transition ${filter === item.value ? "bg-[#286d5c] text-white" : "bg-[#f1f5f1] text-[#52645e] hover:bg-[#e6eee7]"}`}
              key={item.value}
              onClick={() => setFilter(item.value)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {visibleAppointments.length ? visibleAppointments.map((appointment) => {
          const currentStatus = pendingStatus[appointment.id] ?? appointment.status;
          return (
            <article
              className={`rounded-2xl border bg-white p-5 shadow-sm sm:p-6 ${appointment.priority === "emergency" ? "border-[#efc8bf]" : "border-[#e2e8e1]"}`}
              key={appointment.id}
            >
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex min-w-0 items-start gap-4">
                  <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${appointment.priority === "emergency" ? "bg-[#fff0ec] text-[#b34e3d]" : "bg-[#eaf4ed] text-[#39806d]"}`}>
                    {appointment.priority === "emergency" ? <Siren size={22} /> : <CalendarDays size={21} />}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-[#2c433a]">{appointment.patientName}</h2>
                      {appointment.priority === "emergency" && (
                        <span className="rounded-full bg-[#fff0ec] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-[#a64234]">
                          Emergency priority
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-[#687970]">{appointment.department} · {appointment.clinician}</p>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#738078]">
                      <span className="inline-flex items-center gap-1.5"><Clock3 size={14} />{new Date(appointment.scheduledAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                      <a className="inline-flex items-center gap-1.5 hover:text-[#347361]" href={`tel:${appointment.patientPhone}`}><Phone size={14} />{appointment.patientPhone}</a>
                      <span>ID: {appointment.id}</span>
                    </div>
                    {appointment.notes && <p className="mt-3 text-xs leading-5 text-[#849087]">{appointment.notes}</p>}
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center xl:shrink-0">
                  <span className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${statusTones[appointment.status]}`}>
                    {statusLabels[appointment.status]}
                  </span>
                  <label>
                    <span className="sr-only">Update status for {appointment.id}</span>
                    <select
                      className="h-10 min-w-36 rounded-lg border border-[#d6dfd8] bg-white px-3 text-sm text-[#40564c] outline-none focus:border-[#39806d]"
                      onChange={(event) =>
                        setPendingStatus((current) => ({
                          ...current,
                          [appointment.id]: event.target.value as AppointmentStatus,
                        }))
                      }
                      value={currentStatus}
                    >
                      {APPOINTMENT_STATUSES.map((status) => (
                        <option key={status} value={status}>{statusLabels[status]}</option>
                      ))}
                    </select>
                  </label>
                  <button
                    className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-[#286d5c] px-3 text-sm font-semibold text-white hover:bg-[#205b4d] disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={savingId === appointment.id || currentStatus === appointment.status}
                    onClick={() => saveStatus(appointment)}
                    type="button"
                  >
                    <Check size={15} /> {savingId === appointment.id ? "Saving" : "Update"}
                  </button>
                </div>
              </div>
            </article>
          );
        }) : (
          <div className="rounded-2xl border border-dashed border-[#cbd9ce] bg-white p-10 text-center">
            <CalendarDays className="mx-auto text-[#8ca795]" size={30} />
            <h2 className="mt-3 text-lg font-semibold text-[#2c433a]">No appointments found</h2>
            <p className="mt-2 text-sm text-[#738078]">Try a different filter or search term.</p>
          </div>
        )}
      </div>
      {feedback && (
        <p className={`mt-4 flex items-center gap-2 text-sm ${failed ? "text-[#b42318]" : "text-[#347361]"}`} role={failed ? "alert" : "status"}>
          {failed ? <AlertCircle size={17} /> : <Check size={17} />} {feedback}
        </p>
      )}
    </div>
  );
}
