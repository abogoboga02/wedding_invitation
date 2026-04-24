"use client";

import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";

import type { StructuredInvitationLocation } from "@/lib/utils/location";
import { buildGoogleMapsUrl } from "@/lib/utils/location";

type SearchResult = {
  placeId: string;
  placeName: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
};

export type LocationPickerValue = {
  placeName: string;
  formattedAddress: string;
  latitude: number | null;
  longitude: number | null;
  googleMapsUrl: string | null;
};

type LocationPickerFieldProps = {
  value: LocationPickerValue;
  error?: string;
  embedded?: boolean;
  onChange?: (value: LocationPickerValue) => void;
};

type LeafletModule = typeof import("leaflet");

function getInitialSelection(
  value: LocationPickerValue,
): StructuredInvitationLocation | null {
  if (
    !value.placeName.trim() ||
    !value.formattedAddress.trim() ||
    typeof value.latitude !== "number" ||
    typeof value.longitude !== "number"
  ) {
    return null;
  }

  return {
    placeName: value.placeName,
    formattedAddress: value.formattedAddress,
    latitude: value.latitude,
    longitude: value.longitude,
    googleMapsUrl:
      value.googleMapsUrl ?? buildGoogleMapsUrl(value.latitude, value.longitude, value.placeName),
  };
}

export function LocationPickerField({
  value,
  error,
  embedded = false,
  onChange,
}: LocationPickerFieldProps) {
  const initialSelectionRef = useRef<StructuredInvitationLocation | null>(getInitialSelection(value));
  const [query, setQuery] = useState(value.placeName || value.formattedAddress);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string>();
  const [selection, setSelection] = useState<StructuredInvitationLocation | null>(() =>
    getInitialSelection(value),
  );
  const [isMapReady, setIsMapReady] = useState(false);
  const [isResolvingPoint, setIsResolvingPoint] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markerRef = useRef<import("leaflet").Marker | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);

  const markerIconHtml = useMemo(
    () =>
      "<span class=\"location-marker-pin\"><span class=\"location-marker-pin__inner\"></span></span>",
    [],
  );

  const resolveFromPoint = useEffectEvent(async (latitude: number, longitude: number) => {
    setIsResolvingPoint(true);
    setSearchError(undefined);

    const response = await fetch(`/api/location/reverse?lat=${latitude}&lng=${longitude}`);
    const data = (await response.json()) as {
      error?: string;
      result?: SearchResult;
    };

    if (!response.ok || !data.result) {
      setSearchError(data.error ?? "Titik lokasi belum berhasil dibaca.");
      setIsResolvingPoint(false);
      return;
    }

    const nextSelection = {
      ...data.result,
      googleMapsUrl: buildGoogleMapsUrl(
        data.result.latitude,
        data.result.longitude,
        data.result.placeName,
      ),
    };

    setSelection(nextSelection);
    setQuery(data.result.placeName);
    setResults([]);
    setIsResolvingPoint(false);
    onChange?.({
      placeName: nextSelection.placeName,
      formattedAddress: nextSelection.formattedAddress,
      latitude: nextSelection.latitude,
      longitude: nextSelection.longitude,
      googleMapsUrl: nextSelection.googleMapsUrl,
    });
  });

  useEffect(() => {
    let isCancelled = false;

    async function initializeMap() {
      if (!mapContainerRef.current || mapRef.current) {
        return;
      }

      const leaflet = await import("leaflet");

      if (isCancelled || !mapContainerRef.current) {
        return;
      }

      leafletRef.current = leaflet;

      const initialSelection = initialSelectionRef.current;
      const initialCoordinates: [number, number] =
        initialSelection !== null
          ? [initialSelection.latitude, initialSelection.longitude]
          : [-6.2, 106.816666];

      const map = leaflet.map(mapContainerRef.current, {
        center: initialCoordinates,
        zoom: initialSelection ? 15 : 5,
        zoomControl: true,
      });

      leaflet
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
        })
        .addTo(map);

      map.on("click", (event) => {
        void resolveFromPoint(event.latlng.lat, event.latlng.lng);
      });

      mapRef.current = map;
      setIsMapReady(true);
    }

    void initializeMap();

    return () => {
      isCancelled = true;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      markerRef.current = null;
      leafletRef.current = null;
    };
  }, [markerIconHtml]);

  useEffect(() => {
    const nextSelection = getInitialSelection(value);

    setQuery(value.placeName || value.formattedAddress);
    setResults([]);
    setSearchError(undefined);
    setSelection(nextSelection);
    setIsResolvingPoint(false);
  }, [value]);

  useEffect(() => {
    if (!isMapReady || !mapRef.current || !leafletRef.current) {
      return;
    }

    if (!selection) {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }

      mapRef.current.setView([-6.2, 106.816666], 5);
      return;
    }

    const leaflet = leafletRef.current;
    const nextLatLng: [number, number] = [selection.latitude, selection.longitude];

    if (!markerRef.current) {
      markerRef.current = leaflet
        .marker(nextLatLng, {
          draggable: true,
          icon: leaflet.divIcon({
            className: "location-marker-shell",
            html: markerIconHtml,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          }),
        })
        .addTo(mapRef.current);

      markerRef.current.on("dragend", () => {
        const position = markerRef.current?.getLatLng();

        if (position) {
          void resolveFromPoint(position.lat, position.lng);
        }
      });
    } else {
      markerRef.current.setLatLng(nextLatLng);
    }

    mapRef.current.setView(nextLatLng, 15);
  }, [isMapReady, markerIconHtml, selection]);

  async function handleSearch() {
    if (query.trim().length < 3) {
      setSearchError("Ketik minimal 3 karakter untuk mencari lokasi.");
      setResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError(undefined);

    const response = await fetch(`/api/location/search?q=${encodeURIComponent(query.trim())}`);
    const data = (await response.json()) as {
      error?: string;
      results?: SearchResult[];
    };

    if (!response.ok || !data.results) {
      setSearchError(data.error ?? "Pencarian lokasi belum berhasil.");
      setResults([]);
      setIsSearching(false);
      return;
    }

    setResults(data.results);
    setIsSearching(false);
  }

  function applyResult(result: SearchResult) {
    const nextSelection = {
      ...result,
      googleMapsUrl: buildGoogleMapsUrl(result.latitude, result.longitude, result.placeName),
    };

    setSelection(nextSelection);
    setQuery(result.placeName);
    setResults([]);
    setSearchError(undefined);
    onChange?.({
      placeName: nextSelection.placeName,
      formattedAddress: nextSelection.formattedAddress,
      latitude: nextSelection.latitude,
      longitude: nextSelection.longitude,
      googleMapsUrl: nextSelection.googleMapsUrl,
    });
  }

  const hasStoredTextOnlyLocation =
    !selection && Boolean(value.placeName.trim() || value.formattedAddress.trim());

  return (
    <section
      className={
        embedded
          ? "space-y-4"
          : "rounded-[1.75rem] border border-[var(--color-border)] bg-white px-5 py-5 sm:px-6"
      }
    >
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Titik lokasi acara
        </h2>
        <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
          Cari nama tempat, pilih hasil yang paling tepat, atau tap titik langsung di peta. Sistem
          akan menyimpan nama tempat, alamat, koordinat, dan Google Maps URL secara otomatis.
        </p>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari venue, gedung, hotel, atau alamat"
              className={`w-full rounded-[1.3rem] border bg-white px-4 py-3 text-sm outline-none ${
                error || searchError
                  ? "border-[var(--color-error)]"
                  : "border-[var(--color-border)] focus:border-[var(--color-primary-strong)]"
              }`}
            />
            <button
              type="button"
              onClick={() => void handleSearch()}
              className="button-secondary rounded-full px-5 py-3 text-sm font-semibold"
            >
              {isSearching ? "Mencari..." : "Cari Lokasi"}
            </button>
          </div>

          {searchError ? (
            <p className="rounded-[1.4rem] border border-[rgba(181,87,99,0.22)] bg-[rgba(181,87,99,0.08)] px-4 py-3 text-sm text-[var(--color-error)]">
              {searchError}
            </p>
          ) : null}

          {results.length > 0 ? (
            <div className="space-y-3 rounded-[1.6rem] border border-[var(--color-border)] bg-white p-3">
              {results.map((result) => (
                <button
                  key={result.placeId}
                  type="button"
                  onClick={() => applyResult(result)}
                  className="w-full rounded-[1.25rem] border border-[var(--color-border)] px-4 py-4 text-left hover:border-[var(--color-primary-strong)]"
                >
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {result.placeName}
                  </p>
                  <p className="mt-1 text-xs leading-6 text-[var(--color-text-secondary)]">
                    {result.formattedAddress}
                  </p>
                </button>
              ))}
            </div>
          ) : null}

          <div className="rounded-[1.6rem] border border-[var(--color-border)] bg-white p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
              Lokasi terpilih
            </p>
            {selection ? (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {selection.placeName}
                </p>
                <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
                  {selection.formattedAddress}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {selection.latitude.toFixed(6)}, {selection.longitude.toFixed(6)}
                </p>
                <a
                  href={selection.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex text-sm font-semibold text-[var(--color-primary-strong)]"
                >
                  Buka Google Maps
                </a>
              </div>
            ) : hasStoredTextOnlyLocation ? (
              <div className="mt-3 space-y-2">
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {value.placeName || "Lokasi tersimpan"}
                </p>
                <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
                  {value.formattedAddress}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Titik peta belum tersimpan lengkap. Pilih ulang lokasi untuk melengkapi
                  koordinat.
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">
                Belum ada titik lokasi. Pilih hasil pencarian atau tap titik di peta.
              </p>
            )}
          </div>

          {error ? (
            <p className="text-sm text-[var(--color-error)]">{error}</p>
          ) : null}
        </div>

        <div className="space-y-3">
          <div
            ref={mapContainerRef}
            className="h-[320px] overflow-hidden rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-surface-alt)] sm:h-[360px]"
          />
          <p className="text-xs leading-6 text-[var(--color-text-secondary)]">
            Tip: setelah marker muncul, Anda bisa menggesernya sedikit untuk memperbaiki titik
            lokasi. Sistem akan memperbarui alamat secara otomatis.
            {isResolvingPoint ? " Menyelaraskan alamat..." : ""}
          </p>
        </div>
      </div>

      <input type="hidden" name="placeName" value={selection?.placeName ?? value.placeName ?? ""} />
      <input
        type="hidden"
        name="formattedAddress"
        value={selection?.formattedAddress ?? value.formattedAddress ?? ""}
      />
      <input
        type="hidden"
        name="latitude"
        value={selection?.latitude?.toString() ?? ""}
      />
      <input
        type="hidden"
        name="longitude"
        value={selection?.longitude?.toString() ?? ""}
      />
      <input
        type="hidden"
        name="googleMapsUrl"
        value={selection?.googleMapsUrl ?? value.googleMapsUrl ?? ""}
      />
    </section>
  );
}
