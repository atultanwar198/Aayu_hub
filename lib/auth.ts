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
const SESSION_DURATION_SECONDS = 60 * 60 * 8;
const USERS_FILE = join(process.cwd(), "data", "users.json");
const PATIENTS_FILE = join(process.cwd(), "data", "patients.json");

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

export async function registerUser({
  fullName,
  email,
  password,
}: {
  fullName: string;
  email: string;
  password: string;
}): Promise<User | null> {
  const register = async () => {
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
  };

  const result = registrationQueue.then(register, register);
  registrationQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

function signSession(payload: string) {
  return createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("base64url");
}

export async function createUserSession(user: User) {
  const session: Session = {
    userId: user.id,
    expiresAt: Date.now() + SESSION_DURATION_SECONDS * 1000,
  };
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const token = `${payload}.${signSession(payload)}`;

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

  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return null;

  const expectedSignature = Buffer.from(signSession(payload));
  const actualSignature = Buffer.from(signature);
  if (
    expectedSignature.length !== actualSignature.length ||
    !timingSafeEqual(expectedSignature, actualSignature)
  ) {
    return null;
  }

  let session: Session;
  try {
    session = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as Session;
  } catch {
    return null;
  }

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

export async function clearUserSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
