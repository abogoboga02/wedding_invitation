import { NextRequest, NextResponse } from "next/server";

import { searchLocations } from "@/lib/utils/geocoding";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (query.length < 3) {
    return NextResponse.json({
      results: [],
    });
  }

  try {
    const results = await searchLocations(query);
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json(
      {
        error: "Pencarian lokasi belum berhasil. Coba lagi beberapa saat lagi.",
      },
      { status: 502 },
    );
  }
}
