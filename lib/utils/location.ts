export type StructuredInvitationLocation = {
  latitude: number;
  longitude: number;
  placeName: string;
  formattedAddress: string;
  googleMapsUrl: string;
};

export function isFiniteCoordinate(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function buildGoogleMapsUrl(
  latitude: number,
  longitude: number,
  placeName?: string | null,
) {
  const label = placeName?.trim()
    ? `(${encodeURIComponent(placeName.trim())})`
    : "";

  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}${label}`;
}

export function normalizePlaceName(value?: string | null, fallbackAddress?: string | null) {
  const trimmedValue = value?.trim();

  if (trimmedValue) {
    return trimmedValue;
  }

  const trimmedAddress = fallbackAddress?.trim();

  if (!trimmedAddress) {
    return "";
  }

  return trimmedAddress.split(",")[0]?.trim() ?? trimmedAddress;
}
