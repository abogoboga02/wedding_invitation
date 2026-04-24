import { getTemplateConfigSummaryEntries } from "@/features/invitation/form/config";
import { getMusicPresetById } from "@/lib/constants/music-playlist";
import { TEMPLATE_OPTIONS } from "@/lib/constants/invitation";

import { getPublicInvitationPath } from "./public-invitation.service";
import type { DashboardInvitationSummary } from "./invitation.service";
import { mapInvitationToRenderModel } from "./invitation.service";
import type { InvitationRenderModel } from "./invitation.types";

export type DraftInvitationPreview = {
  renderModel: InvitationRenderModel;
  templateLabel: string;
  previewGuestName: string;
  previewPath: string;
  isUsingSampleGuest: boolean;
  placeholderNotes: string[];
  templateConfigSummary: Array<{
    id: string;
    label: string;
    value: string;
  }>;
};

function addDays(date: Date, days: number) {
  const clonedDate = new Date(date);
  clonedDate.setDate(clonedDate.getDate() + days);
  return clonedDate;
}

function normalizeDraftRenderModel(renderModel: InvitationRenderModel): InvitationRenderModel {
  const fallbackEventStartsAt = addDays(new Date(), 30).toISOString();
  const events =
    renderModel.events.length > 0
      ? renderModel.events
      : [
          {
            id: "preview-event-placeholder",
            label: "Acara Utama",
            startsAt: fallbackEventStartsAt,
            venueName: "Lokasi utama akan tampil di sini",
            address: "Pilih titik lokasi dari peta agar detail venue final muncul di preview.",
            placeName: "Lokasi utama akan tampil di sini",
            formattedAddress:
              "Pilih titik lokasi dari peta agar detail venue final muncul di preview.",
            mapsUrl: null,
            googleMapsUrl: null,
            latitude: null,
            longitude: null,
          },
        ];

  return {
    ...renderModel,
    partnerOneName: renderModel.partnerOneName.trim() || "Pengantin Pria",
    partnerTwoName: renderModel.partnerTwoName.trim() || "Pengantin Wanita",
    coupleSlug: renderModel.coupleSlug.trim() || "slug-pasangan",
    guestName: renderModel.guestName.trim() || "Tamu Preview",
    guestSlug: renderModel.guestSlug?.trim() || "tamu-preview",
    events,
  };
}

export function buildDraftInvitationPreview(
  invitation: DashboardInvitationSummary,
): DraftInvitationPreview {
  const previewGuest = invitation.guests[0] ?? null;
  const renderModel = mapInvitationToRenderModel(
    invitation,
    previewGuest,
    invitation.guests
      .filter((guest) => guest.wish)
      .slice(0, 8)
      .map((guest) => ({
        id: guest.wish!.id,
        guestName: guest.name,
        message: guest.wish!.message,
        createdAt: guest.wish!.createdAt.toISOString(),
      })),
  );

  const normalizedRenderModel = normalizeDraftRenderModel({
    ...renderModel,
    guestName: previewGuest?.name ?? "Tamu Preview",
  });

  const placeholderNotes: string[] = [];
  const primaryEvent = invitation.eventSlots[0];
  const selectedMusicPreset =
    renderModel.templateConfig.music.source === "preset"
      ? getMusicPresetById(renderModel.templateConfig.music.presetId)
      : null;

  if (!previewGuest) {
    placeholderNotes.push(
      "Preview memakai sample guest karena daftar tamu belum tersedia. Setelah guest ditambahkan, preview akan memakai guest pertama secara otomatis.",
    );
  }

  if (
    !primaryEvent?.placeName ||
    primaryEvent.latitude === null ||
    primaryEvent.longitude === null ||
    !primaryEvent.formattedAddress
  ) {
    placeholderNotes.push(
      "Lokasi utama belum dipilih dari peta. Preview tetap menampilkan placeholder agar ritme layout masih bisa ditinjau.",
    );
  }

  if (!invitation.galleryImages.length) {
    placeholderNotes.push(
      "Galeri belum ditambahkan. Template tetap dirender agar ritme layout dan kedalaman konten bisa dievaluasi lebih awal.",
    );
  }

  if (!invitation.coverImage) {
    placeholderNotes.push(
      "Cover image belum tersedia. Hero tetap ditampilkan dengan styling bawaan template aktif.",
    );
  }

  if (!invitation.musicUrl && !selectedMusicPreset) {
    placeholderNotes.push(
      "Lagu pembuka belum dipilih. Anda bisa memilih preset playlist atau upload audio sendiri dari halaman media.",
    );
  }

  if (!renderModel.templateConfig.loveStory.narrative) {
    placeholderNotes.push(
      "Love story belum diisi. Template tetap merender versi placeholder agar nuansa panjang konten tetap terasa.",
    );
  }

  if (!(invitation.setting?.isRsvpEnabled ?? true)) {
    placeholderNotes.push(
      "RSVP sedang dimatikan. Pada preview, area RSVP akan tampil sebagai section nonaktif sesuai pengaturan invitation.",
    );
  }

  const templateLabel =
    TEMPLATE_OPTIONS.find((template) => template.id === invitation.template)?.label ??
    invitation.template.replaceAll("_", " ");
  const previewPath = getPublicInvitationPath(
    normalizedRenderModel.coupleSlug,
    normalizedRenderModel.guestSlug ?? "tamu-preview",
  );

  return {
    renderModel: normalizedRenderModel,
    templateLabel,
    previewGuestName: normalizedRenderModel.guestName,
    previewPath,
    isUsingSampleGuest: !previewGuest,
    placeholderNotes,
    templateConfigSummary: getTemplateConfigSummaryEntries(
      invitation.template,
      invitation.templateConfig,
    ),
  };
}
