import { NextResponse } from "next/server";
import { getCurrentPatient } from "@/lib/auth";
import {
  hospitalHasSpecialty,
  rankHospitalRoutes,
  type HospitalRoute,
} from "@/lib/hospital-routing";
import { getHospitals, type Hospital } from "@/lib/hospitals";

type GeocodeFeature = {
  geometry?: { coordinates?: unknown };
};

type GeocodeResponse = {
  features?: GeocodeFeature[];
};

type DirectionsFeature = {
  geometry?: { coordinates?: unknown };
  properties?: {
    summary?: {
      distance?: unknown;
    };
  };
};

type DirectionsResponse = {
  features?: DirectionsFeature[];
};

const EARTH_RADIUS_METERS = 6_371_000;
const MAX_HOSPITAL_GEOCODE_DISTANCE_METERS = 50_000;
const cityCoordinatesCache = new Map<
  string,
  Promise<[number, number]>
>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCoordinatePair(value: unknown): value is [number, number] {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number" &&
    Number.isFinite(value[0]) &&
    Number.isFinite(value[1])
  );
}

function isCoordinateList(value: unknown): value is [number, number][] {
  return (
    Array.isArray(value) &&
    value.length > 1 &&
    value.every(isCoordinatePair)
  );
}

function hospitalAddress(hospital: Hospital) {
  return [
    hospital.address,
    hospital.city,
    hospital.state,
    hospital.postalCode,
    "India",
  ]
    .filter(Boolean)
    .join(", ");
}

function distanceBetweenCoordinates(
  left: [number, number],
  right: [number, number],
) {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const [leftLongitude, leftLatitude] = left;
  const [rightLongitude, rightLatitude] = right;
  const latitudeDifference = toRadians(rightLatitude - leftLatitude);
  const longitudeDifference = toRadians(rightLongitude - leftLongitude);
  const haversine =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(toRadians(leftLatitude)) *
      Math.cos(toRadians(rightLatitude)) *
      Math.sin(longitudeDifference / 2) ** 2;

  return (
    2 *
    EARTH_RADIUS_METERS *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

async function searchCoordinates(url: URL, apiKey: string) {
  const response = await fetch(url, {
    headers: { Authorization: apiKey },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) {
    throw new Error(`OpenRouteService geocoding returned ${response.status}.`);
  }

  const result = (await response.json()) as GeocodeResponse;
  const coordinates = result.features?.[0]?.geometry?.coordinates;
  if (!isCoordinatePair(coordinates)) {
    throw new Error("OpenRouteService could not find this hospital address.");
  }
  return coordinates;
}

async function getCityCoordinates(hospital: Hospital, apiKey: string) {
  const cacheKey = `${hospital.city},${hospital.state}`.toLowerCase();
  const cachedCoordinates = cityCoordinatesCache.get(cacheKey);
  if (cachedCoordinates) return cachedCoordinates;

  const lookup = (async () => {
    const url = new URL("https://api.openrouteservice.org/geocode/search");
    url.searchParams.set(
      "text",
      `${hospital.city}, ${hospital.state}, India`,
    );
    url.searchParams.set("size", "1");
    url.searchParams.set("boundary.country", "IND");
    return searchCoordinates(url, apiKey);
  })();
  cityCoordinatesCache.set(cacheKey, lookup);

  try {
    return await lookup;
  } catch (error) {
    cityCoordinatesCache.delete(cacheKey);
    throw error;
  }
}

async function getHospitalCoordinates(
  hospital: Hospital,
  apiKey: string,
): Promise<[number, number]> {
  const cityCoordinates = await getCityCoordinates(hospital, apiKey);
  const url = new URL("https://api.openrouteservice.org/geocode/search");
  url.searchParams.set("text", hospitalAddress(hospital));
  url.searchParams.set("size", "1");
  url.searchParams.set("boundary.country", "IND");
  url.searchParams.set("focus.point.lat", String(cityCoordinates[1]));
  url.searchParams.set("focus.point.lon", String(cityCoordinates[0]));

  const coordinates = await searchCoordinates(url, apiKey);
  if (
    distanceBetweenCoordinates(cityCoordinates, coordinates) >
    MAX_HOSPITAL_GEOCODE_DISTANCE_METERS
  ) {
    throw new Error(
      "OpenRouteService matched the hospital address outside its listed city.",
    );
  }
  return coordinates;
}

async function getDrivingRoute(
  origin: [number, number],
  destination: [number, number],
  hospital: Hospital,
  apiKey: string,
): Promise<HospitalRoute> {
  const response = await fetch(
    "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
    {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coordinates: [origin, destination],
        instructions: false,
      }),
      signal: AbortSignal.timeout(20_000),
    },
  );
  if (!response.ok) {
    throw new Error(`OpenRouteService directions returned ${response.status}.`);
  }

  const result = (await response.json()) as DirectionsResponse;
  const feature = result.features?.[0];
  const summary = feature?.properties?.summary;
  const distanceMeters = summary?.distance;
  const coordinates = feature?.geometry?.coordinates;
  if (
    typeof distanceMeters !== "number" ||
    !Number.isFinite(distanceMeters) ||
    !isCoordinateList(coordinates)
  ) {
    throw new Error("OpenRouteService returned incomplete route data.");
  }

  return {
    hospital,
    distanceMeters,
    coordinates,
  };
}

export async function POST(request: Request) {
  const patient = await getCurrentPatient();
  if (!patient) {
    return NextResponse.json(
      { error: "Patient sign-in is required." },
      { status: 401 },
    );
  }

  const body: unknown = await request.json().catch(() => null);
  if (!isRecord(body) || !isRecord(body.origin)) {
    return NextResponse.json(
      { error: "A valid location is required to compare hospital routes." },
      { status: 400 },
    );
  }

  const originValue = body.origin;
  if (
    typeof originValue.latitude !== "number" ||
    typeof originValue.longitude !== "number" ||
    !Number.isFinite(originValue.latitude) ||
    !Number.isFinite(originValue.longitude) ||
    originValue.latitude < -90 ||
    originValue.latitude > 90 ||
    originValue.longitude < -180 ||
    originValue.longitude > 180 ||
    typeof body.specialty !== "string" ||
    body.specialty.trim().length < 2 ||
    body.specialty.length > 100
  ) {
    return NextResponse.json(
      { error: "A valid location is required to compare hospital routes." },
      { status: 400 },
    );
  }

  const apiKey = process.env.OPENROUTESERVICE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Route comparison is not configured. Add OPENROUTESERVICE_API_KEY to the server environment.",
      },
      { status: 503 },
    );
  }

  const specialty = body.specialty.trim();
  const hospitals = (await getHospitals()).filter((hospital) =>
    hospitalHasSpecialty(hospital, specialty),
  );
  if (!hospitals.length) {
    return NextResponse.json({
      routes: [],
      failures: [],
      error:
        "No listed hospital currently advertises this specialty. Choose another care area or check the public directory.",
    });
  }

  const origin: [number, number] = [
    originValue.longitude,
    originValue.latitude,
  ];
  const attempts = await Promise.all(
    hospitals.map(async (hospital) => {
      try {
        const destination = await getHospitalCoordinates(hospital, apiKey);
        const route = await getDrivingRoute(
          origin,
          destination,
          hospital,
          apiKey,
        );
        return { route, failure: null };
      } catch (error) {
        console.error(
          `Could not calculate an OpenRouteService route to ${hospital.id}.`,
          error,
        );
        return {
          route: null,
          failure: {
            hospitalId: hospital.id,
            hospitalName: hospital.name,
          },
        };
      }
    }),
  );

  const routes = attempts.flatMap((attempt) =>
    attempt.route ? [attempt.route] : [],
  );
  const failures = attempts.flatMap((attempt) =>
    attempt.failure ? [attempt.failure] : [],
  );

  if (!routes.length) {
    return NextResponse.json(
      {
        error:
          "OpenRouteService could not calculate hospital routes. Check the API key, account limits, and hospital addresses.",
        failures,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    routes: rankHospitalRoutes(
      routes,
      specialty,
    ),
    failures,
  });
}
