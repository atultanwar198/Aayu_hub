# Aayu Hub

A demo patient portal built with Next.js.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Visitors can create an
account at `/signup` or sign in at `/login`.

The demo account is `AAYU-1001` / `Patient@123`.

Patient sign-in opens `/appointments`, where signed-in users can choose a
listed care area, compare matching hospitals by route distance, request an
appointment, and review their requests. The page asks the browser for location
permission when it opens; route lookup begins after the patient selects a care
area. Hospital staff can see incoming requests in their hospital appointment
list. Requests start as scheduled and must be confirmed directly by the
hospital. The current directory-specialty match is not a diagnosis; chatbot
symptom-to-specialty suggestions can be connected through the optional
`/appointments?specialty=Cardiology` parameter.

## Demo account storage

New accounts are stored in `data/users.json` and `data/patients.json` on the
server, and passwords are stored as scrypt hashes. This local JSON storage is
intended only for a single-server demo; it is not suitable for production or
real patient information. New accounts start with an empty patient record.

Before deploying, configure a `SESSION_SECRET` of at least 32 characters.

## Admin console

Admins sign in from `/login` using the configured admin ID or username and
password. Copy `.env.example` to `.env.local`, set a private `ADMIN_PASSWORD`
of at least 8 characters, and restart the app. For deployments, use a unique
password of at least 16 characters. Production also requires a `SESSION_SECRET`
of at least 32 characters.

The admin password is kept in environment configuration rather than
`data/users.json`. `/admin/login` redirects to the shared `/login` page.

After signing in, `/admin` provides an overview of account, profile, and
hospital-directory data. Separate admin pages manage patient records, create
user accounts, and add or edit hospital listings. Hospital listings appear
publicly at `/hospitals`. Hospital directory information should be verified
before it is published. Password hashes are never shown. The
JSON-backed admin console is for a local single-server demo only; do not use it
to store or manage real patient information.

## Hospital workspace

Administrators can provision a hospital username and password from
`/admin/hospitals`. Hospital staff sign in at `/hospital-management/login` to
view that hospital's appointments and update statuses. Staff can submit
proposed directory changes at `/hospital-management/update-request`; changes
remain pending until an administrator reviews them at
`/admin/hospital-requests`.

Local demo hospital accounts (all use password `HospitalDemo@2026`):

- Medanta: `medanta-demo`
- Fortis: `fortis-demo`
- Artemis: `artemis-demo`

These are shared demo credentials. Change or remove them before any public
deployment. Demo appointment records and patient details are fictional and
must not be used for clinical care.

## Hospital route estimates

Copy `.env.example` to `.env.local` and set `OPENROUTESERVICE_API_KEY` from
your OpenRouteService account. The key stays on the server and is used to
geocode hospital addresses and calculate driving routes.

After a patient grants location permission and selects a care area, their
current coordinates are sent to the Aayu Hub server and forwarded to
OpenRouteService for route calculation. Aayu Hub does not save coordinates to
patient records or appointment requests; OpenRouteService's use of location
data is governed by its terms. Only hospitals listing the selected specialty
are routed, ordered by shortest driving distance. The app displays distance
only; it does not calculate travel times or use live traffic. Routes use
OpenStreetMap road data. Hospital address geocoding is biased toward the
listed city, and results more than 50 km from that city are rejected to avoid
showing routes to incorrect locations. The interactive
map uses OpenStreetMap tiles via Leaflet and includes required map attribution.
Without an ORS key, appointment requests and the hospital list still work, but
route comparisons are unavailable.
