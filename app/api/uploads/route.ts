import { NextResponse } from "next/server";

import { auth } from "@/auth";
import { getOrCreateDashboardInvitation } from "@/features/invitation/invitation.service";
import { storeUploadedFiles } from "@/lib/utils/upload";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "CLIENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const kind = String(formData.get("kind") ?? "") as "cover" | "gallery" | "music";
  const files = formData
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (!["cover", "gallery", "music"].includes(kind)) {
    return NextResponse.json({ error: "Jenis upload tidak valid." }, { status: 400 });
  }

  if (files.length === 0) {
    return NextResponse.json({ error: "Belum ada file yang dipilih." }, { status: 400 });
  }

  try {
    const invitation = await getOrCreateDashboardInvitation(session.user.id, session.user.name);
    const assets = await storeUploadedFiles({
      files,
      ownerId: session.user.id,
      invitationId: invitation.id,
      kind,
    });

    return NextResponse.json({ assets });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload gagal." },
      { status: 400 },
    );
  }
}
