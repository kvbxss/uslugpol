type GeoPoint = {
  lat: number;
  lon: number;
};

const OFFICE_LAT = Number(process.env.USLUGPOL_OFFICE_LAT ?? "50.0647");
const OFFICE_LON = Number(process.env.USLUGPOL_OFFICE_LON ?? "19.9450");
const GEO_CACHE = new Map<string, GeoPoint | null>();

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const r = 6371;
  const dLat = toRadians(b.lat - a.lat);
  const dLon = toRadians(b.lon - a.lon);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);

  const t =
    sinLat * sinLat +
    Math.cos(lat1) * Math.cos(lat2) * sinLon * sinLon;

  return 2 * r * Math.atan2(Math.sqrt(t), Math.sqrt(1 - t));
}

async function geocodeLocation(location: string): Promise<GeoPoint | null> {
  const key = location.trim().toLowerCase();
  if (!key) {
    return null;
  }

  if (GEO_CACHE.has(key)) {
    return GEO_CACHE.get(key) ?? null;
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", location);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "pl");

  try {
    const response = await fetch(url, {
      headers: {
        "Accept-Language": "pl",
        "User-Agent": "uslugpol-mvp/1.0",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      GEO_CACHE.set(key, null);
      return null;
    }

    const payload = (await response.json()) as Array<{
      lat: string;
      lon: string;
    }>;
    const first = payload[0];
    if (!first) {
      GEO_CACHE.set(key, null);
      return null;
    }

    const lat = Number(first.lat);
    const lon = Number(first.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      GEO_CACHE.set(key, null);
      return null;
    }

    const point = { lat, lon };
    GEO_CACHE.set(key, point);
    return point;
  } catch {
    GEO_CACHE.set(key, null);
    return null;
  }
}

export async function getDistanceFromOfficeKm(
  location: string,
): Promise<number | null> {
  const target = await geocodeLocation(location);
  if (!target) {
    return null;
  }

  const office = { lat: OFFICE_LAT, lon: OFFICE_LON };
  return Math.round(haversineKm(office, target));
}
