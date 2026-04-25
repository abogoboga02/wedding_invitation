import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { parseGuestCsv } from "@/features/guest/guest-csv";
import { buildGuestImportPreview } from "@/features/guest/guest.service";
import { getOrCreateDashboardInvitation } from "@/features/invitation/invitation.service";
import type { Database } from "@/lib/supabase/database.types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type ImportPayload = {
  csvText?: string;
  mode?: "preview" | "commit";
};

type GuestInsert = Database["public"]["Tables"]["guests"]["Insert"];

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id, name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "CLIENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload = (await request.json()) as ImportPayload;
  const csvText = payload.csvText?.trim();
  const mode = payload.mode ?? "preview";

  if (!csvText) {
    return NextResponse.json({ error: "CSV kosong." }, { status: 400 });
  }

  const invitation = await getOrCreateDashboardInvitation(user.id, profile?.name ?? null, supabase);

  try {
    const parsedRows = parseGuestCsv(csvText);

    if (parsedRows.length === 0) {
      return NextResponse.json({ error: "Tidak ada baris tamu yang valid." }, { status: 400 });
    }

    const { data: existingGuests, error: existingGuestsError } = await supabase
      .from("guests")
      .select("name, phone, email, guest_slug")
      .eq("invitation_id", invitation.id);

    if (existingGuestsError) {
      return NextResponse.json({ error: "Guest list saat ini belum berhasil dibaca." }, { status: 400 });
    }

    const previewRows = buildGuestImportPreview(
      parsedRows,
      (existingGuests ?? []).map((guest) => ({
        name: guest.name,
        phone: guest.phone,
        email: guest.email,
        guestSlug: guest.guest_slug,
      })),
    );

    if (mode === "preview") {
      return NextResponse.json({ rows: previewRows });
    }

    const readyRows = previewRows.filter((row) => row.status === "ready");

    if (readyRows.length === 0) {
      return NextResponse.json({ error: "Tidak ada data baru yang siap diimpor." }, { status: 400 });
    }

    const guestRows: GuestInsert[] = readyRows.map((row) => ({
        invitation_id: invitation.id,
        name: row.name,
        phone: row.phone || null,
        email: row.email || null,
        guest_slug: row.guestSlug,
        source: "CSV",
      }));

    const { error: insertError } = await supabase.from("guests").insert(guestRows);

    if (insertError) {
      return NextResponse.json({ error: "Import CSV belum berhasil disimpan." }, { status: 400 });
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/guests");
    revalidatePath("/dashboard/preview");
    revalidatePath("/dashboard/send");

    return NextResponse.json({
      createdCount: readyRows.length,
      skippedCount: previewRows.length - readyRows.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Import CSV gagal." },
      { status: 400 },
    );
  }
}
