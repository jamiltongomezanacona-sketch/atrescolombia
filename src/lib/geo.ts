/** Pure geo helpers for shop distance (no map SDK). */

export type LatLng = {
  latitude: number;
  longitude: number;
};

const EARTH_RADIUS_KM = 6371;

export function isValidLatitude(value: number) {
  return Number.isFinite(value) && value >= -90 && value <= 90;
}

export function isValidLongitude(value: number) {
  return Number.isFinite(value) && value >= -180 && value <= 180;
}

export function hasValidCoordinates(
  latitude: number | null | undefined,
  longitude: number | null | undefined,
): latitude is number {
  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    isValidLatitude(latitude) &&
    isValidLongitude(longitude)
  );
}

/** Great-circle distance in km (Haversine). Returns null if either point is invalid. */
export function haversineDistanceKm(from: LatLng, to: LatLng): number | null {
  if (!hasValidCoordinates(from.latitude, from.longitude) || !hasValidCoordinates(to.latitude, to.longitude)) {
    return null;
  }

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(to.latitude - from.latitude);
  const dLng = toRad(to.longitude - from.longitude);
  const lat1 = toRad(from.latitude);
  const lat2 = toRad(to.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export function formatDistanceKm(km: number | null | undefined) {
  if (km == null || !Number.isFinite(km)) return null;
  if (km < 1) return `${Math.max(0.1, Math.round(km * 10) / 10)} km`;
  if (km < 10) return `${(Math.round(km * 10) / 10).toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

export function buildMapsDirectionsUrl(input: {
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  mapsUrl?: string | null;
}) {
  if (input.mapsUrl?.trim()) return input.mapsUrl.trim();

  if (hasValidCoordinates(input.latitude, input.longitude)) {
    return `https://www.google.com/maps/dir/?api=1&destination=${input.latitude},${input.longitude}`;
  }

  const address = input.address?.trim();
  if (address) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  }

  return null;
}

/** Opens a place in Google Maps search (for public "Ver ubicacion" CTAs). */
export function buildMapsLocationUrl(input: {
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  mapsUrl?: string | null;
}) {
  if (input.mapsUrl?.trim()) return input.mapsUrl.trim();

  if (hasValidCoordinates(input.latitude, input.longitude)) {
    return `https://www.google.com/maps/search/?api=1&query=${input.latitude},${input.longitude}`;
  }

  const address = input.address?.trim();
  if (address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }

  return null;
}

export function parseOptionalCoordinate(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : Number.NaN;
}
