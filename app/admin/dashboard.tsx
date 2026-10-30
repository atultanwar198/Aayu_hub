"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  ContactRound,
  FileHeart,
  HeartPulse,
  Search,
  Save,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { AdminPatientRecord, Patient } from "@/lib/auth";

type Props = {
  initialRecords: AdminPatientRecord[];
};

function toLines(values: string[]) {
  return values.join("\n");
}

function toPatientForm(patient: Patient | null, patientId: string): Patient {
  return (
    patient ?? {
      patientId,
      fullName: "",
      dateOfBirth: "",
      bloodType: "Not provided",
      allergies: [],
      conditions: [],
      medications: [],
      emergencyContact: { name: "", relationship: "", phone: "" },
    }
  );
}

function getProfileStatus(patient: Patient | null) {
  return patient?.fullName.trim() ? "Profile ready" : "Needs details";
}

export default function AdminDashboard({ initialRecords }: Props) {
  const [records, setRecords] = useState(initialRecords);
  const [selectedUserId, setSelectedUserId] = useState(
    initialRecords[0]?.userId ?? "",
  );
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [failed, setFailed] = useState(false);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return records;
    return records.filter((record) =>
      [
        record.username,
        record.userId,
        record.patientId,
        record.patient?.fullName,
      ].some((value) => value?.toLowerCase().includes(query)),
    );
  }, [records, search]);
  const selectedRecord = records.find(
    (record) => record.userId === selectedUserId,
  );
  const patient = toPatientForm(
    selectedRecord?.patient ?? null,
    selectedRecord?.patientId ?? "",
  );
  const completeProfiles = records.filter(({ patient: record }) =>
    record?.fullName.trim(),
  ).length;
  const missingProfiles = records.length - completeProfiles;

  function lines(value: FormDataEntryValue | null) {
    return typeof value === "string"
      ? value
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedRecord || !patient.patientId) return;
    setSaving(true);
    setFeedback("");
    setFailed(false);

    const formData = new FormData(event.currentTarget);
    const medications = String(formData.get("medications") ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const separator = line.indexOf("|");
        return {
          name: (separator === -1 ? line : line.slice(0, separator)).trim(),
          instructions:
            separator === -1 ? "" : line.slice(separator + 1).trim(),
        };
      });

    try {
      const response = await fetch("/api/admin/patients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: patient.patientId,
          fullName: formData.get("fullName"),
          dateOfBirth: formData.get("dateOfBirth"),
          bloodType: formData.get("bloodType"),
          allergies: lines(formData.get("allergies")),
          conditions: lines(formData.get("conditions")),
          medications,
          emergencyContact: {
            name: formData.get("contactName"),
            relationship: formData.get("contactRelationship"),
            phone: formData.get("contactPhone"),
          },
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setFailed(true);
        setFeedback(result.error ?? "Could not save this patient record.");
        return;
      }

      const updatedPatient: Patient = {
        patientId: patient.patientId,
        fullName: String(formData.get("fullName")).trim(),
        dateOfBirth: String(formData.get("dateOfBirth")),
        bloodType: String(formData.get("bloodType")).trim(),
        allergies: lines(formData.get("allergies")),
        conditions: lines(formData.get("conditions")),
        medications,
        emergencyContact: {
          name: String(formData.get("contactName")).trim(),
          relationship: String(formData.get("contactRelationship")).trim(),
          phone: String(formData.get("contactPhone")).trim(),
        },
      };
      setRecords((current) =>
        current.map((record) =>
          record.userId === selectedUserId
            ? { ...record, patient: updatedPatient }
            : record,
        ),
      );
      setFeedback("Patient information saved.");
    } catch {
      setFailed(true);
      setFeedback("Could not reach the server. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "mt-2 h-12 w-full rounded-xl border border-[#d6dfd8] bg-white px-4 text-base text-[#263b33] outline-none placeholder:text-[#89968e] transition focus:border-[#39806d] focus:ring-2 focus:ring-[#39806d]/20";
  const textAreaClass =
    "mt-2 w-full rounded-xl border border-[#d6dfd8] bg-white px-4 py-3 text-base leading-6 text-[#263b33] outline-none placeholder:text-[#89968e] transition focus:border-[#39806d] focus:ring-2 focus:ring-[#39806d]/20";

  return (
    <div>
      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        <article className="flex items-center gap-4 rounded-2xl border border-[#e2e8e1] bg-white p-5 shadow-sm">
          <span className="grid size-11 place-items-center rounded-xl bg-[#eaf4ed] text-[#39806d]">
            <Users size={21} />
          </span>
          <div>
            <p className="text-sm text-[#738078]">Total accounts</p>
            <p className="mt-1 text-2xl font-semibold text-[#2c433a]">
              {records.length}
            </p>
          </div>
        </article>
        <article className="flex items-center gap-4 rounded-2xl border border-[#e2e8e1] bg-white p-5 shadow-sm">
          <span className="grid size-11 place-items-center rounded-xl bg-[#edf5ef] text-[#39806d]">
            <FileHeart size={21} />
          </span>
          <div>
            <p className="text-sm text-[#738078]">Profiles ready</p>
            <p className="mt-1 text-2xl font-semibold text-[#2c433a]">
              {completeProfiles}
            </p>
          </div>
        </article>
        <article className="flex items-center gap-4 rounded-2xl border border-[#e2e8e1] bg-white p-5 shadow-sm">
          <span className="grid size-11 place-items-center rounded-xl bg-[#fbf1e1] text-[#ac762e]">
            <ClipboardList size={21} />
          </span>
          <div>
            <p className="text-sm text-[#738078]">Need details</p>
            <p className="mt-1 text-2xl font-semibold text-[#2c433a]">
              {missingProfiles}
            </p>
          </div>
        </article>
      </section>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(280px,.8fr)_minmax(0,1.8fr)]">
        <aside className="overflow-hidden rounded-2xl border border-[#e2e8e1] bg-white shadow-sm">
          <div className="border-b border-[#e8ede7] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[#2c433a]">
                  Patient directory
                </h2>
                <p className="mt-1 text-sm text-[#738078]">
                  {records.length} linked account
                  {records.length === 1 ? "" : "s"}
                </p>
              </div>
              <span className="grid size-10 place-items-center rounded-xl bg-[#eaf4ed] text-[#39806d]">
                <ContactRound size={20} />
              </span>
            </div>
            <label className="relative mt-4 block">
              <span className="sr-only">Search patients</span>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#89968e]"
                size={17}
              />
              <input
                className="h-11 w-full rounded-xl border border-[#d6dfd8] bg-[#fcfdfb] pl-10 pr-3 text-sm text-[#263b33] outline-none focus:border-[#39806d] focus:ring-2 focus:ring-[#39806d]/20"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, username, or ID"
                type="search"
                value={search}
              />
            </label>
          </div>

          <div className="max-h-[610px] overflow-y-auto p-2">
            {filteredRecords.length ? (
              filteredRecords.map((record) => {
                const active = record.userId === selectedUserId;
                const displayName =
                  record.patient?.fullName.trim() || record.username;
                return (
                  <button
                    className={`mb-1 flex w-full items-start gap-3 rounded-xl p-3 text-left transition ${active ? "bg-[#edf5ef] ring-1 ring-[#c6dfce]" : "hover:bg-[#f7f9f6]"}`}
                    key={record.userId}
                    onClick={() => {
                      setSelectedUserId(record.userId);
                      setFeedback("");
                    }}
                    type="button"
                  >
                    <span
                      className={`grid size-10 shrink-0 place-items-center rounded-xl text-sm font-bold ${active ? "bg-white text-[#347361]" : "bg-[#f0f3ef] text-[#738078]"}`}
                    >
                      {displayName.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-[#344b42]">
                        {displayName}
                      </span>
                      <span className="mt-1 block truncate text-xs text-[#738078]">
                        {record.username}
                      </span>
                      <span className="mt-2 flex items-center gap-1.5 text-[11px] font-medium">
                        <span
                          className={`size-1.5 rounded-full ${record.patient?.fullName.trim() ? "bg-[#51a278]" : "bg-[#d19b43]"}`}
                        />
                        <span
                          className={
                            record.patient?.fullName.trim()
                              ? "text-[#51816e]"
                              : "text-[#9b763d]"
                          }
                        >
                          {getProfileStatus(record.patient)}
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })
            ) : (
              <p className="px-4 py-8 text-center text-sm text-[#738078]">
                No accounts match your search.
              </p>
            )}
          </div>
        </aside>

        {selectedRecord ? (
          <section className="min-w-0">
            <div className="mb-5 overflow-hidden rounded-2xl border border-[#d8e6db] bg-gradient-to-br from-white via-white to-[#edf5ef] p-5 shadow-sm sm:p-6">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                <div className="flex min-w-0 items-center gap-4">
                  <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#286d5c] text-white shadow-sm">
                    <HeartPulse size={26} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[.13em] text-[#6b8d78]">
                      Selected patient
                    </p>
                    <h2 className="mt-1 truncate text-xl font-semibold text-[#243b34] sm:text-2xl">
                      {patient.fullName || "Patient profile"}
                    </h2>
                    <p className="mt-1 truncate text-sm text-[#687970]">
                      {selectedRecord.username}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${patient.fullName ? "bg-[#e2f1e7] text-[#347361]" : "bg-[#fbf1e1] text-[#916b32]"}`}
                >
                  <span
                    className={`size-2 rounded-full ${patient.fullName ? "bg-[#51a278]" : "bg-[#d19b43]"}`}
                  />
                  {getProfileStatus(selectedRecord.patient)}
                </span>
              </div>
              <dl className="mt-5 grid gap-3 border-t border-[#dce8df] pt-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-medium text-[#849087]">
                    Account ID
                  </dt>
                  <dd className="mt-1 break-all text-sm font-semibold text-[#40564c]">
                    {selectedRecord.userId}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-[#849087]">
                    Patient ID
                  </dt>
                  <dd className="mt-1 break-all text-sm font-semibold text-[#40564c]">
                    {selectedRecord.patientId}
                  </dd>
                </div>
              </dl>
            </div>

            <form
              className="rounded-2xl border border-[#e2e8e1] bg-white shadow-sm"
              key={selectedRecord.userId}
              onSubmit={handleSubmit}
            >
              <div className="border-b border-[#e8ede7] px-5 py-5 sm:px-7">
                <h3 className="text-lg font-semibold text-[#2c433a]">
                  Patient information
                </h3>
                <p className="mt-1 text-sm leading-6 text-[#738078]">
                  Update the profile details linked to this account. Only enter
                  information provided and verified by the patient.
                </p>
              </div>

              <div className="space-y-7 p-5 sm:p-7">
                <section>
                  <h4 className="flex items-center gap-2 text-sm font-bold text-[#40564c]">
                    <FileHeart className="text-[#39806d]" size={17} /> Personal
                    details
                  </h4>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-medium text-[#40564c]">
                      Full name
                      <input
                        className={inputClass}
                        name="fullName"
                        defaultValue={patient.fullName}
                        maxLength={100}
                        required
                      />
                    </label>
                    <label className="text-sm font-medium text-[#40564c]">
                      Date of birth
                      <input
                        className={inputClass}
                        name="dateOfBirth"
                        type="date"
                        defaultValue={patient.dateOfBirth}
                      />
                    </label>
                    <label className="text-sm font-medium text-[#40564c]">
                      Blood type
                      <input
                        className={inputClass}
                        name="bloodType"
                        defaultValue={patient.bloodType}
                        maxLength={40}
                        placeholder="Not provided"
                      />
                    </label>
                  </div>
                </section>

                <section className="border-t border-[#edf0eb] pt-6">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-[#40564c]">
                    <ShieldCheck className="text-[#39806d]" size={17} /> Health
                    information
                  </h4>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    <label className="text-sm font-medium text-[#40564c]">
                      Allergies
                      <textarea
                        className={textAreaClass}
                        name="allergies"
                        rows={4}
                        defaultValue={toLines(patient.allergies)}
                        placeholder="One allergy per line"
                      />
                    </label>
                    <label className="text-sm font-medium text-[#40564c]">
                      Conditions
                      <textarea
                        className={textAreaClass}
                        name="conditions"
                        rows={4}
                        defaultValue={toLines(patient.conditions)}
                        placeholder="One condition per line"
                      />
                    </label>
                    <label className="text-sm font-medium text-[#40564c] sm:col-span-2">
                      Medications
                      <textarea
                        className={textAreaClass}
                        name="medications"
                        rows={3}
                        defaultValue={patient.medications
                          .map(
                            (medication) =>
                              `${medication.name} | ${medication.instructions}`,
                          )
                          .join("\n")}
                        placeholder={"One per line: Medicine | instructions"}
                      />
                      <span className="mt-1 block text-xs font-normal text-[#849087]">
                        Enter one medication per line as “Medicine |
                        instructions”.
                      </span>
                    </label>
                  </div>
                </section>

                <section className="border-t border-[#edf0eb] pt-6">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-[#40564c]">
                    <ContactRound className="text-[#39806d]" size={17} />{" "}
                    Emergency contact
                  </h4>
                  <div className="mt-3 grid gap-4 sm:grid-cols-3">
                    <label className="text-sm font-medium text-[#40564c]">
                      Name
                      <input
                        className={inputClass}
                        name="contactName"
                        defaultValue={patient.emergencyContact.name}
                        maxLength={100}
                      />
                    </label>
                    <label className="text-sm font-medium text-[#40564c]">
                      Relationship
                      <input
                        className={inputClass}
                        name="contactRelationship"
                        defaultValue={patient.emergencyContact.relationship}
                        maxLength={100}
                      />
                    </label>
                    <label className="text-sm font-medium text-[#40564c]">
                      Phone
                      <input
                        className={inputClass}
                        name="contactPhone"
                        type="tel"
                        defaultValue={patient.emergencyContact.phone}
                        maxLength={40}
                      />
                    </label>
                  </div>
                </section>
              </div>

              <div className="flex flex-col justify-between gap-4 border-t border-[#e8ede7] bg-[#fcfdfb] px-5 py-4 sm:flex-row sm:items-center sm:px-7">
                <div aria-live="polite">
                  {feedback && (
                    <p
                      className={`flex items-center gap-2 text-sm ${failed ? "text-[#b42318]" : "text-[#347361]"}`}
                      role={failed ? "alert" : "status"}
                    >
                      {failed ? (
                        <AlertCircle size={17} />
                      ) : (
                        <CheckCircle2 size={17} />
                      )}
                      {feedback}
                    </p>
                  )}
                  {!feedback && (
                    <p className="text-xs text-[#849087]">
                      Patient details are only available in the protected admin
                      area.
                    </p>
                  )}
                </div>
                <button
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#286d5c] px-5 text-base font-semibold text-white transition hover:bg-[#205b4d] focus:outline-none focus:ring-2 focus:ring-[#286d5c] focus:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
                  disabled={saving}
                  type="submit"
                >
                  <Save size={18} />{" "}
                  {saving ? "Saving record..." : "Save patient record"}
                </button>
              </div>
            </form>
          </section>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#cbd9ce] bg-white p-10 text-center">
            <Users className="mx-auto text-[#8ca795]" size={30} />
            <h2 className="mt-3 text-lg font-semibold text-[#2c433a]">
              {records.length
                ? "No matching patients"
                : "No patient accounts yet"}
            </h2>
            <p className="mt-2 text-sm text-[#738078]">
              {records.length
                ? "Try searching with a different name or account ID."
                : "Patient accounts will appear here when they are created."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
