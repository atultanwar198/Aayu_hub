import {
  createHmac,
  randomBytes,
  randomUUID,
  scrypt,
  timingSafeEqual,
} from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import { join } from "node:path";
import { cookies } from "next/headers";

const scryptAsync = promisify(scrypt);
const SESSION_COOKIE = "aayu_session";
const ADMIN_SESSION_COOKIE = "aayu_admin_session";
const HOSPITAL_SESSION_COOKIE = "aayu_hospital_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8;
const USERS_FILE = join(process.cwd(), "data", "users.json");
const PATIENTS_FILE = join(process.cwd(), "data", "patients.json");
const HOSPITAL_USERS_FILE = join(process.cwd(), "data", "hospital-users.json");

export type User = {
  id: string;
  username: string;
  passwordHash: string;
  patientId: string;
};

export type Patient = {
  patientId: string;
  fullName: string;
  dateOfBirth: string;
  bloodType: string;
  allergies: string[];
  conditions: string[];
  medications: { name: string; instructions: string }[];
  emergencyContact: { name: string; relationship: string; phone: string };
};

type Session = {
  userId: string;
  expiresAt: number;
};

type AdminSession = {
  role: "admin";
  expiresAt: number;
};

type HospitalSession = {
  role: "hospital";
  hospitalId: string;
  username: string;
  expiresAt: number;
};

type HospitalAccount = {
  hospitalId: string;
  username: string;
  passwordHash: string;
};

let registrationQueue = Promise.resolve();

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (secret) {
    if (secret.length < 32) {
      throw new Error("SESSION_SECRET must be at least 32 characters long.");
    }
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be configured in production.");
  }

  return "local-demo-session-secret-change-before-deployment";
}

async function readJsonFile<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, "utf8")) as T;
}

async function writeJsonFile(path: string, value: unknown) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function serializeDataWrite<T>(operation: () => Promise<T>): Promise<T> {
  const result = registrationQueue.then(operation, operation);
  registrationQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

function findUser(users: User[], userIdOrName: string): User | undefined {
  const normalized = userIdOrName.trim().toLowerCase();
  return users.find(
    (user) =>
      user.id.toLowerCase() === normalized ||
      user.username.toLowerCase() === normalized,
  );
}

async function verifyPassword(password: string, passwordHash: string) {
  const [algorithm, salt, storedHash] = passwordHash.split("$");
  if (algorithm !== "scrypt" || !salt || !storedHash) {
    throw new Error("Invalid password hash in user data.");
  }

  const expected = Buffer.from(storedHash, "hex");
  const actual = (await scryptAsync(password, salt, expected.length)) as Buffer;
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scryptAsync(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${hash.toString("hex")}`;
}

export async function authenticateUser(userIdOrName: string, password: string) {
  const users = await readJsonFile<User[]>(USERS_FILE);
  const user = findUser(users, userIdOrName);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return null;
  }
  return user;
}

export async function authenticateHospital(
  userIdOrName: string,
  password: string,
): Promise<Omit<HospitalAccount, "passwordHash"> | null> {
  const accounts = await readJsonFile<HospitalAccount[]>(HOSPITAL_USERS_FILE);
  const normalized = userIdOrName.trim().toLowerCase();
  const account = accounts.find(
    (candidate) => candidate.username.toLowerCase() === normalized,
  );
  if (!account || !(await verifyPassword(password, account.passwordHash))) {
    return null;
  }
  return { hospitalId: account.hospitalId, username: account.username };
}

export async function createHospitalAccount({
  hospitalId,
  username,
  password,
}: {
  hospitalId: string;
  username: string;
  password: string;
}): Promise<"created" | "username-taken" | "hospital-not-found"> {
  return serializeDataWrite(async () => {
    const [accounts, hospitals, users] = await Promise.all([
      readJsonFile<HospitalAccount[]>(HOSPITAL_USERS_FILE),
      readFile(join(process.cwd(), "data", "hospitals.json"), "utf8").then(
        (content) => JSON.parse(content) as { id: string }[],
      ),
      readJsonFile<User[]>(USERS_FILE),
    ]);
    if (!hospitals.some((hospital) => hospital.id === hospitalId)) {
      return "hospital-not-found";
    }

    const normalized = username.trim().toLowerCase();
    if (
      accounts.some(
        (account) =>
          account.username.toLowerCase() === normalized &&
          account.hospitalId !== hospitalId,
      ) ||
      users.some((user) => user.username.toLowerCase() === normalized) ||
      isAdminLoginIdentifier(username)
    ) {
      return "username-taken";
    }

    const updatedAccount: HospitalAccount = {
      hospitalId,
      username: username.trim(),
      passwordHash: await hashPassword(password),
    };
    const existingIndex = accounts.findIndex(
      (account) => account.hospitalId === hospitalId,
    );
    if (existingIndex === -1) accounts.push(updatedAccount);
    else accounts[existingIndex] = updatedAccount;

    await writeJsonFile(HOSPITAL_USERS_FILE, accounts);
    return "created";
  });
}

export async function getHospitalAccountSummaries(): Promise<
  { hospitalId: string; username: string }[]
> {
  const accounts = await readJsonFile<HospitalAccount[]>(HOSPITAL_USERS_FILE);
  return accounts.map(({ hospitalId, username }) => ({ hospitalId, username }));
}

export async function registerUser({
  fullName,
  email,
  password,
}: {
  fullName: string;
  email: string;
  password: string;
}): Promise<User | null> {
  return serializeDataWrite(async () => {
    const [users, patients] = await Promise.all([
      readJsonFile<User[]>(USERS_FILE),
      readJsonFile<Patient[]>(PATIENTS_FILE),
    ]);
    const username = email.trim().toLowerCase();
    if (users.some((user) => user.username.toLowerCase() === username)) {
      return null;
    }

    const identifier = randomUUID().replaceAll("-", "").toUpperCase();
    const user: User = {
      id: `AAYU-${identifier}`,
      username,
      passwordHash: await hashPassword(password),
      patientId: `PAT-${identifier}`,
    };
    const patient: Patient = {
      patientId: user.patientId,
      fullName: fullName.trim(),
      dateOfBirth: "",
      bloodType: "Not provided",
      allergies: [],
      conditions: [],
      medications: [],
      emergencyContact: { name: "", relationship: "", phone: "" },
    };

    await writeJsonFile(USERS_FILE, [...users, user]);
    await writeJsonFile(PATIENTS_FILE, [...patients, patient]);
    return user;
  });
}

function signSession(payload: string) {
  return createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("base64url");
}

function verifySignature(payload: string, signature: string) {
  const expected = Buffer.from(signSession(payload));
  const actual = Buffer.from(signature);
  return (
    expected.length === actual.length && timingSafeEqual(expected, actual)
  );
}

function createSignedToken(payload: object) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );
  return `${encodedPayload}.${signSession(encodedPayload)}`;
}

function readSignedToken(token: string): unknown {
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra || !verifySignature(payload, signature)) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export async function createUserSession(user: User) {
  const session: Session = {
    userId: user.id,
    expiresAt: Date.now() + SESSION_DURATION_SECONDS * 1000,
  };
  const token = createSignedToken(session);

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function getCurrentPatient(): Promise<Patient | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = readSignedToken(token) as Session | null;
  if (!session) return null;

  if (
    typeof session.userId !== "string" ||
    typeof session.expiresAt !== "number" ||
    session.expiresAt <= Date.now()
  ) {
    return null;
  }

  const [users, patients] = await Promise.all([
    readJsonFile<User[]>(USERS_FILE),
    readJsonFile<Patient[]>(PATIENTS_FILE),
  ]);
  const user = users.find((candidate) => candidate.id === session.userId);
  if (!user) return null;
  return patients.find((patient) => patient.patientId === user.patientId) ?? null;
}

export function isAdminLoginIdentifier(userIdOrName: string) {
  const normalized = userIdOrName.trim().toLowerCase();
  return [process.env.ADMIN_ID, process.env.ADMIN_USERNAME].some(
    (identifier) => identifier?.trim().toLowerCase() === normalized,
  );
}

export function isAdminCredentialsConfigured() {
  return Boolean(
    process.env.ADMIN_ID?.trim() &&
      process.env.ADMIN_USERNAME?.trim() &&
      (process.env.ADMIN_PASSWORD?.length ?? 0) >= 8,
  );
}

export async function authenticateAdmin(
  userIdOrName: string,
  password: string,
) {
  if (!isAdminCredentialsConfigured() || !isAdminLoginIdentifier(userIdOrName)) {
    return false;
  }

  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredPassword) return false;

  const supplied = Buffer.from(password);
  const expected = Buffer.from(configuredPassword);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export async function createAdminSession() {
  const session: AdminSession = {
    role: "admin",
    expiresAt: Date.now() + SESSION_DURATION_SECONDS * 1000,
  };
  (await cookies()).set(ADMIN_SESSION_COOKIE, createSignedToken(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function createHospitalSession(
  account: Omit<HospitalAccount, "passwordHash">,
) {
  const session: HospitalSession = {
    role: "hospital",
    hospitalId: account.hospitalId,
    username: account.username,
    expiresAt: Date.now() + SESSION_DURATION_SECONDS * 1000,
  };
  (await cookies()).set(HOSPITAL_SESSION_COOKIE, createSignedToken(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function getCurrentHospitalSession(): Promise<{
  hospitalId: string;
  username: string;
} | null> {
  const token = (await cookies()).get(HOSPITAL_SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = readSignedToken(token) as HospitalSession | null;
  if (
    !session ||
    session.role !== "hospital" ||
    typeof session.hospitalId !== "string" ||
    typeof session.username !== "string" ||
    typeof session.expiresAt !== "number" ||
    session.expiresAt <= Date.now()
  ) {
    return null;
  }

  const accounts = await readJsonFile<HospitalAccount[]>(HOSPITAL_USERS_FILE);
  const account = accounts.find(
    (candidate) =>
      candidate.hospitalId === session.hospitalId &&
      candidate.username === session.username,
  );
  return account
    ? { hospitalId: session.hospitalId, username: session.username }
    : null;
}

export async function clearHospitalSession() {
  (await cookies()).delete(HOSPITAL_SESSION_COOKIE);
}

export async function hasAdminSession() {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return false;

  const session = readSignedToken(token) as AdminSession | null;
  return Boolean(
    session &&
      session.role === "admin" &&
      typeof session.expiresAt === "number" &&
      session.expiresAt > Date.now(),
  );
}

export async function clearAdminSession() {
  (await cookies()).delete(ADMIN_SESSION_COOKIE);
}

export type AdminPatientRecord = {
  userId: string;
  username: string;
  patientId: string;
  patient: Patient | null;
};

export async function getAdminPatientRecords(): Promise<AdminPatientRecord[]> {
  const [users, patients] = await Promise.all([
    readJsonFile<User[]>(USERS_FILE),
    readJsonFile<Patient[]>(PATIENTS_FILE),
  ]);
  const patientById = new Map(
    patients.map((patient) => [patient.patientId, patient]),
  );

  return users
    .map(({ id, username, patientId }) => ({
      userId: id,
      username,
      patientId,
      patient: patientById.get(patientId) ?? null,
    }))
    .sort((left, right) => left.username.localeCompare(right.username));
}

export async function updatePatientRecord(
  patientId: string,
  updates: Omit<Patient, "patientId">,
) {
  return serializeDataWrite(async () => {
    const [users, patients] = await Promise.all([
      readJsonFile<User[]>(USERS_FILE),
      readJsonFile<Patient[]>(PATIENTS_FILE),
    ]);
    if (!users.some((user) => user.patientId === patientId)) return false;

    const patientIndex = patients.findIndex(
      (patient) => patient.patientId === patientId,
    );
    if (patientIndex === -1) {
      patients.push({ patientId, ...updates });
    } else {
      patients[patientIndex] = { patientId, ...updates };
    }
    await writeJsonFile(PATIENTS_FILE, patients);
    return true;
  });
}

export async function clearUserSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
