"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { guestSchema } from "@/features/guest/guest.schema";
import { createUniqueGuestSlug } from "@/features/guest/guest.service";
import { buildGeneratedInvitationCopy } from "@/features/invitation/generated-copy";
import {
  buildTemplateConfigFromSetupForm,
  normalizeTemplateConfig,
  updateTemplateConfigMusicSelection,
} from "@/features/invitation/form/config";
import {
  buildCommonInvitationSetupInput,
  commonInvitationSetupSchema,
} from "@/features/invitation/invitation.schema";
import {
  dashboardCacheTags,
  getDashboardInvitationSummary,
  getOrCreateDashboardInvitation,
  validateInvitationPublishability,
} from "@/features/invitation/invitation.service";
import {
  getInvitationTemplateSlug,
  isInvitationTemplate,
} from "@/features/invitation/templates/template-slugs";
import { invitationSettingsSchema } from "@/features/settings/settings.schema";
import { requireClientUser } from "@/lib/auth/guards";
import { getMusicPresetById } from "@/lib/constants/music-playlist";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { deleteStoredFiles } from "@/lib/utils/upload";
import { isReservedSlug } from "@/lib/utils/slug";

export type DashboardActionState = {
  error?: string;
  success?: string;
};

async function getAuthenticatedUser() {
  return requireClientUser();
}

function buildZippedGalleryAssets(urls: string[], storagePaths: string[]) {
  return urls.map((imageUrl, index) => ({
    imageUrl,
    storagePath: storagePaths[index] || null,
  }));
}

function uniqueStoragePaths(paths: Array<string | null | undefined>) {
  return [...new Set(paths.filter((item): item is string => Boolean(item?.trim())))];
}

function revalidateDashboardCaches() {
  revalidateTag(dashboardCacheTags.invitationSummary);
  revalidateTag(dashboardCacheTags.analyticsSummary);
}

export async function saveTemplateSelectionAction(
  _prevState: DashboardActionState,
  formData: FormData,
): Promise<DashboardActionState> {
  const user = await getAuthenticatedUser();
  const supabase = await createServerSupabaseClient();
  const invitation = await getOrCreateDashboardInvitation(user.id, user.name, supabase);
  const template = String(formData.get("template") ?? "").trim();

  if (!template) {
    return { error: "Pilih satu template terlebih dahulu." };
  }

  if (!isInvitationTemplate(template)) {
    return {
      error: "Template yang dipilih tidak dikenali. Silakan pilih ulang dari daftar template.",
    };
  }

  const nextTemplateConfig = normalizeTemplateConfig(template, invitation.templateConfig);
  const generatedCopy = buildGeneratedInvitationCopy({
    templateSlug: getInvitationTemplateSlug(template),
    partnerOneName: invitation.partnerOneName,
    partnerTwoName: invitation.partnerTwoName,
    config: nextTemplateConfig,
  });

  const { error } = await supabase
    .from("invitations")
    .update({
      template,
      template_config: nextTemplateConfig,
      headline: generatedCopy.legacy.headline,
      subheadline: generatedCopy.legacy.subheadline,
      story: generatedCopy.legacy.story,
      closing_note: generatedCopy.legacy.closingNote,
    })
    .eq("id", invitation.id);

  if (error) {
    return {
      error: "Template aktif belum berhasil diperbarui.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/templates");
  revalidatePath("/dashboard/setup");
  revalidatePath("/dashboard/preview");
  revalidateDashboardCaches();

  return {
    success:
      invitation.status === "PUBLISHED"
        ? "Template aktif berhasil diperbarui dan langsung dipakai pada link publik."
        : "Template aktif berhasil diperbarui.",
  };
}

export async function saveSetupInvitationAction(
  _prevState: DashboardActionState,
  formData: FormData,
): Promise<DashboardActionState> {
  const user = await getAuthenticatedUser();
  const supabase = await createServerSupabaseClient();
  const invitation = await getOrCreateDashboardInvitation(user.id, user.name, supabase);

  const parsedSetup = commonInvitationSetupSchema.safeParse(
    buildCommonInvitationSetupInput(formData),
  );

  if (!parsedSetup.success) {
    const errors = parsedSetup.error.flatten().fieldErrors;
    return {
      error:
        errors.partnerOneName?.[0] ??
        errors.partnerTwoName?.[0] ??
        errors.partnerOneNickname?.[0] ??
        errors.partnerTwoNickname?.[0] ??
        errors.coupleSlug?.[0] ??
        errors.eventLabel?.[0] ??
        errors.eventDate?.[0] ??
        errors.eventTime?.[0] ??
        errors.placeName?.[0] ??
        errors.formattedAddress?.[0] ??
        errors.latitude?.[0] ??
        errors.longitude?.[0] ??
        errors.googleMapsUrl?.[0] ??
        errors.loveStoryNarrative?.[0] ??
        errors.giftPrimaryAccountNumber?.[0] ??
        errors.giftSecondaryAccountNumber?.[0] ??
        "Data setup undangan belum lengkap.",
    };
  }

  if (isReservedSlug(parsedSetup.data.coupleSlug)) {
    return {
      error: "Slug ini dipakai sistem. Silakan pilih slug lain.",
    };
  }

  const admin = getSupabaseAdminClient();
  const { data: existingSlugOwner } = await admin
    .from("invitations")
    .select("id")
    .eq("couple_slug", parsedSetup.data.coupleSlug)
    .neq("owner_id", user.id)
    .maybeSingle();

  if (existingSlugOwner?.id) {
    return {
      error: "Slug pasangan sudah dipakai. Coba variasi lain.",
    };
  }

  const startsAt = new Date(`${parsedSetup.data.eventDate}T${parsedSetup.data.eventTime}`);
  const nextTemplateConfig = buildTemplateConfigFromSetupForm(
    invitation.template,
    invitation.templateConfig,
    formData,
  );
  const generatedCopy = buildGeneratedInvitationCopy({
    templateSlug: getInvitationTemplateSlug(invitation.template),
    partnerOneName: parsedSetup.data.partnerOneName,
    partnerTwoName: parsedSetup.data.partnerTwoName,
    config: nextTemplateConfig,
  });

  const invitationUpdate = await supabase
    .from("invitations")
    .update({
      partner_one_name: parsedSetup.data.partnerOneName,
      partner_two_name: parsedSetup.data.partnerTwoName,
      couple_slug: parsedSetup.data.coupleSlug,
      headline: generatedCopy.legacy.headline,
      subheadline: generatedCopy.legacy.subheadline,
      story: generatedCopy.legacy.story,
      closing_note: generatedCopy.legacy.closingNote,
      template_config: nextTemplateConfig,
      status: "DRAFT",
      published_at: null,
    })
    .eq("id", invitation.id);

  if (invitationUpdate.error) {
    return {
      error: "Draft setup invitation belum berhasil diperbarui.",
    };
  }

  const deleteEventSlots = await supabase
    .from("event_slots")
    .delete()
    .eq("invitation_id", invitation.id);

  if (deleteEventSlots.error) {
    return {
      error: "Jadwal acara lama belum berhasil dibersihkan.",
    };
  }

  const insertEventSlot = await supabase.from("event_slots").insert({
    invitation_id: invitation.id,
    label: parsedSetup.data.eventLabel,
    starts_at: startsAt.toISOString(),
    venue_name: parsedSetup.data.placeName,
    address: parsedSetup.data.formattedAddress,
    maps_url: parsedSetup.data.googleMapsUrl,
    latitude: parsedSetup.data.latitude,
    longitude: parsedSetup.data.longitude,
    place_name: parsedSetup.data.placeName,
    formatted_address: parsedSetup.data.formattedAddress,
    google_maps_url: parsedSetup.data.googleMapsUrl,
    sort_order: 0,
  });

  if (insertEventSlot.error) {
    return {
      error: "Jadwal acara baru belum berhasil disimpan.",
    };
  }

  const upsertSettings = await supabase.from("invitation_settings").upsert(
    {
      invitation_id: invitation.id,
      is_rsvp_enabled: parsedSetup.data.isRsvpEnabled,
    },
    {
      onConflict: "invitation_id",
    },
  );

  if (upsertSettings.error) {
    return {
      error: "Pengaturan RSVP invitation belum berhasil diperbarui.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/setup");
  revalidatePath("/dashboard/preview");
  revalidatePath("/dashboard/media");
  revalidatePath("/dashboard/settings");
  revalidateDashboardCaches();

  return {
    success: "Setup undangan berhasil diperbarui sebagai draft. Publish ulang untuk mengaktifkan link publik.",
  };
}

export async function saveMediaInvitationAction(
  _prevState: DashboardActionState,
  formData: FormData,
): Promise<DashboardActionState> {
  const user = await getAuthenticatedUser();
  const supabase = await createServerSupabaseClient();
  const invitation = await getOrCreateDashboardInvitation(user.id, user.name, supabase);
  const coverImage = String(formData.get("coverImage") ?? "");
  const coverImageAlt = String(formData.get("coverImageAlt") ?? "");
  const coverImageStoragePath = String(formData.get("coverImageStoragePath") ?? "");
  const galleryImages = formData
    .getAll("galleryImages")
    .map((value) => String(value))
    .filter(Boolean);
  const galleryImageStoragePaths = formData
    .getAll("galleryImageStoragePaths")
    .map((value) => String(value));
  const musicUrl = String(formData.get("musicUrl") ?? "");
  const musicOriginalName = String(formData.get("musicOriginalName") ?? "");
  const musicMimeType = String(formData.get("musicMimeType") ?? "");
  const musicStoragePath = String(formData.get("musicStoragePath") ?? "");
  const musicSizeRaw = String(formData.get("musicSize") ?? "");
  const musicSize = musicSizeRaw ? Number.parseInt(musicSizeRaw, 10) : null;
  const musicPresetId = String(formData.get("musicPresetId") ?? "");
  const musicMood = String(formData.get("musicMood") ?? "");
  const selectedPreset = getMusicPresetById(musicPresetId);
  const isUsingUploadedMusic = Boolean(musicUrl);
  const nextMusicSource = isUsingUploadedMusic ? "upload" : "preset";
  const nextTemplateConfig = updateTemplateConfigMusicSelection(
    invitation.template,
    invitation.templateConfig,
    {
      source: nextMusicSource,
      presetId: isUsingUploadedMusic ? "" : selectedPreset?.id ?? "",
      mood:
        musicMood === "romantic" || musicMood === "soft" || musicMood === "editorial"
          ? musicMood
          : undefined,
    },
  );
  const resolvedMusicUrl = isUsingUploadedMusic ? musicUrl : selectedPreset?.url ?? "";
  const resolvedMusicName = isUsingUploadedMusic ? musicOriginalName : selectedPreset?.title ?? "";
  const resolvedMusicMimeType = isUsingUploadedMusic
    ? musicMimeType
    : selectedPreset?.mimeType ?? "";
  const resolvedMusicStoragePath = isUsingUploadedMusic ? musicStoragePath : null;
  const galleryAssets = buildZippedGalleryAssets(galleryImages, galleryImageStoragePaths);

  const updateInvitation = await supabase
    .from("invitations")
    .update({
      cover_image_url: coverImage || null,
      cover_image_alt: coverImageAlt || null,
      cover_image_storage_path: coverImageStoragePath || null,
      music_url: resolvedMusicUrl || null,
      music_original_name: resolvedMusicName || null,
      music_mime_type: resolvedMusicMimeType || null,
      music_size: isUsingUploadedMusic && Number.isFinite(musicSize) ? musicSize : null,
      music_storage_path: resolvedMusicStoragePath,
      template_config: nextTemplateConfig,
    })
    .eq("id", invitation.id);

  if (updateInvitation.error) {
    return {
      error: "Media invitation belum berhasil diperbarui.",
    };
  }

  const deleteGalleryRows = await supabase
    .from("gallery_images")
    .delete()
    .eq("invitation_id", invitation.id);

  if (deleteGalleryRows.error) {
    return {
      error: "Galeri invitation lama belum berhasil dibersihkan.",
    };
  }

  if (galleryAssets.length > 0) {
    const insertGalleryRows = await supabase.from("gallery_images").insert(
      galleryAssets.map((asset, index) => ({
        invitation_id: invitation.id,
        image_url: asset.imageUrl,
        storage_path: asset.storagePath,
        alt_text: `${invitation.partnerOneName} & ${invitation.partnerTwoName}`,
        sort_order: index,
      })),
    );

    if (insertGalleryRows.error) {
      return {
        error: "Galeri invitation baru belum berhasil disimpan.",
      };
    }
  }

  const nextGalleryStoragePaths = new Set(
    galleryAssets.map((asset) => asset.storagePath).filter(Boolean),
  );
  const obsoleteStoragePaths = uniqueStoragePaths([
    invitation.coverImageStoragePath !== coverImageStoragePath
      ? invitation.coverImageStoragePath
      : null,
    invitation.musicStoragePath !== resolvedMusicStoragePath ? invitation.musicStoragePath : null,
    ...invitation.galleryImages
      .map((galleryImage) => galleryImage.storagePath)
      .filter((storagePath) => storagePath && !nextGalleryStoragePaths.has(storagePath)),
  ]);

  if (obsoleteStoragePaths.length > 0) {
    try {
      await deleteStoredFiles(obsoleteStoragePaths);
    } catch {
      return {
        error:
          "Media baru sudah tersimpan, tetapi beberapa file lama di storage belum berhasil dibersihkan.",
      };
    }
  }

  revalidatePath("/dashboard/media");
  revalidatePath("/dashboard/setup");
  revalidatePath("/dashboard/preview");
  revalidateDashboardCaches();

  return {
    success: "Media invitation berhasil diperbarui.",
  };
}

export async function publishInvitationAction(
  _prevState: DashboardActionState,
  _formData: FormData,
): Promise<DashboardActionState> {
  void _prevState;
  void _formData;
  const user = await getAuthenticatedUser();
  const supabase = await createServerSupabaseClient();
  const invitation = await getDashboardInvitationSummary(user.id, supabase);

  if (!invitation) {
    return {
      error: "Invitation belum tersedia. Silakan lengkapi setup terlebih dahulu.",
    };
  }

  const validation = validateInvitationPublishability(invitation);

  if (!validation.isValid) {
    return {
      error: validation.errors[0] ?? "Invitation belum siap dipublish.",
    };
  }

  const { error } = await supabase
    .from("invitations")
    .update({
      status: "PUBLISHED",
      published_at: new Date().toISOString(),
    })
    .eq("id", invitation.id);

  if (error) {
    return {
      error: "Invitation belum berhasil dipublish.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/preview");
  revalidatePath("/dashboard/analytics");
  revalidatePath("/dashboard/send");
  revalidateDashboardCaches();

  return {
    success: "Invitation berhasil dipublish dan link personal sudah aktif.",
  };
}

export async function saveInvitationSettingsAction(
  _prevState: DashboardActionState,
  formData: FormData,
): Promise<DashboardActionState> {
  const user = await getAuthenticatedUser();
  const supabase = await createServerSupabaseClient();
  const invitation = await getOrCreateDashboardInvitation(user.id, user.name, supabase);

  const parsedSettings = invitationSettingsSchema.safeParse({
    locale: formData.get("locale"),
    timezone: formData.get("timezone"),
    isRsvpEnabled: formData.get("isRsvpEnabled") === "on",
    isWishEnabled: formData.get("isWishEnabled") === "on",
    autoPlayMusic: formData.get("autoPlayMusic") === "on",
    preferredSendChannel: formData.get("preferredSendChannel"),
  });

  if (!parsedSettings.success) {
    const errors = parsedSettings.error.flatten().fieldErrors;
    return {
      error:
        errors.locale?.[0] ??
        errors.timezone?.[0] ??
        errors.preferredSendChannel?.[0] ??
        "Pengaturan invitation belum valid.",
    };
  }

  const { error } = await supabase.from("invitation_settings").upsert(
    {
      invitation_id: invitation.id,
      locale: parsedSettings.data.locale,
      timezone: parsedSettings.data.timezone,
      is_rsvp_enabled: parsedSettings.data.isRsvpEnabled,
      is_wish_enabled: parsedSettings.data.isWishEnabled,
      auto_play_music: parsedSettings.data.autoPlayMusic,
      preferred_send_channel: parsedSettings.data.preferredSendChannel,
    },
    {
      onConflict: "invitation_id",
    },
  );

  if (error) {
    return {
      error: "Pengaturan invitation belum berhasil diperbarui.",
    };
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/preview");
  revalidatePath("/dashboard/send");
  revalidateDashboardCaches();

  return {
    success: "Pengaturan invitation berhasil diperbarui.",
  };
}

export async function addGuestAction(
  _prevState: DashboardActionState,
  formData: FormData,
): Promise<DashboardActionState> {
  const user = await getAuthenticatedUser();
  const supabase = await createServerSupabaseClient();
  const invitation = await getOrCreateDashboardInvitation(user.id, user.name, supabase);
  const parsedGuest = guestSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
  });

  if (!parsedGuest.success) {
    const errors = parsedGuest.error.flatten().fieldErrors;
    return {
      error: errors.name?.[0] ?? errors.email?.[0] ?? "Data tamu belum lengkap.",
    };
  }

  const { data: currentGuests, error: currentGuestsError } = await supabase
    .from("guests")
    .select("guest_slug")
    .eq("invitation_id", invitation.id);

  if (currentGuestsError) {
    return {
      error: "Guest list saat ini belum berhasil dibaca.",
    };
  }

  const guestSlug = createUniqueGuestSlug(
    parsedGuest.data.name,
    new Set((currentGuests ?? []).map((guest) => guest.guest_slug)),
  );

  const { error } = await supabase.from("guests").insert({
    invitation_id: invitation.id,
    name: parsedGuest.data.name,
    phone: parsedGuest.data.phone || null,
    email: parsedGuest.data.email || null,
    guest_slug: guestSlug,
    source: "MANUAL",
  });

  if (error) {
    return {
      error: "Tamu belum berhasil ditambahkan.",
    };
  }

  revalidatePath("/dashboard/guests");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/preview");
  revalidatePath("/dashboard/send");
  revalidateDashboardCaches();

  return {
    success: `Tamu berhasil ditambahkan. Personal link siap di /${invitation.coupleSlug}/${guestSlug}.`,
  };
}

export async function updateGuestAction(formData: FormData) {
  const user = await getAuthenticatedUser();
  const supabase = await createServerSupabaseClient();
  const invitation = await getOrCreateDashboardInvitation(user.id, user.name, supabase);
  const guestId = String(formData.get("guestId") ?? "");
  const parsedGuest = guestSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
  });

  if (!guestId || !parsedGuest.success) {
    return;
  }

  const { data: guest } = await supabase
    .from("guests")
    .select("id")
    .eq("id", guestId)
    .eq("invitation_id", invitation.id)
    .maybeSingle();

  if (!guest?.id) {
    return;
  }

  const { data: currentGuests } = await supabase
    .from("guests")
    .select("guest_slug")
    .eq("invitation_id", invitation.id)
    .neq("id", guest.id);

  const guestSlug = createUniqueGuestSlug(
    parsedGuest.data.name,
    new Set((currentGuests ?? []).map((item) => item.guest_slug)),
  );

  await supabase
    .from("guests")
    .update({
      name: parsedGuest.data.name,
      phone: parsedGuest.data.phone || null,
      email: parsedGuest.data.email || null,
      guest_slug: guestSlug,
    })
    .eq("id", guest.id);

  revalidatePath("/dashboard/guests");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/preview");
  revalidatePath("/dashboard/send");
  revalidateDashboardCaches();
}

export async function deleteGuestAction(formData: FormData) {
  const user = await getAuthenticatedUser();
  const supabase = await createServerSupabaseClient();
  const invitation = await getOrCreateDashboardInvitation(user.id, user.name, supabase);
  const guestId = String(formData.get("guestId") ?? "");

  if (!guestId) {
    return;
  }

  await supabase
    .from("guests")
    .delete()
    .eq("id", guestId)
    .eq("invitation_id", invitation.id);

  revalidatePath("/dashboard/guests");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/preview");
  revalidatePath("/dashboard/send");
  revalidateDashboardCaches();
}

export async function logManualSendAction(formData: FormData) {
  const user = await getAuthenticatedUser();
  const supabase = await createServerSupabaseClient();
  const invitation = await getOrCreateDashboardInvitation(user.id, user.name, supabase);
  const guestId = String(formData.get("guestId") ?? "");
  const requestedChannel = String(formData.get("channel") ?? "") as
    | "MANUAL"
    | "WHATSAPP"
    | "EMAIL";

  if (!guestId || !["MANUAL", "WHATSAPP", "EMAIL"].includes(requestedChannel)) {
    return;
  }

  const { data: guest } = await supabase
    .from("guests")
    .select("id, phone, email, name")
    .eq("id", guestId)
    .eq("invitation_id", invitation.id)
    .maybeSingle();

  if (!guest) {
    return;
  }

  const recipient =
    requestedChannel === "EMAIL"
      ? guest.email
      : requestedChannel === "WHATSAPP"
        ? guest.phone
        : guest.phone ?? guest.email;

  if (!recipient) {
    return;
  }

  await supabase.from("send_logs").insert({
    invitation_id: invitation.id,
    guest_id: guest.id,
    channel: requestedChannel,
    status: "SENT",
    recipient,
    sent_at: new Date().toISOString(),
  });

  revalidatePath("/dashboard/send");
  revalidatePath("/admin/send-logs");
  revalidateDashboardCaches();
}
