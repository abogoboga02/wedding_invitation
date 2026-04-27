import { cache } from "react";
import { unstable_cache } from "next/cache";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { TableRow } from "@/lib/supabase/database.types";
import { unwrapList, unwrapMaybeSingle } from "@/lib/supabase/helpers";
import { slugify } from "@/lib/utils/slug";

import type { InvitationRenderModel } from "./invitation.types";
import {
  dashboardCacheTags,
  mapInvitationToRenderModel,
  trackInvitationOpen,
  type DashboardInvitationGuest,
  type InvitationRecord,
  type InvitationWithRelations,
  type PublicWish,
} from "./invitation.service";

type InvitationRow = TableRow<"invitations">;
type InvitationSettingRow = TableRow<"invitation_settings">;
type EventSlotRow = TableRow<"event_slots">;
type GalleryImageRow = TableRow<"gallery_images">;
type GuestRow = TableRow<"guests">;
type RsvpRow = TableRow<"rsvps">;
type WishRow = TableRow<"wishes">;

type PublicInvitationShellRow = InvitationRow & {
  invitation_settings?: InvitationSettingRow | InvitationSettingRow[] | null;
  event_slots?: EventSlotRow[] | null;
  gallery_images?: GalleryImageRow[] | null;
};

type PublicInvitationGuestRow = GuestRow & {
  rsvps?: RsvpRow | RsvpRow[] | null;
  wishes?: WishRow | WishRow[] | null;
};

export type PublicInvitationMetadata = Pick<
  InvitationWithRelations,
  | "coupleSlug"
  | "partnerOneName"
  | "partnerTwoName"
  | "headline"
  | "subheadline"
  | "coverImage"
  | "coverImageAlt"
>;

type PublicInvitationRouteContext = {
  invitation: InvitationWithRelations;
  guest: DashboardInvitationGuest | null;
  approvedWishes: PublicWish[];
};

type PublicInvitationGuestReference =
  | string
  | {
      guestSlug: string;
      guestName?: string | null;
    }
  | null
  | undefined;

const PUBLIC_INVITATION_SHELL_SELECT = `
  id,
  owner_id,
  template,
  template_name,
  template_schema,
  status,
  couple_slug,
  partner_one_name,
  partner_two_name,
  headline,
  subheadline,
  story,
  closing_note,
  template_config,
  cover_image_url,
  cover_image_alt,
  cover_image_storage_path,
  music_url,
  music_original_name,
  music_mime_type,
  music_size,
  music_storage_path,
  published_at,
  created_at,
  updated_at,
  invitation_settings (
    id,
    invitation_id,
    locale,
    timezone,
    is_rsvp_enabled,
    is_wish_enabled,
    auto_play_music,
    preferred_send_channel,
    created_at,
    updated_at
  ),
  event_slots (
    id,
    invitation_id,
    label,
    starts_at,
    venue_name,
    address,
    maps_url,
    latitude,
    longitude,
    place_name,
    formatted_address,
    google_maps_url,
    sort_order,
    created_at,
    updated_at
  ),
  gallery_images (
    id,
    invitation_id,
    image_url,
    storage_path,
    alt_text,
    sort_order,
    created_at
  )
`;

const PUBLIC_INVITATION_GUEST_SELECT = `
  id,
  invitation_id,
  name,
  guest_slug,
  phone,
  email,
  source,
  created_at,
  updated_at,
  rsvps (
    id,
    guest_id,
    respondent_name,
    status,
    attendees,
    note,
    responded_at,
    updated_at
  ),
  wishes (
    id,
    invitation_id,
    guest_id,
    message,
    is_approved,
    created_at,
    updated_at
  )
`;

function firstEmbeddedRow<T>(value?: T | T[] | null) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function embeddedRows<T>(value?: T | T[] | null) {
  if (Array.isArray(value)) {
    return value;
  }

  return value ? [value] : [];
}

function mapInvitationRecord(row: InvitationRow): InvitationRecord {
  return {
    id: row.id,
    ownerId: row.owner_id,
    template: row.template,
    templateName: row.template_name,
    templateSchema: row.template_schema,
    status: row.status,
    coupleSlug: row.couple_slug,
    partnerOneName: row.partner_one_name,
    partnerTwoName: row.partner_two_name,
    headline: row.headline,
    subheadline: row.subheadline,
    story: row.story,
    closingNote: row.closing_note,
    templateConfig: row.template_config,
    coverImage: row.cover_image_url,
    coverImageAlt: row.cover_image_alt,
    coverImageStoragePath: row.cover_image_storage_path,
    musicUrl: row.music_url,
    musicOriginalName: row.music_original_name,
    musicMimeType: row.music_mime_type,
    musicSize: row.music_size,
    musicStoragePath: row.music_storage_path,
    publishedAt: row.published_at ? new Date(row.published_at) : null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function mapInvitationShellRow(row: PublicInvitationShellRow): InvitationWithRelations {
  const setting = firstEmbeddedRow(row.invitation_settings);

  return {
    ...mapInvitationRecord(row),
    setting: setting
      ? {
          id: setting.id,
          invitationId: setting.invitation_id,
          locale: setting.locale,
          timezone: setting.timezone,
          isRsvpEnabled: setting.is_rsvp_enabled,
          isWishEnabled: setting.is_wish_enabled,
          autoPlayMusic: setting.auto_play_music,
          preferredSendChannel: setting.preferred_send_channel,
          createdAt: new Date(setting.created_at),
          updatedAt: new Date(setting.updated_at),
        }
      : null,
    eventSlots: embeddedRows(row.event_slots)
      .map((eventSlot) => ({
        id: eventSlot.id,
        invitationId: eventSlot.invitation_id,
        label: eventSlot.label,
        startsAt: new Date(eventSlot.starts_at),
        venueName: eventSlot.venue_name,
        address: eventSlot.address,
        mapsUrl: eventSlot.maps_url,
        latitude: eventSlot.latitude,
        longitude: eventSlot.longitude,
        placeName: eventSlot.place_name,
        formattedAddress: eventSlot.formatted_address,
        googleMapsUrl: eventSlot.google_maps_url,
        sortOrder: eventSlot.sort_order,
        createdAt: new Date(eventSlot.created_at),
        updatedAt: new Date(eventSlot.updated_at),
      }))
      .sort((left, right) => left.sortOrder - right.sortOrder),
    galleryImages: embeddedRows(row.gallery_images)
      .map((galleryImage) => ({
        id: galleryImage.id,
        invitationId: galleryImage.invitation_id,
        imageUrl: galleryImage.image_url,
        storagePath: galleryImage.storage_path,
        altText: galleryImage.alt_text,
        sortOrder: galleryImage.sort_order,
        createdAt: new Date(galleryImage.created_at),
      }))
      .sort((left, right) => left.sortOrder - right.sortOrder),
  };
}

function mapGuestRow(row: PublicInvitationGuestRow): DashboardInvitationGuest {
  const rsvp = firstEmbeddedRow(row.rsvps);
  const wish = firstEmbeddedRow(row.wishes);

  return {
    id: row.id,
    invitationId: row.invitation_id,
    name: row.name,
    guestSlug: row.guest_slug,
    phone: row.phone,
    email: row.email,
    source: row.source,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    rsvp: rsvp
      ? {
          id: rsvp.id,
          guestId: rsvp.guest_id,
          respondentName: rsvp.respondent_name,
          status: rsvp.status,
          attendees: rsvp.attendees,
          note: rsvp.note,
          respondedAt: new Date(rsvp.responded_at),
          updatedAt: new Date(rsvp.updated_at),
        }
      : null,
    wish: wish
      ? {
          id: wish.id,
          invitationId: wish.invitation_id,
          guestId: wish.guest_id,
          message: wish.message,
          isApproved: wish.is_approved,
          createdAt: new Date(wish.created_at),
          updatedAt: new Date(wish.updated_at),
        }
      : null,
  };
}

function toPublicInvitationMetadata(
  invitation: InvitationWithRelations,
): PublicInvitationMetadata {
  return {
    coupleSlug: invitation.coupleSlug,
    partnerOneName: invitation.partnerOneName,
    partnerTwoName: invitation.partnerTwoName,
    headline: invitation.headline,
    subheadline: invitation.subheadline,
    coverImage: invitation.coverImage,
    coverImageAlt: invitation.coverImageAlt,
  };
}

function normalizeGuestLookupKey(value: string | null | undefined) {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return null;
  }

  return slugify(normalizedValue) || null;
}

function normalizeGuestLabel(value: string | null | undefined) {
  const normalizedValue = value?.trim().replace(/\s+/g, " ");

  if (!normalizedValue) {
    return null;
  }

  return normalizedValue.slice(0, 120);
}

function resolvePublicInvitationGuestValue(guest: PublicInvitationGuestReference) {
  if (!guest) {
    return null;
  }

  if (typeof guest === "string") {
    return guest.trim() || null;
  }

  const guestSlug = guest.guestSlug.trim();

  if (!guestSlug) {
    return null;
  }

  const guestName = normalizeGuestLabel(guest.guestName);
  return guestName && slugify(guestName) === guestSlug ? guestName : guestSlug;
}

async function getApprovedPublicWishes(invitationId: string): Promise<PublicWish[]> {
  const admin = getSupabaseAdminClient();
  const wishRows = await unwrapList<WishRow>(
    await admin
      .from("wishes")
      .select("id, invitation_id, guest_id, message, is_approved, created_at, updated_at")
      .eq("invitation_id", invitationId)
      .eq("is_approved", true)
      .order("created_at", { ascending: false })
      .limit(8),
    "Gagal mengambil ucapan invitation publik.",
  );

  if (wishRows.length === 0) {
    return [];
  }

  const guestRows = await unwrapList<Pick<GuestRow, "id" | "name">>(
    await admin
      .from("guests")
      .select("id, name")
      .in(
        "id",
        wishRows.map((wish) => wish.guest_id),
      ),
    "Gagal mengambil nama tamu untuk ucapan publik.",
  );

  const guestNameById = new Map(guestRows.map((guest) => [guest.id, guest.name]));

  return wishRows.map((wish) => ({
    id: wish.id,
    guestName: guestNameById.get(wish.guest_id) ?? "Tamu Istimewa",
    message: wish.message,
    createdAt: new Date(wish.created_at).toISOString(),
  }));
}

const getPublishedInvitationShellBySlug = unstable_cache(
  async (coupleSlug: string) => {
    const admin = getSupabaseAdminClient();
    const invitationRow = await unwrapMaybeSingle<PublicInvitationShellRow>(
      await admin
        .from("invitations")
        .select(PUBLIC_INVITATION_SHELL_SELECT)
        .eq("couple_slug", coupleSlug)
        .eq("status", "PUBLISHED")
        .maybeSingle(),
      "Gagal mengambil invitation publik.",
    );

    return invitationRow ? mapInvitationShellRow(invitationRow) : null;
  },
  ["public-invitation-shell-by-slug"],
  {
    tags: [dashboardCacheTags.publicInvitation],
  },
);

const getPublicInvitationRouteContext = cache(
  async (
    coupleSlug: string,
    guestLookupKey: string | null,
  ): Promise<PublicInvitationRouteContext | null> => {
    const invitation = await getPublishedInvitationShellBySlug(coupleSlug);

    if (!invitation) {
      return null;
    }

    const approvedWishesPromise = getApprovedPublicWishes(invitation.id);

    if (!guestLookupKey) {
      return {
        invitation,
        guest: null,
        approvedWishes: await approvedWishesPromise,
      };
    }

    const admin = getSupabaseAdminClient();
    const [guestRow, approvedWishes] = await Promise.all([
      unwrapMaybeSingle<PublicInvitationGuestRow>(
        await admin
          .from("guests")
          .select(PUBLIC_INVITATION_GUEST_SELECT)
          .eq("invitation_id", invitation.id)
          .eq("guest_slug", guestLookupKey)
          .maybeSingle(),
        "Gagal mengambil tamu untuk invitation publik.",
      ),
      approvedWishesPromise,
    ]);

    return {
      invitation,
      guest: guestRow ? mapGuestRow(guestRow) : null,
      approvedWishes,
    };
  },
);

export async function getPublicInvitationMetadataBySlug(coupleSlug: string) {
  const invitation = await getPublishedInvitationShellBySlug(coupleSlug);
  return invitation ? toPublicInvitationMetadata(invitation) : null;
}

export async function getPublicInvitationRouteData(
  coupleSlug: string,
  guestQuery?: string | null,
): Promise<InvitationRenderModel | null> {
  const guestLookupKey = normalizeGuestLookupKey(guestQuery);
  const guestLabel = normalizeGuestLabel(guestQuery);
  const context = await getPublicInvitationRouteContext(coupleSlug, guestLookupKey);

  if (!context) {
    return null;
  }

  const renderModel = mapInvitationToRenderModel(
    context.invitation,
    context.guest,
    context.approvedWishes,
  );

  return !context.guest && guestLabel ? { ...renderModel, guestName: guestLabel } : renderModel;
}

export function getPublicInvitationPath(
  coupleSlug: string,
  guest?: PublicInvitationGuestReference,
) {
  const basePath = `/${coupleSlug}`;
  const guestValue = resolvePublicInvitationGuestValue(guest);

  if (!guestValue) {
    return basePath;
  }

  return `${basePath}?to=${encodeURIComponent(guestValue)}`;
}

export { trackInvitationOpen };
