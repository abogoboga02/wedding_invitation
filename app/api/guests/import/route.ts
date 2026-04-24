import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { parseGuestCsv } from "@/features/guest/guest-csv";
import { buildGuestImportPreview } from "@/features/guest/guest.service";
import { getOrCreateDashboardInvitation } from "@/features/invitation/invitation.service";
import { prisma } from "@/lib/db/prisma";

type ImportPayload = {
  csvText?: string;
  mode?: "preview" | "commit";
};

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "CLIENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload = (await request.json()) as ImportPayload;
  const csvText = payload.csvText?.trim();
  const mode = payload.mode ?? "preview";

  if (!csvText) {
    return NextResponse.json({ error: "CSV kosong." }, { status: 400 });
  }

  const invitation = await getOrCreateDashboardInvitation(session.user.id, session.user.name);

  try {
    const parsedRows = parseGuestCsv(csvText);

    if (parsedRows.length === 0) {
      return NextResponse.json({ error: "Tidak ada baris tamu yang valid." }, { status: 400 });
    }

    const existingGuests = await prisma.guest.findMany({
      where: {
        invitationId: invitation.id,
      },
      select: {
        name: true,
        phone: true,
        email: true,
        guestSlug: true,
      },
    });

    const previewRows = buildGuestImportPreview(parsedRows, existingGuests);

    if (mode === "preview") {
      return NextResponse.json({ rows: previewRows });
    }

    const readyRows = previewRows.filter((row) => row.status === "ready");

    if (readyRows.length === 0) {
      return NextResponse.json({ error: "Tidak ada data baru yang siap diimpor." }, { status: 400 });
    }

    await prisma.guest.createMany({
      data: readyRows.map((row) => ({
        invitationId: invitation.id,
        name: row.name,
        phone: row.phone || null,
        email: row.email || null,
        guestSlug: row.guestSlug,
        source: "CSV",
      })),
    });

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
