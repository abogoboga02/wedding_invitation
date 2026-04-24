import { NextRequest, NextResponse } from "next/server";

import { reverseGeocode } from "@/lib/utils/geocoding";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const latitude = Number(request.nextUrl.searchParams.get("lat"));
  const longitude = Number(request.nextUrl.searchParams.get("lng"));

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json(
      {
        error: "Koordinat lokasi belum valid.",
      },
      { status: 400 },
    );
  }

  try {
    const result = await reverseGeocode(latitude, longitude);

    if (!result) {
      return NextResponse.json(
        {
          error: "Lokasi belum ditemukan untuk titik yang dipilih.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ result });
  } catch {
    return NextResponse.json(
      {
        error: "Reverse geocode belum berhasil. Coba lagi beberapa saat lagi.",
      },
      { status: 502 },
    );
  }
}
