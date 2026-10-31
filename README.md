# Aayu Hub

Aayu Hub is a health information and care navigation demo. It brings together a guided symptom check-in, a hospital directory, appointment requests, patient tools, and hospital/admin workspaces.

> **Important:** Aayu Hub is a software demo, not a medical device or clinical service. The chatbot does not diagnose. Its urgency estimate and department suggestion are unvalidated and must not replace advice from a qualified healthcare professional. If someone may be in immediate danger, contact local emergency services. In India, call **112**. An appointment request does not dispatch an ambulance.

## Contents

- [Features](#features)
- [Technology](#technology)
- [Requirements](#requirements)
- [Run the web app](#run-the-web-app)
- [Configure the medical chatbot](#configure-the-medical-chatbot)
- [Prepare the medical knowledge database](#prepare-the-medical-knowledge-database)
- [Run the backend API](#run-the-backend-api)
- [Environment variables](#environment-variables)
- [Demo accounts](#demo-accounts)
- [Main routes](#main-routes)
- [Data and privacy](#data-and-privacy)
- [External services and limitations](#external-services-and-limitations)
- [Development commands](#development-commands)
- [Project structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Production readiness](#production-readiness)

## Features

### Patient experience

- Create an account, sign in, and maintain a basic patient profile.
- Use the chatbot to describe a health concern and answer follow-up questions.
- Receive a generated symptom summary, suggested department, and preliminary urgency rating.
- Open an appointment request with the suggested care area and chat details prefilled.
- Browse hospital contact information and listed specialties.
- Find hospitals that list a selected department and compare route distances when routing is configured.
- Review appointment requests and their statuses in the patient area.

### Hospital workspace

- Sign in to a hospital-specific workspace.
- Review appointment requests for the signed-in hospital.
- Update appointment statuses.
- Submit proposed changes to a hospital listing for admin review.

### Admin workspace

- View account and patient profile information.
- Create accounts and manage hospital listings and hospital staff accounts.
- Review hospital-submitted directory change requests.

## Technology

- **Web app:** Next.js App Router, React, TypeScript, Tailwind CSS
- **Backend API:** FastAPI and Pydantic
- **Medical search:** PostgreSQL with pgvector and `sentence-transformers/all-MiniLM-L6-v2` embeddings
- **Answer generation:** Groq API; the default model is configured in `backend/generator.py`
- **Maps:** Leaflet and OpenStreetMap tiles
- **Route estimates:** OpenRouteService
- **Demo storage:** JSON files in `data/` for accounts, patient profiles, appointments, hospitals, and update requests

## Requirements

- Node.js and npm compatible with the versions in `package.json`
- Python 3.11 or later recommended, with pip
- PostgreSQL with the pgvector extension, for the medical chatbot
- A Groq API key, for generated chatbot responses
- An OpenRouteService API key, optional, for route comparison

The web application can run without the chatbot backend or route service, but those features will be unavailable. The chatbot backend requires its model and database configuration to import and start successfully.

## Run the web app

From the repository root:

```bash
npm install
```

Copy the example configuration and set private values:

```bash
cp .env.example .env.local
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.example .env.local
```

At minimum, configure a unique `SESSION_SECRET` (32 or more characters) before using authentication outside local development. To enable administrator login, set `ADMIN_ID`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD`. To enable route comparisons, set `OPENROUTESERVICE_API_KEY`.

Start Next.js:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Create an account at `/signup` or use a demo account if it exists in the local data files. The Next.js app calls the chatbot at `http://127.0.0.1:8000` by default; set `NEXT_PUBLIC_API_URL` in `.env.local` if the API runs at another address.

## Configure the medical chatbot

The chatbot API reads its own environment file from `backend/.env`. Create it with:

```dotenv
PG_CONNECTION=postgresql://USER:PASSWORD@HOST:5432/DATABASE
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-20b
```

`PG_CONNECTION` and `GROQ_API_KEY` are required. `GROQ_MODEL` is optional; the value above matches the current default. Use a URL-encoded password if it contains characters that have special meaning in a connection URL.

Install the Python dependencies from the repository root:

```bash
python -m venv .venv
```

Activate the environment:

```bash
# macOS/Linux
source .venv/bin/activate

# Windows PowerShell
.venv\Scripts\Activate.ps1
```

Then install dependencies:

```bash
pip install -r backend/requirements.txt
```

The first run may download the sentence-transformer model. Ensure the machine can reach the model host and has enough disk space and memory for the embedding dependencies.

## Prepare the medical knowledge database

The backend expects PostgreSQL tables named `documents` and `document_chunks`. The ingestion script inserts into these tables; it does not create them. Connect to the database and create the pgvector extension and tables once:

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS documents (
  id BIGSERIAL PRIMARY KEY,
  filename TEXT NOT NULL,
  file_type TEXT,
  file_data BYTEA
);

CREATE TABLE IF NOT EXISTS document_chunks (
  id BIGSERIAL PRIMARY KEY,
  document_id BIGINT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  chunk_text TEXT NOT NULL,
  embedding VECTOR(384) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);
```

The embedding dimension is 384 for the configured MiniLM model. The schema must match the model if you change embedding models.

Knowledge source files belong under `backend/docs/`. The repository currently includes text documents there. Supported ingestion formats are `.txt`, `.pdf`, and `.docx`. Ingestion assigns a department from the document's parent folder; files directly in `backend/docs/` are tagged `ALL`.

Run ingestion from the repository root:

```bash
python backend/ingest.py
```

The current script inserts documents and chunks each time it runs. Avoid re-ingesting the same corpus without clearing or otherwise managing the existing rows, or duplicates will accumulate.

## Run the backend API

From the repository root, with `backend/.env` configured and Python dependencies installed:

```bash
uvicorn api:app --app-dir backend --reload --host 127.0.0.1 --port 8000
```

Useful endpoints:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/` | API status message |
| `GET` | `/health` | Basic health response |
| `POST` | `/api/chat` | Ask a medical information question |
| `POST` | `/api/assess` | Generate a summary from the symptom interview answers |

The API CORS configuration currently allows the local Next.js origins `http://localhost:3000` and `http://127.0.0.1:3000`.

## Environment variables

### Next.js (`.env.local`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `SESSION_SECRET` | Required for production | Signs login session tokens; use a private random value of at least 32 characters. |
| `ADMIN_ID` | For admin login | Admin login identifier. |
| `ADMIN_USERNAME` | For admin login | Alternate configured admin identifier. |
| `ADMIN_PASSWORD` | For admin login | Admin password; use a unique, strong value. |
| `OPENROUTESERVICE_API_KEY` | Optional | Server-side geocoding and driving route requests. |
| `NEXT_PUBLIC_API_URL` | Optional | Chatbot API base URL; defaults to `http://127.0.0.1:8000`. |

### FastAPI (`backend/.env`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `PG_CONNECTION` | Yes | PostgreSQL connection URL for pgvector retrieval and ingestion. |
| `GROQ_API_KEY` | Yes | API key used for generated chatbot answers. |
| `GROQ_MODEL` | No | Groq model identifier; defaults to `openai/gpt-oss-20b`. |

Never commit `.env.local`, `backend/.env`, API keys, session secrets, or real patient data. The example environment file should contain placeholders only.

## Demo accounts

The README has historically documented these local demo accounts. They may not exist in a fresh checkout if the corresponding JSON data files have changed.

| Role | Login | Password |
| --- | --- | --- |
| Patient | `AAYU-1001` | `Patient@123` |
| Hospital staff — Medanta | `medanta-demo` | `HospitalDemo@2026` |
| Hospital staff — Fortis | `fortis-demo` | `HospitalDemo@2026` |
| Hospital staff — Artemis | `artemis-demo` | `HospitalDemo@2026` |

These are shared demo credentials. Do not use them for a public deployment. Change or remove demo accounts and passwords before sharing a deployed instance.

Admin credentials are configured through `ADMIN_ID` (or `ADMIN_USERNAME`) and `ADMIN_PASSWORD`; they are not shown in the site UI.

## Main routes

| Route | Access | Description |
| --- | --- | --- |
| `/` | Public | Landing page and feature overview |
| `/chatbot` | Public | Guided symptom check-in and health information chat |
| `/hospitals` | Public | Hospital directory |
| `/signup` | Public | Create a patient account |
| `/login` | Public | Patient or configured admin sign-in |
| `/appointments` | Patient | Request appointments, choose care area, review requests |
| `/patients` | Patient | Patient dashboard |
| `/patients/health` | Patient | Patient health information |
| `/hospital-management/login` | Public | Hospital staff sign-in |
| `/hospital-management/appointments` | Hospital staff | View and update that hospital's requests |
| `/hospital-management/update-request` | Hospital staff | Propose hospital directory updates |
| `/admin` | Admin | Admin overview |
| `/admin/users` | Admin | Account management |
| `/admin/patients` | Admin | Patient profile management |
| `/admin/hospitals` | Admin | Hospital directory and staff account management |
| `/admin/hospital-requests` | Admin | Review proposed hospital changes |

Protected pages redirect users who are not signed in with the required role.

## Data and privacy

- Demo accounts, patient profiles, hospital accounts, hospital listings, appointment requests, and hospital update requests are stored in JSON files under `data/`.
- Passwords for patient and hospital accounts are stored as scrypt hashes. Login sessions use signed, HTTP-only cookies.
- JSON files and in-process write queues are intended for a local, single-server demo. They do not provide the durability, concurrency guarantees, audit trails, or operational controls required for production patient data.
- Chat messages are sent to the configured FastAPI service and, for generated answers, to the configured Groq model. Assessment answers are used to query the medical knowledge database and generate the summary.
- Appointment notes may contain chat details when the user follows the appointment link. The user can review and edit the note before submitting the appointment request.
- When route comparison is used, browser location coordinates are sent to the Aayu Hub server and forwarded to OpenRouteService. The app does not add those coordinates to the appointment record. Review OpenRouteService terms and privacy practices before enabling this feature for real users.

Do not enter real patient information into this demo.

## External services and limitations

- **Groq:** Required for generated chatbot answers and assessments.
- **PostgreSQL/pgvector:** Required for retrieval over the configured medical documents.
- **OpenRouteService:** Optional; enables geocoding and route-distance comparisons. Without a key, hospital browsing and appointment requests remain available, but route comparisons do not.
- **OpenStreetMap:** Map tiles and road data are used by the route map. Map attribution must remain visible.
- **Directory data:** Hospital names, addresses, phone numbers, emergency-service flags, and specialties are maintained as demo directory information. Verify them with each hospital before relying on or publishing them.
- **Medical content:** The chatbot is a general information tool. Retrieved documents can be incomplete or out of date, model output can be wrong, department recommendations can be uncertain, and the urgency rating is not clinically validated.
- **Emergency pathway:** A 4/5 or 5/5 model-generated rating is treated as an emergency by the UI. The chatbot and appointment form cannot assess a real emergency, contact emergency services, or dispatch an ambulance. Call 112 in India or the relevant local emergency number when immediate help may be needed.
- **Appointment requests:** A request is saved with `scheduled` status and must be confirmed by the hospital. Even an emergency-priority request is not a dispatch or guarantee of immediate care.

## Development commands

```bash
npm run dev       # Start the Next.js development server
npm run lint      # Lint app/, components/, and lib/
npm run build     # Create a production build
npm run start     # Serve a production build
```

There is no `npm test` script configured in `package.json`. The lint command does not lint the Python backend.

## Project structure

```text
app/                         Next.js pages and API routes
  api/                       Authentication, admin, appointments, routing APIs
  appointments/               Patient appointment request UI and route map
  chatbot/                    Guided symptom conversation UI
  hospital-management/        Hospital staff pages
  admin/                      Admin pages
  patients/                   Patient dashboard and health pages
backend/                      FastAPI, RAG pipeline, ingestion, and source docs
  docs/                        Medical and hospital knowledge documents
  api.py                       FastAPI endpoints
  ingest.py                    Load documents and store vector embeddings
  retriever.py                 pgvector similarity search
  generator.py                 Groq model prompt and response generation
components/                    Shared navigation and footer components
data/                          Demo JSON data files
lib/                           Authentication, hospitals, and appointment helpers
```

## Troubleshooting

### Chatbot reports that it cannot connect

Confirm that FastAPI is running on port `8000`, `NEXT_PUBLIC_API_URL` points to the correct address, and the browser origin is allowed by the backend CORS configuration.

### Backend fails during startup

Confirm `backend/.env` exists and contains `PG_CONNECTION` and `GROQ_API_KEY`. The backend imports its retrieval and generation components during startup, so missing values may prevent the API from starting, including its health endpoint.

### Database table or vector errors

Confirm PostgreSQL has the pgvector extension, that both expected tables exist, and `document_chunks.embedding` uses `VECTOR(384)` for the configured embedding model.

### No relevant medical documents are found

Confirm that source files are present under `backend/docs/`, the database schema has been created, ingestion completed successfully, and the `PG_CONNECTION` value points to the same database used by the API.

### Route comparison is unavailable

Confirm `OPENROUTESERVICE_API_KEY` is configured in `.env.local`, restart Next.js after changing environment variables, and allow location access in the browser. Route estimates can fail if geocoding, hospital address data, or the external service is unavailable.

### Patient or hospital sign-in fails

Check that the account exists in the local JSON files, that demo credentials have not been changed, and that `SESSION_SECRET` is configured consistently. For a new environment, register a patient account at `/signup`.

## Production readiness

This project is a demonstration, not a production-ready clinical platform. Before any real deployment or use with real patient information, the project would need, at minimum:

- A production database and safe multi-instance data handling instead of JSON files.
- A clinical safety review and validation of triage logic, urgency thresholds, and department routing.
- Verified, maintained medical sources and a process for updating and reviewing them.
- A privacy, security, retention, access-control, and audit review appropriate to the deployment jurisdiction.
- Real emergency operations and hospital notification workflows; a booking request is not an emergency response system.
- Verified hospital directory data and clear user consent for location and third-party processing.
- Operational monitoring, backups, error reporting, and deployment-specific secrets management.
