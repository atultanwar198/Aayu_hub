"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import {
  AlertCircle,
  CalendarDays,
  Check,
  ExternalLink,
  MapPin,
  Navigation,
  Phone,
  Route,
  Sparkles,
} from "lucide-react";
import type { Appointment } from "@/lib/hospital-management-types";
import type { RankedHospitalRoute } from "@/lib/hospital-routing";
import { hospitalHasSpecialty } from "@/lib/hospital-routing";
import type { Hospital } from "@/lib/hospitals";

const HospitalRouteMap = dynamic(() => import("./hospital-route-map"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[360px] place-items-center bg-[#edf2ed] text-sm text-[#738078]">
      Loading OpenStreetMap…
    </div>
  ),
});

type RouteResponse = {
  routes?: RankedHospitalRoute[];
  failures?: { hospitalId: string; hospitalName: string }[];
  error?: string;
};

function localDateTimeValue(date: Date) {
  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60_000,
  );
  return localDate.toISOString().slice(0, 16);
}

function formatDistance(meters: number) {
  return meters >= 1000
    ? `${(meters / 1000).toFixed(1)} km`
    : `${Math.round(meters)} m`;
}

function hospitalAddress(hospital: Hospital) {
  return [
    hospital.address,
    hospital.city,
    hospital.state,
    hospital.postalCode,
  ]
    .filter(Boolean)
    .join(", ");
}

function openStreetMapUrl(route: RankedHospitalRoute) {
  const [longitude, latitude] =
    route.coordinates[route.coordinates.length - 1];
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`;
}

export default function AppointmentBooking({
  hospitals,
  initialAppointments,
  patientName,
  initialSpecialty,
}: {
  hospitals: Hospital[];
  initialAppointments: Appointment[];
  patientName: string;
  initialSpecialty: string;
}) {
  const specialties = useMemo(
    () =>
      ["Emergency", "General Medicine", ...new Set(hospitals.flatMap((hospital) => hospital.specialties))].sort(
        (left, right) => left.localeCompare(right),
      ),
    [hospitals],
  );
  const [appointments, setAppointments] = useState(initialAppointments);
  const [appointmentNotes, setAppointmentNotes] = useState("");
  const [selectedHospitalId, setSelectedHospitalId] = useState(() => {
    const initialMatch = initialSpecialty === "Emergency"
      ? hospitals.find((hospital) => hospital.emergencyServices)
      : initialSpecialty === "General Medicine"
      ? hospitals.find((hospital) => hospital.specialties.length === 0)
      : hospitals.find((hospital) => hospitalHasSpecialty(hospital, initialSpecialty));
    return initialMatch?.id ?? "";
  });
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpecialty);
  const [scheduledAt, setScheduledAt] = useState("");
  const [minimumDateTime, setMinimumDateTime] = useState("");
  const [routes, setRoutes] = useState<RankedHospitalRoute[]>([]);
  const [routeFailures, setRouteFailures] = useState<string[]>([]);
  const [origin, setOrigin] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    "locating" | "ready" | "denied" | "unavailable" | "error"
  >("locating");
  const [locationRetry, setLocationRetry] = useState(0);
  const [routeRetry, setRouteRetry] = useState(0);
  const manualHospitalSelection = useRef(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");
  const [routeError, setRouteError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [calculatingRoutes, setCalculatingRoutes] = useState(false);

  useEffect(() => {
    try {
      const draft = window.sessionStorage.getItem("aayu_appointment_notes");
      if (draft) {
        setAppointmentNotes(draft.slice(0, 500));
        window.sessionStorage.removeItem("aayu_appointment_notes");
      }
    } catch {
      // Session storage can be disabled; the form remains editable.
    }
  }, []);

  useEffect(() => {
    const minimum = new Date(Date.now() + 5 * 60_000);
    const defaultDate = new Date();
    if (selectedSpecialty === "Emergency") {
      defaultDate.setMinutes(defaultDate.getMinutes() + 10);
    } else {
      defaultDate.setDate(defaultDate.getDate() + 1);
      defaultDate.setHours(9, 0, 0, 0);
    }
    setMinimumDateTime(localDateTimeValue(minimum));
    setScheduledAt(localDateTimeValue(defaultDate));
  }, [selectedSpecialty]);

  useEffect(() => {
    let cancelled = false;
    setLocationStatus("locating");
    setOrigin(null);
    setRoutes([]);

    if (!navigator.geolocation) {
      setLocationStatus("unavailable");
      setRouteError("Location access is not available in this browser.");
      return () => {
        cancelled = true;
      };
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (cancelled) return;
        setOrigin({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
        });
        setLocationStatus("ready");
        setRouteError("");
      },
      (error) => {
        if (cancelled) return;
        const locationErrors: Record<number, string> = {
          1: "Allow location access to find hospitals near you.",
          2: "Your location could not be determined. Check your device settings and retry.",
          3: "Location lookup timed out. Please try again.",
        };
        setLocationStatus(error.code === 1 ? "denied" : "error");
        setRouteError(
          locationErrors[error.code] ??
            "Could not access your location. Please try again.",
        );
      },
      { enableHighAccuracy: true, timeout: 30_000, maximumAge: 0 },
    );

    return () => {
      cancelled = true;
    };
  }, [locationRetry]);

  const eligibleHospitals = useMemo(
    () =>
      selectedSpecialty === "Emergency"
        ? hospitals.filter((hospital) => hospital.emergencyServices)
        : selectedSpecialty === "General Medicine"
        ? hospitals.filter((hospital) => hospital.specialties.length === 0)
        : selectedSpecialty
        ? hospitals.filter((hospital) =>
            hospitalHasSpecialty(hospital, selectedSpecialty),
          )
        : hospitals,
    [hospitals, selectedSpecialty],
  );
  const hospitalsToShow = useMemo(
    () =>
      !selectedSpecialty
        ? []
        : routes.length
          ? routes.map((route) => route.hospital)
          : eligibleHospitals,
    [eligibleHospitals, routes, selectedSpecialty],
  );

  const selectedRoute = routes.find(
    (route) => route.hospital.id === selectedHospitalId,
  );
  const mapRoute = selectedRoute ?? routes[0];

  useEffect(() => {
    if (!origin || !selectedSpecialty || selectedSpecialty === "General Medicine" || selectedSpecialty === "Emergency") {
      setRoutes([]);
      setCalculatingRoutes(false);
      return;
    }

    const originCoordinates = {
      latitude: origin.latitude,
      longitude: origin.longitude,
    };
    const controller = new AbortController();
    setRouteError("");
    setRouteFailures([]);
    setCalculatingRoutes(true);

    async function loadRoutes() {
      try {
        const response = await fetch("/api/appointments/routes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            origin: {
              ...originCoordinates,
            },
            specialty: selectedSpecialty,
          }),
          signal: controller.signal,
        });
        const result = (await response.json()) as RouteResponse;
        if (!response.ok) {
          setRoutes([]);
          setRouteError(
            result.error ?? "Could not calculate hospital routes. Please retry.",
          );
          return;
        }

        const rankedRoutes = result.routes ?? [];
        setRoutes(rankedRoutes);
        setRouteFailures(
          (result.failures ?? []).map(
            (failure) =>
              `Could not calculate a route to ${failure.hospitalName}.`,
          ),
        );
        if (rankedRoutes.length) {
          if (!manualHospitalSelection.current) {
            setSelectedHospitalId(rankedRoutes[0].hospital.id);
          }
          setRouteError("");
        } else {
          setRouteError(
            result.error ??
              "No route was found for hospitals matching this care area.",
          );
        }
      } catch {
        if (!controller.signal.aborted) {
          setRoutes([]);
          setRouteError("Could not reach the route service. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) setCalculatingRoutes(false);
      }
    }

    void loadRoutes();
    return () => controller.abort();
  }, [origin, routeRetry, selectedSpecialty]);

  function selectSpecialty(specialty: string) {
    setSelectedSpecialty(specialty);
    const matchingHospitals = specialty === "Emergency"
      ? hospitals.filter((hospital) => hospital.emergencyServices)
      : specialty === "General Medicine"
      ? hospitals.filter((hospital) => hospital.specialties.length === 0)
      : specialty
      ? hospitals.filter((hospital) =>
          hospitalHasSpecialty(hospital, specialty),
        )
      : hospitals;
    manualHospitalSelection.current = false;
    setSelectedHospitalId(matchingHospitals[0]?.id ?? "");
    setRoutes([]);
    setRouteFailures([]);
    setRouteError("");
  }

  async function submitAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBookingError("");
    setBookingMessage("");
    setSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hospitalId: selectedHospitalId,
          department: formData.get("department"),
          patientPhone: formData.get("patientPhone"),
          scheduledAt: new Date(scheduledAt).toISOString(),
          notes: formData.get("notes"),
        }),
      });
      const result = (await response.json()) as {
        error?: string;
        appointment?: Appointment;
      };
      if (!response.ok || !result.appointment) {
        setBookingError(
          result.error ?? "Could not send your request. Please try again.",
        );
        return;
      }

      setAppointments((current) =>
        [...current, result.appointment!].sort(
          (left, right) =>
            new Date(left.scheduledAt).getTime() -
            new Date(right.scheduledAt).getTime(),
        ),
      );
      setBookingMessage(
        "Appointment request sent. The hospital must confirm it with you.",
      );
      form.reset();
      setAppointmentNotes("");
      setScheduledAt("");
    } catch {
      setBookingError("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,.95fr)]">
      <div className="space-y-8">
        <section className="rounded-3xl border border-[#e2e8e1] bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#eaf4ed] text-[#39806d]">
              <CalendarDays size={21} />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-[#2c433a]">
                Request an appointment
              </h2>
              <p className="mt-1 text-sm leading-6 text-[#738078]">
                Your request is sent to the hospital you choose. Their team
                will confirm availability.
              </p>
            </div>
          </div>

          <form className="mt-6 space-y-4" onSubmit={submitAppointment}>
            <div>
              <label
                className="mb-2 block text-sm font-medium text-[#40564c]"
                htmlFor="department"
              >
                Department or specialty
              </label>
              <select
                className="min-h-12 w-full rounded-xl border border-[#d6dfd8] bg-white px-3 text-sm text-[#263b33] outline-none placeholder:text-[#89968e] focus:border-[#39806d] focus:ring-2 focus:ring-[#39806d]/20"
                id="department"
                name="department"
                value={selectedSpecialty}
                onChange={(event) => selectSpecialty(event.target.value)}
                required
              >
                <option value="">Choose a care area</option>
                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs leading-5 text-[#89968e]">
                Choose from specialties listed by hospitals. This is directory
                matching, not a medical assessment of symptoms.
              </p>
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-medium text-[#40564c]"
                htmlFor="hospitalId"
              >
                Matching hospital
              </label>
              <select
                className="min-h-12 w-full rounded-xl border border-[#d6dfd8] bg-white px-3 text-sm text-[#263b33] outline-none focus:border-[#39806d] focus:ring-2 focus:ring-[#39806d]/20 disabled:bg-[#f5f8f4]"
                id="hospitalId"
                value={selectedHospitalId}
                disabled={!selectedSpecialty || !hospitalsToShow.length}
                onChange={(event) => {
                  manualHospitalSelection.current = true;
                  setSelectedHospitalId(event.target.value);
                }}
                required
              >
                <option value="" disabled>
                  {selectedSpecialty
                    ? "No matching hospital selected"
                    : "Choose a care area first"}
                </option>
                {hospitalsToShow.map((hospital) => (
                  <option key={hospital.id} value={hospital.id}>
                    {hospital.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  className="mb-2 block text-sm font-medium text-[#40564c]"
                  htmlFor="scheduledAt"
                >
                  Preferred date and time
                </label>
                <input
                  className="min-h-12 w-full rounded-xl border border-[#d6dfd8] bg-white px-3 text-sm text-[#263b33] outline-none focus:border-[#39806d] focus:ring-2 focus:ring-[#39806d]/20"
                  id="scheduledAt"
                  name="scheduledAt"
                  type="datetime-local"
                  value={scheduledAt}
                  min={minimumDateTime}
                  onChange={(event) => setScheduledAt(event.target.value)}
                  required
                />
              </div>
              <div>
                <label
                  className="mb-2 block text-sm font-medium text-[#40564c]"
                  htmlFor="patientPhone"
                >
                  Contact phone
                </label>
                <input
                  className="min-h-12 w-full rounded-xl border border-[#d6dfd8] bg-white px-3 text-sm text-[#263b33] outline-none placeholder:text-[#89968e] focus:border-[#39806d] focus:ring-2 focus:ring-[#39806d]/20"
                  id="patientPhone"
                  name="patientPhone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+91 98765 43210"
                  minLength={7}
                  maxLength={32}
                  pattern="[\d\s+().-]{7,32}"
                  title="Enter a phone number with 7 to 15 digits."
                  required
                />
              </div>
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-medium text-[#40564c]"
                htmlFor="notes"
              >
                Note for the hospital{" "}
                <span className="font-normal text-[#89968e]">(optional)</span>
              </label>
              <textarea
                className="min-h-24 w-full resize-y rounded-xl border border-[#d6dfd8] bg-white px-3 py-3 text-sm text-[#263b33] outline-none placeholder:text-[#89968e] focus:border-[#39806d] focus:ring-2 focus:ring-[#39806d]/20"
                id="notes"
                name="notes"
                maxLength={500}
                value={appointmentNotes}
                onChange={(event) => setAppointmentNotes(event.target.value)}
                placeholder="Add a brief scheduling note. Avoid sharing sensitive medical details."
              />
            </div>

            {bookingError && (
              <p className="flex gap-2 text-sm text-[#a64f43]" role="alert">
                <AlertCircle className="mt-0.5 shrink-0" size={16} />
                {bookingError}
              </p>
            )}
            {bookingMessage && (
              <p className="flex gap-2 text-sm text-[#347361]" role="status">
                <Check className="mt-0.5 shrink-0" size={16} />
                {bookingMessage}
              </p>
            )}
            <button
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#286d5c] px-4 text-sm font-semibold text-white transition hover:bg-[#205b4d] focus:outline-none focus:ring-2 focus:ring-[#286d5c] focus:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
              type="submit"
              disabled={
                submitting ||
                !selectedSpecialty ||
                !selectedHospitalId ||
                !hospitalsToShow.some(
                  (hospital) => hospital.id === selectedHospitalId,
                )
              }
            >
              {submitting ? "Sending request..." : "Send appointment request"}
              <CalendarDays size={17} />
            </button>
          </form>
        </section>

        <section
          className="rounded-3xl border border-[#e2e8e1] bg-white p-5 shadow-sm sm:p-7"
          aria-labelledby="hospital-list-heading"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2
                className="text-xl font-semibold text-[#2c433a]"
                id="hospital-list-heading"
              >
                Hospitals you can visit
              </h2>
              <p className="mt-1 text-sm leading-6 text-[#738078]">
                {routes.length
                  ? `Showing hospitals that list ${selectedSpecialty}, ranked by shortest driving distance.`
                  : selectedSpecialty
                    ? `Showing only hospitals that list ${selectedSpecialty}.`
                    : "Choose a care area to see matching hospitals ranked by route distance."}
              </p>
            </div>
            <button
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#cbdccf] bg-white px-4 text-sm font-semibold text-[#315d50] transition hover:bg-[#f5f8f4] focus:outline-none focus:ring-2 focus:ring-[#39806d] focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
              type="button"
              onClick={() => {
                if (!origin) {
                  setLocationRetry((attempt) => attempt + 1);
                } else if (selectedSpecialty) {
                  setRouteRetry((attempt) => attempt + 1);
                }
              }}
              disabled={
                calculatingRoutes ||
                locationStatus === "locating" ||
                (Boolean(origin) && !selectedSpecialty)
              }
            >
              <Navigation size={17} />
              {locationStatus === "locating"
                ? "Finding your location..."
                : calculatingRoutes
                  ? "Finding nearest hospitals..."
                  : origin
                    ? selectedSpecialty
                      ? "Refresh distances"
                      : "Choose a care area"
                    : "Try location again"}
            </button>
          </div>

          <p className="mt-3 text-xs leading-5 text-[#89968e]">
            {locationStatus === "locating"
              ? "Asking your browser for location permission. Your location is used only for this distance search and is not saved."
              : locationStatus === "ready"
                ? origin
                  ? `Using your device location (accuracy about ${Math.round(origin.accuracy)} m). It is shared with OpenRouteService for this search and is not saved to your patient record.`
                  : "Choose a care area to compare hospital distances from your location."
                : "Location access is needed to compare route distances. If you decline, allow it in browser settings and retry."}
          </p>

          {routeError && (
            <p
              className="mt-4 flex gap-2 rounded-xl bg-[#fff4ed] p-3 text-sm leading-6 text-[#8f4a32]"
              role="alert"
            >
              <AlertCircle className="mt-1 shrink-0" size={16} />
              {routeError}
            </p>
          )}
          {routeFailures.length > 0 && (
            <ul
              className="mt-3 space-y-1 text-sm text-[#8f4a32]"
              aria-label="Routes not available"
            >
              {routeFailures.map((failure) => (
                <li key={failure}>{failure}</li>
              ))}
            </ul>
          )}

          <div className="mt-5 space-y-3">
            {hospitalsToShow.map((hospital, index) => {
              const route = routes.find(
                (item) => item.hospital.id === hospital.id,
              );
              const isSelected = selectedHospitalId === hospital.id;
              return (
                <article
                  className={`rounded-2xl border p-4 transition ${
                    isSelected
                      ? "border-[#70a28e] bg-[#f5f9f5]"
                      : "border-[#e7ece6] bg-white"
                  }`}
                  key={hospital.id}
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {routes.length > 0 && (
                          <span className="rounded-full bg-[#eaf4ed] px-2.5 py-1 text-xs font-semibold text-[#347361]">
                            {index === 0 ? "Suggested" : `Option ${index + 1}`}
                          </span>
                        )}
                        {route?.specialtyMatch && (
                          <span className="rounded-full bg-[#edf1fa] px-2.5 py-1 text-xs font-semibold text-[#53679b]">
                            Specialty listed
                          </span>
                        )}
                      </div>
                      <h3 className="mt-2 font-semibold text-[#2c433a]">
                        {hospital.name}
                      </h3>
                      <p className="mt-1 flex items-start gap-1.5 text-sm leading-5 text-[#738078]">
                        <MapPin className="mt-0.5 shrink-0" size={15} />
                        {hospitalAddress(hospital)}
                      </p>
                      {hospital.specialties.length > 0 && (
                        <p className="mt-2 text-xs leading-5 text-[#738078]">
                          Specialties: {hospital.specialties.join(", ")}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      {route && (
                        <p className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-white px-2.5 text-sm font-semibold text-[#315d50]">
                          <Route size={15} />
                          {formatDistance(route.distanceMeters)}
                        </p>
                      )}
                      {route && (
                        <p className="mt-1 text-right text-xs text-[#738078]">
                          Distance only · no live traffic
                        </p>
                      )}
                      <button
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#d6dfd8] bg-white px-3 text-xs font-semibold text-[#40564c] hover:bg-[#f5f8f4]"
                        type="button"
                        onClick={() => {
                          manualHospitalSelection.current = true;
                          setSelectedHospitalId(hospital.id);
                        }}
                      >
                        {isSelected ? (
                          <Check size={14} />
                        ) : (
                          <CalendarDays size={14} />
                        )}
                        {isSelected ? "Selected" : "Choose"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
            {!hospitalsToShow.length && (
              <p className="rounded-xl bg-[#f5f8f4] p-4 text-sm text-[#738078]">
                {!selectedSpecialty
                  ? "Choose a care area above to see only hospitals that list that specialty."
                  : eligibleHospitals.length
                    ? routeError ||
                      "Matching hospitals will appear here when route distances are available."
                    : `No hospital in the current directory lists ${selectedSpecialty}. Choose another care area or check the public directory.`}
              </p>
            )}
          </div>
        </section>

        {appointments.length > 0 && (
          <section
            className="rounded-3xl border border-[#e2e8e1] bg-white p-5 shadow-sm sm:p-7"
            aria-labelledby="your-appointments-heading"
          >
            <h2
              className="text-xl font-semibold text-[#2c433a]"
              id="your-appointments-heading"
            >
              Your appointment requests
            </h2>
            <ul className="mt-4 divide-y divide-[#edf0eb]">
              {appointments.map((appointment) => {
                const hospital = hospitals.find(
                  (entry) => entry.id === appointment.hospitalId,
                );
                return (
                  <li
                    className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
                    key={appointment.id}
                  >
                    <div>
                      <p className="font-semibold text-[#2c433a]">
                        {hospital?.name ?? "Hospital"}
                      </p>
                      <p className="mt-1 text-sm text-[#738078]">
                        {appointment.department} ·{" "}
                        {new Date(appointment.scheduledAt).toLocaleString()}
                      </p>
                    </div>
                    <span className="w-fit rounded-full bg-[#fff3df] px-3 py-1.5 text-xs font-semibold capitalize text-[#8a682e]">
                      {appointment.status.replaceAll("_", " ")}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>

      <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
        {mapRoute && origin ? (
          <section className="overflow-hidden rounded-3xl border border-[#e2e8e1] bg-white shadow-sm">
            <div className="flex items-start justify-between gap-4 p-5">
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-[#347361]">
                  <Route size={16} /> OpenRouteService estimate
                </p>
                <h2 className="mt-2 text-lg font-semibold text-[#2c433a]">
                  {mapRoute.hospital.name}
                </h2>
                <p className="mt-1 text-sm text-[#738078]">
                  {formatDistance(mapRoute.distanceMeters)} driving route
                </p>
              </div>
              <Sparkles
                className="mt-1 shrink-0 text-[#39806d]"
                size={19}
              />
            </div>
            <HospitalRouteMap
              key={mapRoute.hospital.id}
              hospitalName={mapRoute.hospital.name}
              coordinates={mapRoute.coordinates}
              origin={origin}
            />
            <div className="flex flex-wrap gap-3 p-5 pt-4">
              <a
                className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#286d5c] px-4 text-sm font-semibold text-white hover:bg-[#205b4d]"
                href={openStreetMapUrl(mapRoute)}
                target="_blank"
                rel="noreferrer"
              >
                View hospital on OpenStreetMap <ExternalLink size={15} />
              </a>
              {mapRoute.hospital.phone && (
                <a
                  className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#d6dfd8] px-4 text-sm font-semibold text-[#40564c] hover:bg-[#f5f8f4]"
                  href={`tel:${mapRoute.hospital.phone}`}
                >
                  <Phone size={15} /> Call hospital
                </a>
              )}
            </div>
          </section>
        ) : (
          <section className="rounded-3xl border border-[#e2e8e1] bg-white p-6 shadow-sm">
            <div className="grid size-12 place-items-center rounded-2xl bg-[#eaf4ed] text-[#39806d]">
              <Navigation size={22} />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-[#2c433a]">
              Find a nearby hospital
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#738078]">
              {locationStatus === "locating"
                ? "Your browser is asking permission to use your current location."
                : selectedSpecialty
                  ? "Matching hospitals will be ranked by route distance when your location is available."
                  : "Select a care area to find hospitals listing that specialty. Matching hospitals will be ranked by route distance."}
            </p>
          </section>
        )}

        <section className="rounded-2xl border border-[#e5eae4] bg-[#f2f6f1] p-5">
          <h2 className="text-sm font-semibold text-[#354b41]">
            Booking for {patientName}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#687970]">
            Your signed-in profile name is shared with the hospital along
            with your contact number, preferred time, and scheduling note.
          </p>
        </section>
      </aside>
    </div>
  );
}
