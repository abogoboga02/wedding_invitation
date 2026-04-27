"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { dashboardCacheTags } from "@/features/invitation/invitation.service";
import { getPublicInvitationPath } from "@/features/invitation/public-invitation.service";
import { rsvpSchema } from "@/features/rsvp/rsvp.schema";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export type PublicActionState = {
  error?: string;
  success?: string;
};

export async function submitRsvpAction(
  _prevState: PublicActionState,
  formData: FormData,
): Promise<PublicActionState> {
  const parsedRsvp = rsvpSchema.safeParse({
    guestId: formData.get("guestId"),
    respondentName: formData.get("respondentName") || undefined,
    status: formData.get("status"),
    attendees: formData.get("attendees"),
    note: formData.get("note") || undefined,
    wishMessage: formData.get("wishMessage") || undefined,
    coupleSlug: formData.get("coupleSlug"),
    guestSlug: formData.get("guestSlug"),
  });

  if (!parsedRsvp.success) {
    const errors = parsedRsvp.error.flatten().fieldErrors;
    return {
      error:
        errors.respondentName?.[0] ??
        errors.status?.[0] ??
        errors.attendees?.[0] ??
        errors.note?.[0] ??
        errors.wishMessage?.[0] ??
        "RSVP belum berhasil dikirim.",
    };
  }

  const admin = getSupabaseAdminClient();
  const { data: invitation } = await admin
    .from("invitations")
    .select("id")
    .eq("couple_slug", parsedRsvp.data.coupleSlug)
    .eq("status", "PUBLISHED")
    .maybeSingle();

  if (!invitation?.id) {
    return {
      error: "Link undangan tidak valid.",
    };
  }

  const [guest, settings, existingRsvp, existingWish] = await Promise.all([
    admin
      .from("guests")
      .select("id, invitation_id")
      .eq("id", parsedRsvp.data.guestId)
      .eq("guest_slug", parsedRsvp.data.guestSlug)
      .eq("invitation_id", invitation.id)
      .maybeSingle(),
    admin
      .from("invitation_settings")
      .select("is_rsvp_enabled, is_wish_enabled")
      .eq("invitation_id", invitation.id)
      .maybeSingle(),
    admin
      .from("rsvps")
      .select("updated_at")
      .eq("guest_id", parsedRsvp.data.guestId)
      .maybeSingle(),
    admin
      .from("wishes")
      .select("updated_at")
      .eq("guest_id", parsedRsvp.data.guestId)
      .maybeSingle(),
  ]);

  if (!guest.data?.id) {
    return {
      error: "Link undangan tidak valid.",
    };
  }

  if (settings.data?.is_rsvp_enabled === false) {
    return {
      error: "Form RSVP sedang dinonaktifkan oleh pemilik undangan.",
    };
  }

  if (
    existingRsvp.data?.updated_at &&
    Date.now() - new Date(existingRsvp.data.updated_at).getTime() < 30_000
  ) {
    return {
      error: "Tunggu sebentar sebelum mengirim RSVP lagi.",
    };
  }

  if (
    settings.data?.is_wish_enabled !== false &&
    parsedRsvp.data.wishMessage?.trim() &&
    existingWish.data?.updated_at &&
    Date.now() - new Date(existingWish.data.updated_at).getTime() < 30_000
  ) {
    return {
      error: "Tunggu sebentar sebelum memperbarui ucapan lagi.",
    };
  }

  const upsertRsvp = await admin.from("rsvps").upsert(
    {
      guest_id: guest.data.id,
      respondent_name: parsedRsvp.data.respondentName?.trim() || null,
      status: parsedRsvp.data.status,
      attendees: parsedRsvp.data.attendees,
      note: parsedRsvp.data.note?.trim() || null,
      responded_at: new Date().toISOString(),
    },
    {
      onConflict: "guest_id",
    },
  );

  if (upsertRsvp.error) {
    return {
      error: "RSVP belum berhasil disimpan.",
    };
  }

  if (settings.data?.is_wish_enabled !== false && parsedRsvp.data.wishMessage?.trim()) {
    const upsertWish = await admin.from("wishes").upsert(
      {
        invitation_id: guest.data.invitation_id,
        guest_id: guest.data.id,
        message: parsedRsvp.data.wishMessage.trim(),
        is_approved: true,
      },
      {
        onConflict: "guest_id",
      },
    );

    if (upsertWish.error) {
      return {
        error: "Ucapan sudah diterima, tetapi penyimpanan wish belum berhasil.",
      };
    }
  }

  revalidatePath(getPublicInvitationPath(parsedRsvp.data.coupleSlug));
  revalidatePath("/dashboard/rsvp");
  revalidatePath("/dashboard/analytics");
  revalidateTag(dashboardCacheTags.rsvp, "max");
  revalidateTag(dashboardCacheTags.analytics, "max");
  revalidateTag(dashboardCacheTags.preview, "max");
  revalidateTag(dashboardCacheTags.overview, "max");
  revalidateTag(dashboardCacheTags.invitationSummary, "max");

  return {
    success: "Terima kasih, RSVP Anda sudah kami terima.",
  };
}
