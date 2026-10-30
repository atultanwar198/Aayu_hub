import type { Hospital } from "@/lib/hospitals";

export type HospitalRoute = {
  hospital: Hospital;
  distanceMeters: number;
  coordinates: [number, number][];
};

export type RankedHospitalRoute = HospitalRoute & {
  specialtyMatch: boolean;
};

function normalizeSpecialty(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ");
}

export function hospitalHasSpecialty(
  hospital: Hospital,
  specialty: string,
) {
  const requestedSpecialty = normalizeSpecialty(specialty);
  return (
    requestedSpecialty.length > 0 &&
    hospital.specialties.some(
      (candidate) =>
        normalizeSpecialty(candidate) === requestedSpecialty,
    )
  );
}

export function rankHospitalRoutes(
  routes: HospitalRoute[],
  specialty: string,
): RankedHospitalRoute[] {
  const requestedSpecialty = normalizeSpecialty(specialty);

  return routes
    .filter((route) =>
      requestedSpecialty
        ? hospitalHasSpecialty(route.hospital, specialty)
        : true,
    )
    .map((route) => ({
      ...route,
      specialtyMatch: hospitalHasSpecialty(route.hospital, specialty),
    }))
    .sort((left, right) => {
      if (left.specialtyMatch !== right.specialtyMatch) {
        return left.specialtyMatch ? -1 : 1;
      }
      return left.distanceMeters - right.distanceMeters;
    });
}
