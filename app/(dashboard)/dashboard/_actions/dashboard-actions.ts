"use server";
import { revalidatePath } from "next/cache";

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
  getDashboardInvitationSummary,
  getOrCreateDashboardInvitation,
  validateInvitationPublishability,
} from "@/features/invitation/invitation.service";
import {
  getInvitationTemplateSlug,
  isInvitationTemplate,
} from "@/features/invitation/templates/template-slugs";
import { invitationSettingsSchema } from "@/features/settings/settings.schema";
import { getMusicPresetById } from "@/lib/constants/music-playlist";
import { requireClientUser } from "@/lib/auth/guards";
import { prisma } from "@/lib/db/prisma";
import { isReservedSlug } from "@/lib/utils/slug";

export type DashboardActionState = {
  error?: string;
  success?: string;
};

async function getAuthenticatedUser() {
  return requireClientUser();
}

export async function saveTemplateSelectionAction(
  _prevState: DashboardActionState,
  formData: FormData,
): Promise<DashboardActionState> {
  const user = await getAuthenticatedUser();
  const invitation = await getOrCreateDashboardInvitation(user.id, user.name);
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

  await prisma.invitation.update({
    where: { id: invitation.id },
    data: {
      template,
      templateConfig: nextTemplateConfig,
      headline: generatedCopy.legacy.headline,
      subheadline: generatedCopy.legacy.subheadline,
      story: generatedCopy.legacy.story,
      closingNote: generatedCopy.legacy.closingNote,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/templates");
  revalidatePath("/dashboard/setup");
  revalidatePath("/dashboard/preview");

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
  const invitation = await getOrCreateDashboardInvitation(user.id, user.name);

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

  const existingSlugOwner = await prisma.invitation.findFirst({
    where: {
      coupleSlug: parsedSetup.data.coupleSlug,
      NOT: { ownerId: user.id },
    },
    select: { id: true },
  });

  if (existingSlugOwner) {
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

  await prisma.$transaction(async (tx) => {
    await tx.invitation.update({
      where: { id: invitation.id },
      data: {
        partnerOneName: parsedSetup.data.partnerOneName,
        partnerTwoName: parsedSetup.data.partnerTwoName,
        coupleSlug: parsedSetup.data.coupleSlug,
        headline: generatedCopy.legacy.headline,
        subheadline: generatedCopy.legacy.subheadline,
        story: generatedCopy.legacy.story,
        closingNote: generatedCopy.legacy.closingNote,
        templateConfig: nextTemplateConfig,
        status: "DRAFT",
        publishedAt: null,
      },
    });

    await tx.eventSlot.deleteMany({
      where: { invitationId: invitation.id },
    });

    await tx.eventSlot.create({
      data: {
        invitationId: invitation.id,
        label: parsedSetup.data.eventLabel,
        startsAt,
        venueName: parsedSetup.data.placeName,
        address: parsedSetup.data.formattedAddress,
        mapsUrl: parsedSetup.data.googleMapsUrl,
        latitude: parsedSetup.data.latitude,
        longitude: parsedSetup.data.longitude,
        placeName: parsedSetup.data.placeName,
        formattedAddress: parsedSetup.data.formattedAddress,
        googleMapsUrl: parsedSetup.data.googleMapsUrl,
        sortOrder: 0,
      },
    });

    await tx.invitationSetting.upsert({
      where: { invitationId: invitation.id },
      update: {
        isRsvpEnabled: parsedSetup.data.isRsvpEnabled,
      },
      create: {
        invitationId: invitation.id,
        isRsvpEnabled: parsedSetup.data.isRsvpEnabled,
      },
    });
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/setup");
  revalidatePath("/dashboard/preview");
  revalidatePath("/dashboard/media");
  revalidatePath("/dashboard/settings");

  return {
    success: "Setup undangan berhasil diperbarui sebagai draft. Publish ulang untuk mengaktifkan link publik.",
  };
}

export async function saveMediaInvitationAction(
  _prevState: DashboardActionState,
  formData: FormData,
): Promise<DashboardActionState> {
  const user = await getAuthenticatedUser();
  const invitation = await getOrCreateDashboardInvitation(user.id, user.name);
  const coverImage = String(formData.get("coverImage") ?? "");
  const coverImageAlt = String(formData.get("coverImageAlt") ?? "");
  const galleryImages = formData
    .getAll("galleryImages")
    .map((value) => String(value))
    .filter(Boolean);
  const musicUrl = String(formData.get("musicUrl") ?? "");
  const musicOriginalName = String(formData.get("musicOriginalName") ?? "");
  const musicMimeType = String(formData.get("musicMimeType") ?? "");
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
  const resolvedMusicName = isUsingUploadedMusic
    ? musicOriginalName
    : selectedPreset?.title ?? "";
  const resolvedMusicMimeType = isUsingUploadedMusic
    ? musicMimeType
    : selectedPreset?.mimeType ?? "";

  await prisma.$transaction(async (tx) => {
    await tx.invitation.update({
      where: { id: invitation.id },
      data: {
        coverImage: coverImage || null,
        coverImageAlt: coverImageAlt || null,
        musicUrl: resolvedMusicUrl || null,
        musicOriginalName: resolvedMusicName || null,
        musicMimeType: resolvedMusicMimeType || null,
        musicSize: isUsingUploadedMusic && Number.isFinite(musicSize) ? musicSize : null,
        templateConfig: nextTemplateConfig,
      },
    });

    await tx.galleryImage.deleteMany({
      where: { invitationId: invitation.id },
    });

    if (galleryImages.length > 0) {
      await tx.galleryImage.createMany({
        data: galleryImages.map((imageUrl, index) => ({
          invitationId: invitation.id,
          imageUrl,
          altText: `${invitation.partnerOneName} & ${invitation.partnerTwoName}`,
          sortOrder: index,
        })),
      });
    }
  });

  revalidatePath("/dashboard/media");
  revalidatePath("/dashboard/setup");
  revalidatePath("/dashboard/preview");

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
  const invitation = await getDashboardInvitationSummary(user.id);

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

  await prisma.invitation.update({
    where: { id: invitation.id },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/preview");
  revalidatePath("/dashboard/analytics");
  revalidatePath("/dashboard/send");

  return {
    success: "Invitation berhasil dipublish dan link personal sudah aktif.",
  };
}

export async function saveInvitationSettingsAction(
  _prevState: DashboardActionState,
  formData: FormData,
): Promise<DashboardActionState> {
  const user = await getAuthenticatedUser();
  const invitation = await getOrCreateDashboardInvitation(user.id, user.name);

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

  await prisma.invitationSetting.upsert({
    where: { invitationId: invitation.id },
    update: parsedSettings.data,
    create: {
      invitationId: invitation.id,
      ...parsedSettings.data,
    },
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/preview");
  revalidatePath("/dashboard/send");

  return {
    success: "Pengaturan invitation berhasil diperbarui.",
  };
}

export async function addGuestAction(
  _prevState: DashboardActionState,
  formData: FormData,
): Promise<DashboardActionState> {
  const user = await getAuthenticatedUser();
  const invitation = await getOrCreateDashboardInvitation(user.id, user.name);
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

  const currentGuests = await prisma.guest.findMany({
    where: { invitationId: invitation.id },
    select: { guestSlug: true },
  });

  const guestSlug = createUniqueGuestSlug(
    parsedGuest.data.name,
    new Set(currentGuests.map((guest) => guest.guestSlug)),
  );

  await prisma.guest.create({
    data: {
      invitationId: invitation.id,
      name: parsedGuest.data.name,
      phone: parsedGuest.data.phone || null,
      email: parsedGuest.data.email || null,
      guestSlug,
      source: "MANUAL",
    },
  });

  revalidatePath("/dashboard/guests");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/preview");
  revalidatePath("/dashboard/send");

  return {
    success: `Tamu berhasil ditambahkan. Personal link siap di /${invitation.coupleSlug}/${guestSlug}.`,
  };
}

export async function updateGuestAction(formData: FormData) {
  const user = await getAuthenticatedUser();
  const invitation = await getOrCreateDashboardInvitation(user.id, user.name);
  const guestId = String(formData.get("guestId") ?? "");
  const parsedGuest = guestSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
  });

  if (!guestId || !parsedGuest.success) {
    return;
  }

  const guest = await prisma.guest.findFirst({
    where: { id: guestId, invitationId: invitation.id },
    select: { id: true },
  });

  if (!guest) {
    return;
  }

  const currentGuests = await prisma.guest.findMany({
    where: {
      invitationId: invitation.id,
      NOT: { id: guest.id },
    },
    select: { guestSlug: true },
  });

  const guestSlug = createUniqueGuestSlug(
    parsedGuest.data.name,
    new Set(currentGuests.map((item) => item.guestSlug)),
  );

  await prisma.guest.update({
    where: { id: guest.id },
    data: {
      name: parsedGuest.data.name,
      phone: parsedGuest.data.phone || null,
      email: parsedGuest.data.email || null,
      guestSlug,
    },
  });

  revalidatePath("/dashboard/guests");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/preview");
  revalidatePath("/dashboard/send");
}

export async function deleteGuestAction(formData: FormData) {
  const user = await getAuthenticatedUser();
  const invitation = await getOrCreateDashboardInvitation(user.id, user.name);
  const guestId = String(formData.get("guestId") ?? "");

  if (!guestId) {
    return;
  }

  await prisma.guest.deleteMany({
    where: { id: guestId, invitationId: invitation.id },
  });

  revalidatePath("/dashboard/guests");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/preview");
  revalidatePath("/dashboard/send");
}

export async function logManualSendAction(formData: FormData) {
  const user = await getAuthenticatedUser();
  const invitation = await getOrCreateDashboardInvitation(user.id, user.name);
  const guestId = String(formData.get("guestId") ?? "");
  const requestedChannel = String(formData.get("channel") ?? "") as
    | "MANUAL"
    | "WHATSAPP"
    | "EMAIL";

  if (!guestId || !["MANUAL", "WHATSAPP", "EMAIL"].includes(requestedChannel)) {
    return;
  }

  const guest = await prisma.guest.findFirst({
    where: {
      id: guestId,
      invitationId: invitation.id,
    },
    select: {
      id: true,
      phone: true,
      email: true,
      name: true,
    },
  });

  if (!guest) {
    return;
  }

  const recipient =
    requestedChannel === "EMAIL" ? guest.email : requestedChannel === "WHATSAPP" ? guest.phone : guest.phone ?? guest.email;

  if (!recipient) {
    return;
  }

  await prisma.sendLog.create({
    data: {
      invitationId: invitation.id,
      guestId: guest.id,
      channel: requestedChannel,
      status: "SENT",
      recipient,
      sentAt: new Date(),
    },
  });

  revalidatePath("/dashboard/send");
  revalidatePath("/admin/send-logs");
}
