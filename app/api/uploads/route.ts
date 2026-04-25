import { NextResponse } from "next/server";

import { getOrCreateDashboardInvitation } from "@/features/invitation/invitation.service";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { storeUploadedFiles } from "@/lib/utils/upload";

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
    const invitation = await getOrCreateDashboardInvitation(user.id, profile?.name ?? null, supabase);
    const assets = await storeUploadedFiles({
      files,
      ownerId: user.id,
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
