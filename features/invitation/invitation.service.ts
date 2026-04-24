import type {
  EventSlot,
  GalleryImage,
  Guest,
  Invitation,
  InvitationTemplate,
  Prisma,
  Rsvp,
  Wish,
} from "@prisma/client";

import { normalizeTemplateConfig } from "@/features/invitation/form/config";
import { buildGeneratedInvitationCopy } from "@/features/invitation/generated-copy";
import { prisma } from "@/lib/db/prisma";
import { buildCoupleSlug, generateUniqueSlug } from "@/lib/utils/slug";
import { buildGoogleMapsUrl, isFiniteCoordinate } from "@/lib/utils/location";

import type { InvitationRenderModel } from "./invitation.types";
import { getInvitationTemplateSlug } from "./templates/template-slugs";

const invitationInclude = {
  setting: true,
  eventSlots: {
    orderBy: { sortOrder: "asc" },
  },
  galleryImages: {
    orderBy: { sortOrder: "asc" },
  },
} satisfies Prisma.InvitationInclude;

export type InvitationWithRelations = Prisma.InvitationGetPayload<{
  include: typeof invitationInclude;
}>;

const dashboardInvitationInclude = {
  ...invitationInclude,
  guests: {
    include: {
      rsvp: true,
      wish: true,
    },
    orderBy: { createdAt: "desc" },
  },
} satisfies Prisma.InvitationInclude;

export type DashboardInvitationSummary = Prisma.InvitationGetPayload<{
  include: typeof dashboardInvitationInclude;
}>;

export type PublicWish = {
  id: string;
  guestName: string;
  message: string;
  createdAt: string;
};

export type DashboardAnalyticsSummary = {
  totalGuests: number;
  totalPersonalLinks: number;
  totalRsvps: number;
  totalInvitationOpens: number;
  uniqueGuestOpens: number;
  rsvpBreakdown: {
    attending: number;
    declined: number;
    maybe: number;
  };
};

export type InvitationPublishChecklistItem = {
  id: string;
  label: string;
  isComplete: boolean;
  helper: string;
};

export type InvitationPublishValidation = {
  isValid: boolean;
  errors: string[];
  checklist: InvitationPublishChecklistItem[];
};

function addDays(date: Date, days: number) {
  const clonedDate = new Date(date);
  clonedDate.setDate(clonedDate.getDate() + days);
  return clonedDate;
}

function getDefaultTemplateConfig(template: InvitationTemplate) {
  return normalizeTemplateConfig(template, null);
}

export async function createDefaultInvitation(userId: string, displayName = "Pengantin") {
  const partnerOneName = displayName;
  const partnerTwoName = "Pasangan";
  const template = "KOREAN_SOFT" as const;
  const templateConfig = getDefaultTemplateConfig(template);
  const generatedCopy = buildGeneratedInvitationCopy({
    templateSlug: getInvitationTemplateSlug(template),
    partnerOneName,
    partnerTwoName,
    config: templateConfig,
  });
  const baseCoupleSlug = buildCoupleSlug(partnerOneName, partnerTwoName);
  const coupleSlug = await generateUniqueSlug(baseCoupleSlug, async (candidate) => {
    const existing = await prisma.invitation.findUnique({
      where: { coupleSlug: candidate },
      select: { id: true },
    });

    return Boolean(existing);
  });

  const now = new Date();

  return prisma.invitation.create({
    data: {
      ownerId: userId,
      status: "DRAFT",
      template,
      coupleSlug,
      partnerOneName,
      partnerTwoName,
      headline: generatedCopy.legacy.headline,
      subheadline: generatedCopy.legacy.subheadline,
      story: generatedCopy.legacy.story,
      closingNote: generatedCopy.legacy.closingNote,
      templateConfig,
      setting: {
        create: {},
      },
      eventSlots: {
        create: [
          {
            label: "Akad Nikah",
            startsAt: addDays(now, 30),
            venueName: "Nama Venue Akad",
            address: "Alamat lengkap venue akad akan ditampilkan di sini.",
            sortOrder: 0,
          },
          {
            label: "Resepsi",
            startsAt: addDays(now, 30),
            venueName: "Nama Venue Resepsi",
            address: "Alamat lengkap venue resepsi akan ditampilkan di sini.",
            sortOrder: 1,
          },
        ],
      },
    },
    include: invitationInclude,
  });
}

export async function getOrCreateDashboardInvitation(userId: string, displayName?: string | null) {
  const existingInvitation = await prisma.invitation.findUnique({
    where: { ownerId: userId },
    include: invitationInclude,
  });

  if (existingInvitation) {
    if (!existingInvitation.setting) {
      await prisma.invitationSetting.create({
        data: {
          invitationId: existingInvitation.id,
        },
      });

      return prisma.invitation.findUniqueOrThrow({
        where: { id: existingInvitation.id },
        include: invitationInclude,
      });
    }

    return existingInvitation;
  }

  return createDefaultInvitation(userId, displayName ?? undefined);
}

export async function getDashboardInvitationSummary(userId: string) {
  const invitation = await prisma.invitation.findUnique({
    where: { ownerId: userId },
    include: dashboardInvitationInclude,
  });

  return invitation;
}

export function mapInvitationToRenderModel(
  invitation: Invitation & {
    templateConfig?: Prisma.JsonValue | null;
    setting?: {
      isRsvpEnabled: boolean;
      isWishEnabled: boolean;
      autoPlayMusic: boolean;
    } | null;
    eventSlots: EventSlot[];
    galleryImages: GalleryImage[];
  },
  guest?: (Guest & { rsvp?: Rsvp | null; wish?: Wish | null }) | null,
  wishes: PublicWish[] = [],
): InvitationRenderModel {
  const templateSlug = getInvitationTemplateSlug(invitation.template);
  const templateConfig = normalizeTemplateConfig(invitation.template, invitation.templateConfig);
  const generatedCopy = buildGeneratedInvitationCopy({
    templateSlug,
    partnerOneName: invitation.partnerOneName,
    partnerTwoName: invitation.partnerTwoName,
    config: templateConfig,
  });

  return {
    id: invitation.id,
    status: invitation.status,
    template: invitation.template,
    templateSlug,
    usesGeneratedCopy: true,
    coupleSlug: invitation.coupleSlug,
    partnerOneName: invitation.partnerOneName,
    partnerTwoName: invitation.partnerTwoName,
    headline: generatedCopy.legacy.headline,
    subheadline: generatedCopy.legacy.subheadline,
    story: generatedCopy.legacy.story,
    closingNote: generatedCopy.legacy.closingNote,
    templateConfig,
    coverImage: invitation.coverImage,
    coverImageAlt: invitation.coverImageAlt,
    musicUrl: invitation.musicUrl,
    musicOriginalName: invitation.musicOriginalName,
    musicMimeType: invitation.musicMimeType,
    publishedAt: invitation.publishedAt?.toISOString() ?? null,
    isRsvpEnabled: invitation.setting?.isRsvpEnabled ?? true,
    isWishEnabled: invitation.setting?.isWishEnabled ?? true,
    autoPlayMusic: invitation.setting?.autoPlayMusic ?? true,
    guestName: guest?.name ?? "Tamu Istimewa",
    guestId: guest?.id,
    guestSlug: guest?.guestSlug,
    guestPhone: guest?.phone,
    currentRsvp: guest?.rsvp
      ? {
          respondentName: guest.rsvp.respondentName,
          status: guest.rsvp.status,
          attendees: guest.rsvp.attendees,
          note: guest.rsvp.note,
        }
      : null,
    currentWish: guest?.wish
      ? {
          message: guest.wish.message,
        }
      : null,
    events: invitation.eventSlots.map((eventSlot) => ({
      id: eventSlot.id,
      label: eventSlot.label,
      startsAt: eventSlot.startsAt.toISOString(),
      venueName: eventSlot.placeName ?? eventSlot.venueName,
      address: eventSlot.formattedAddress ?? eventSlot.address,
      placeName: eventSlot.placeName,
      formattedAddress: eventSlot.formattedAddress,
      mapsUrl: eventSlot.mapsUrl,
      googleMapsUrl:
        eventSlot.googleMapsUrl ??
        (isFiniteCoordinate(eventSlot.latitude) && isFiniteCoordinate(eventSlot.longitude)
          ? buildGoogleMapsUrl(eventSlot.latitude, eventSlot.longitude, eventSlot.placeName)
          : null),
      latitude: eventSlot.latitude,
      longitude: eventSlot.longitude,
    })),
    galleryImages: invitation.galleryImages.map((galleryImage) => ({
      id: galleryImage.id,
      imageUrl: galleryImage.imageUrl,
      altText: galleryImage.altText,
    })),
    wishes,
  };
}

export async function trackInvitationOpen(invitationId: string, guestId: string, path?: string) {
  await prisma.invitationViewLog.create({
    data: {
      invitationId,
      guestId,
      path: path ?? null,
    },
  });
}

export async function getDashboardAnalyticsSummary(
  userId: string,
): Promise<DashboardAnalyticsSummary | null> {
  const invitation = await prisma.invitation.findUnique({
    where: { ownerId: userId },
    select: {
      id: true,
      guests: {
        select: {
          id: true,
          rsvp: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      },
    },
  });

  if (!invitation) {
    return null;
  }

  const [totalInvitationOpens, uniqueGuestOpenGroups] = await Promise.all([
    prisma.invitationViewLog.count({
      where: {
        invitationId: invitation.id,
      },
    }),
    prisma.invitationViewLog.groupBy({
      by: ["guestId"],
      where: {
        invitationId: invitation.id,
      },
    }),
  ]);

  const totalGuests = invitation.guests.length;
  const totalRsvps = invitation.guests.filter((guest) => Boolean(guest.rsvp)).length;
  const attending = invitation.guests.filter((guest) => guest.rsvp?.status === "ATTENDING").length;
  const declined = invitation.guests.filter((guest) => guest.rsvp?.status === "DECLINED").length;
  const maybe = invitation.guests.filter((guest) => guest.rsvp?.status === "MAYBE").length;

  return {
    totalGuests,
    totalPersonalLinks: totalGuests,
    totalRsvps,
    totalInvitationOpens,
    uniqueGuestOpens: uniqueGuestOpenGroups.length,
    rsvpBreakdown: {
      attending,
      declined,
      maybe,
    },
  };
}

export function validateInvitationPublishability(invitation: {
  partnerOneName: string;
  partnerTwoName: string;
  coupleSlug: string;
  template: string;
  eventSlots: Array<{
    id: string;
    startsAt?: Date | string | null;
    venueName?: string | null;
    address?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  }>;
  guests: Array<{ id: string }>;
}): InvitationPublishValidation {
  const primaryEvent = invitation.eventSlots[0];
  const checklist: InvitationPublishChecklistItem[] = [
    {
      id: "template",
      label: "Template terpilih",
      isComplete: Boolean(invitation.template),
      helper: "Pilih satu template aktif sebelum invitation dipublish.",
    },
    {
      id: "couple-name",
      label: "Nama pengantin lengkap",
      isComplete: Boolean(invitation.partnerOneName.trim() && invitation.partnerTwoName.trim()),
      helper: "Nama pengantin pria dan wanita wajib diisi.",
    },
    {
      id: "couple-slug",
      label: "Couple slug tersedia",
      isComplete: Boolean(invitation.coupleSlug.trim()),
      helper: "Slug pasangan dipakai untuk route publik invitation.",
    },
    {
      id: "event-date",
      label: "Tanggal acara utama",
      isComplete: Boolean(primaryEvent?.startsAt),
      helper: "Minimal satu jadwal acara dengan tanggal yang valid harus tersedia.",
    },
    {
      id: "primary-location",
      label: "Lokasi utama",
      isComplete: Boolean(
        primaryEvent?.venueName?.trim() &&
          primaryEvent?.address?.trim() &&
          isFiniteCoordinate(primaryEvent?.latitude ?? null) &&
          isFiniteCoordinate(primaryEvent?.longitude ?? null),
      ),
      helper: "Pilih titik lokasi utama dari peta agar venue, alamat, dan koordinat tersimpan rapi.",
    },
    {
      id: "guest-list",
      label: "Minimal satu tamu",
      isComplete: invitation.guests.length > 0,
      helper: "Public invitation route baru berguna setelah ada minimal satu guest.",
    },
  ];

  const errors = checklist.filter((item) => !item.isComplete).map((item) => item.helper);

  return {
    isValid: errors.length === 0,
    errors,
    checklist,
  };
}
