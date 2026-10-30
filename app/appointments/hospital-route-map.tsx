"use client";

import {
  CircleMarker,
  MapContainer,
  Popup,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet";
import { useEffect } from "react";
import type { LatLngBoundsExpression, LatLngTuple } from "leaflet";

function FitRouteBounds({
  bounds,
}: {
  bounds: LatLngBoundsExpression;
}) {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(bounds, { padding: [28, 28] });
  }, [bounds, map]);

  return null;
}

export default function HospitalRouteMap({
  hospitalName,
  coordinates,
  origin,
}: {
  hospitalName: string;
  coordinates: [number, number][];
  origin: { latitude: number; longitude: number; accuracy: number };
}) {
  const route: LatLngTuple[] = coordinates.map(
    ([longitude, latitude]) => [latitude, longitude],
  );
  const originPosition: LatLngTuple = [origin.latitude, origin.longitude];
  const destination = route[route.length - 1];
  const bounds: LatLngBoundsExpression = [...route, originPosition];

  return (
    <MapContainer
      className="z-0 h-[360px] w-full"
      center={destination}
      zoom={12}
      scrollWheelZoom={false}
      attributionControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <FitRouteBounds bounds={bounds} />
      <Polyline
        positions={route}
        pathOptions={{ color: "#286d5c", weight: 5, opacity: 0.85 }}
      />
      <CircleMarker
        center={originPosition}
        radius={8}
        pathOptions={{
          color: "#ffffff",
          weight: 3,
          fillColor: "#4b79c9",
          fillOpacity: 1,
        }}
      >
        <Popup>
          Your current location (accuracy about {Math.round(origin.accuracy)} m)
        </Popup>
      </CircleMarker>
      <CircleMarker
        center={destination}
        radius={9}
        pathOptions={{
          color: "#ffffff",
          weight: 3,
          fillColor: "#c75b4b",
          fillOpacity: 1,
        }}
      >
        <Popup>{hospitalName}</Popup>
      </CircleMarker>
    </MapContainer>
  );
}
