import { createHmac, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import users from "../data/users.json";
import patients from "../data/patients.json";

const scryptAsync = promisify(scrypt);
const SESSION_COOKIE = "aayu_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8;

type User = (typeof users)[number];
export type Patient = (typeof patients)[number];

type Session = {
  userId: string;
  expiresAt: number;
};

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

function findUser(userIdOrName: string): User | undefined {
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

export async function authenticateUser(userIdOrName: string, password: string) {
  const user = findUser(userIdOrName);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return null;
  }
  return user;
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

  const user = users.find((candidate) => candidate.id === session.userId);
  if (!user) return null;
  return patients.find((patient) => patient.patientId === user.patientId) ?? null;
}

export async function clearUserSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
