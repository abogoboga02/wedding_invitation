const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";

export type LocationSearchResult = {
  placeId: string;
  placeName: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
};

function buildRequestHeaders() {
  return {
    "Accept-Language": "id",
    "User-Agent": "AtelierMempelai/1.0",
  };
}

function normalizeLocationRecord(record: Record<string, unknown>): LocationSearchResult | null {
  const lat = Number(record.lat);
  const lon = Number(record.lon);
  const displayName = typeof record.display_name === "string" ? record.display_name : "";
  const name =
    typeof record.name === "string" && record.name.trim()
      ? record.name.trim()
      : displayName.split(",")[0]?.trim() ?? "";

  if (!Number.isFinite(lat) || !Number.isFinite(lon) || !displayName.trim()) {
    return null;
  }

  return {
    placeId: String(record.place_id ?? `${lat}:${lon}`),
    placeName: name || "Lokasi terpilih",
    formattedAddress: displayName,
    latitude: lat,
    longitude: lon,
  };
}

export async function searchLocations(query: string) {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  const url = new URL(`${NOMINATIM_BASE_URL}/search`);
  url.searchParams.set("q", trimmedQuery);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "5");

  const response = await fetch(url, {
    headers: buildRequestHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Search location request failed.");
  }

  const rawResults = (await response.json()) as unknown[];

  return rawResults
    .map((item) =>
      typeof item === "object" && item !== null
        ? normalizeLocationRecord(item as Record<string, unknown>)
        : null,
    )
    .filter((item): item is LocationSearchResult => Boolean(item));
}

export async function reverseGeocode(latitude: number, longitude: number) {
  const url = new URL(`${NOMINATIM_BASE_URL}/reverse`);
  url.searchParams.set("lat", latitude.toString());
  url.searchParams.set("lon", longitude.toString());
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("zoom", "18");

  const response = await fetch(url, {
    headers: buildRequestHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Reverse geocode request failed.");
  }

  const rawResult = (await response.json()) as Record<string, unknown>;
  return normalizeLocationRecord(rawResult);
}
