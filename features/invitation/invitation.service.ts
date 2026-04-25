import type { PostgrestMaybeSingleResponse, SupabaseClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";

import { normalizeTemplateConfig } from "@/features/invitation/form/config";
import { buildGeneratedInvitationCopy } from "@/features/invitation/generated-copy";
import type { InvitationTemplate, InvitationStatus, RsvpStatus } from "@/lib/domain/types";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database, Json, TableRow } from "@/lib/supabase/database.types";
import { unwrapList, unwrapMaybeSingle, unwrapSingle } from "@/lib/supabase/helpers";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { buildGoogleMapsUrl, isFiniteCoordinate } from "@/lib/utils/location";
import { buildCoupleSlug, generateUniqueSlug } from "@/lib/utils/slug";

import type { InvitationRenderModel } from "./invitation.types";
import { getInvitationTemplateSlug } from "./templates/template-slugs";

type SupabaseDbClient = SupabaseClient<Database>;
type InvitationRow = TableRow<"invitations">;
type InvitationSettingRow = TableRow<"invitation_settings">;
type EventSlotRow = TableRow<"event_slots">;
type GalleryImageRow = TableRow<"gallery_images">;
type GuestRow = TableRow<"guests">;
type RsvpRow = TableRow<"rsvps">;
type WishRow = TableRow<"wishes">;

type DashboardInvitationSummaryRow = InvitationRow & {
  invitation_settings?: InvitationSettingRow | InvitationSettingRow[] | null;
  event_slots?: EventSlotRow[] | null;
  gallery_images?: GalleryImageRow[] | null;
  guests?:
    | Array<
        GuestRow & {
          rsvps?: RsvpRow | RsvpRow[] | null;
          wishes?: WishRow | WishRow[] | null;
        }
      >
    | null;
};

const INVITATION_BASE_SELECT = `
  id,
  owner_id,
  template,
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
  updated_at
`;

const DASHBOARD_INVITATION_SUMMARY_SELECT = `
  ${INVITATION_BASE_SELECT},
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
  ),
  guests (
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
  )
`;

const DASHBOARD_INVITATION_SUMMARY_CACHE_TAG = "dashboard-invitation-summary";
const DASHBOARD_ANALYTICS_SUMMARY_CACHE_TAG = "dashboard-analytics-summary";
const INVITATION_SETTING_SELECT = `
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
`;
const EVENT_SLOT_SELECT = `
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
`;
const GALLERY_IMAGE_SELECT = `
  id,
  invitation_id,
  image_url,
  storage_path,
  alt_text,
  sort_order,
  created_at
`;

export type InvitationRecord = {
  id: string;
  ownerId: string;
  template: InvitationTemplate;
  status: InvitationStatus;
  coupleSlug: string;
  partnerOneName: string;
  partnerTwoName: string;
  headline: string;
  subheadline: string;
  story: string;
  closingNote: string;
  templateConfig: Json | null;
  coverImage: string | null;
  coverImageAlt: string | null;
  coverImageStoragePath: string | null;
  musicUrl: string | null;
  musicOriginalName: string | null;
  musicMimeType: string | null;
  musicSize: number | null;
  musicStoragePath: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type InvitationSettingRecord = {
  id: string;
  invitationId: string;
  locale: string;
  timezone: string;
  isRsvpEnabled: boolean;
  isWishEnabled: boolean;
  autoPlayMusic: boolean;
  preferredSendChannel: Database["public"]["Tables"]["invitation_settings"]["Row"]["preferred_send_channel"];
  createdAt: Date;
  updatedAt: Date;
};

export type EventSlotRecord = {
  id: string;
  invitationId: string;
  label: string;
  startsAt: Date;
  venueName: string;
  address: string;
  mapsUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  placeName: string | null;
  formattedAddress: string | null;
  googleMapsUrl: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type GalleryImageRecord = {
  id: string;
  invitationId: string;
  imageUrl: string;
  storagePath: string | null;
  altText: string | null;
  sortOrder: number;
  createdAt: Date;
};

export type GuestRecord = {
  id: string;
  invitationId: string;
  name: string;
  guestSlug: string;
  phone: string | null;
  email: string | null;
  source: Database["public"]["Tables"]["guests"]["Row"]["source"];
  createdAt: Date;
  updatedAt: Date;
};

export type RsvpRecord = {
  id: string;
  guestId: string;
  respondentName: string | null;
  status: RsvpStatus;
  attendees: number;
  note: string | null;
  respondedAt: Date;
  updatedAt: Date;
};

export type WishRecord = {
  id: string;
  invitationId: string;
  guestId: string;
  message: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type InvitationWithRelations = InvitationRecord & {
  setting: InvitationSettingRecord | null;
  eventSlots: EventSlotRecord[];
  galleryImages: GalleryImageRecord[];
};

export type DashboardInvitationGuest = GuestRecord & {
  rsvp: RsvpRecord | null;
  wish: WishRecord | null;
};

export type DashboardInvitationSummary = InvitationWithRelations & {
  guests: DashboardInvitationGuest[];
};

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

function mapInvitationRow(row: InvitationRow): InvitationRecord {
  return {
    id: row.id,
    ownerId: row.owner_id,
    template: row.template,
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

function mapInvitationSettingRow(row: InvitationSettingRow): InvitationSettingRecord {
  return {
    id: row.id,
    invitationId: row.invitation_id,
    locale: row.locale,
    timezone: row.timezone,
    isRsvpEnabled: row.is_rsvp_enabled,
    isWishEnabled: row.is_wish_enabled,
    autoPlayMusic: row.auto_play_music,
    preferredSendChannel: row.preferred_send_channel,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function mapEventSlotRow(row: EventSlotRow): EventSlotRecord {
  return {
    id: row.id,
    invitationId: row.invitation_id,
    label: row.label,
    startsAt: new Date(row.starts_at),
    venueName: row.venue_name,
    address: row.address,
    mapsUrl: row.maps_url,
    latitude: row.latitude,
    longitude: row.longitude,
    placeName: row.place_name,
    formattedAddress: row.formatted_address,
    googleMapsUrl: row.google_maps_url,
    sortOrder: row.sort_order,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function mapGalleryImageRow(row: GalleryImageRow): GalleryImageRecord {
  return {
    id: row.id,
    invitationId: row.invitation_id,
    imageUrl: row.image_url,
    storagePath: row.storage_path,
    altText: row.alt_text,
    sortOrder: row.sort_order,
    createdAt: new Date(row.created_at),
  };
}

function mapGuestRow(row: GuestRow): GuestRecord {
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
  };
}

function mapRsvpRow(row: RsvpRow): RsvpRecord {
  return {
    id: row.id,
    guestId: row.guest_id,
    respondentName: row.respondent_name,
    status: row.status,
    attendees: row.attendees,
    note: row.note,
    respondedAt: new Date(row.responded_at),
    updatedAt: new Date(row.updated_at),
  };
}

function mapWishRow(row: WishRow): WishRecord {
  return {
    id: row.id,
    invitationId: row.invitation_id,
    guestId: row.guest_id,
    message: row.message,
    isApproved: row.is_approved,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

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

function mapDashboardInvitationSummaryRow(
  row: DashboardInvitationSummaryRow,
): DashboardInvitationSummary {
  const invitation = mapInvitationRow(row);
  const settingRow = firstEmbeddedRow(row.invitation_settings);
  const eventSlots = embeddedRows(row.event_slots)
    .map(mapEventSlotRow)
    .sort((left, right) => left.sortOrder - right.sortOrder);
  const galleryImages = embeddedRows(row.gallery_images)
    .map(mapGalleryImageRow)
    .sort((left, right) => left.sortOrder - right.sortOrder);
  const guests = embeddedRows(row.guests)
    .map((guestRow) => {
      const rsvpRow = firstEmbeddedRow(guestRow.rsvps);
      const wishRow = firstEmbeddedRow(guestRow.wishes);

      return {
        ...mapGuestRow(guestRow),
        rsvp: rsvpRow ? mapRsvpRow(rsvpRow) : null,
        wish: wishRow ? mapWishRow(wishRow) : null,
      };
    })
    .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());

  return {
    ...invitation,
    setting: settingRow ? mapInvitationSettingRow(settingRow) : null,
    eventSlots,
    galleryImages,
    guests,
  };
}

async function resolveServerClient(client?: SupabaseDbClient) {
  return client ?? (await createServerSupabaseClient());
}

function resolveAdminClient(client?: SupabaseDbClient) {
  return client ?? getSupabaseAdminClient();
}

async function getSlugLookupClient(client: SupabaseDbClient) {
  try {
    return getSupabaseAdminClient();
  } catch {
    return client;
  }
}

async function getInvitationBaseByOwnerId(userId: string, client: SupabaseDbClient) {
  const invitation = await unwrapMaybeSingle<InvitationRow>(
    await client
      .from("invitations")
      .select(INVITATION_BASE_SELECT)
      .eq("owner_id", userId)
      .maybeSingle(),
    "Gagal mengambil data invitation.",
  );

  return invitation ? mapInvitationRow(invitation) : null;
}

async function getInvitationRelations(invitationId: string, client: SupabaseDbClient) {
  const [settingRow, eventSlotRows, galleryRows] = await Promise.all([
    unwrapMaybeSingle<InvitationSettingRow>(
      await client
        .from("invitation_settings")
        .select(INVITATION_SETTING_SELECT)
        .eq("invitation_id", invitationId)
        .maybeSingle(),
      "Gagal mengambil pengaturan invitation.",
    ),
    unwrapList<EventSlotRow>(
      await client
        .from("event_slots")
        .select(EVENT_SLOT_SELECT)
        .eq("invitation_id", invitationId)
        .order("sort_order", { ascending: true }),
      "Gagal mengambil jadwal acara invitation.",
    ),
    unwrapList<GalleryImageRow>(
      await client
        .from("gallery_images")
        .select(GALLERY_IMAGE_SELECT)
        .eq("invitation_id", invitationId)
        .order("sort_order", { ascending: true }),
      "Gagal mengambil galeri invitation.",
    ),
  ]);

  return {
    setting: settingRow ? mapInvitationSettingRow(settingRow) : null,
    eventSlots: eventSlotRows.map(mapEventSlotRow),
    galleryImages: galleryRows.map(mapGalleryImageRow),
  };
}

async function hydrateInvitationWithRelations(
  invitation: InvitationRecord,
  client: SupabaseDbClient,
): Promise<InvitationWithRelations> {
  const relations = await getInvitationRelations(invitation.id, client);

  return {
    ...invitation,
    ...relations,
  };
}

async function ensureInvitationSetting(invitationId: string, client: SupabaseDbClient) {
  const existing = await unwrapMaybeSingle<InvitationSettingRow>(
    await client
      .from("invitation_settings")
      .select(INVITATION_SETTING_SELECT)
      .eq("invitation_id", invitationId)
      .maybeSingle(),
    "Gagal mengambil pengaturan invitation.",
  );

  if (existing) {
    return mapInvitationSettingRow(existing);
  }

  const inserted = await unwrapSingle<InvitationSettingRow>(
    await client
      .from("invitation_settings")
      .insert({
        invitation_id: invitationId,
      })
      .select(INVITATION_SETTING_SELECT)
      .single(),
    "Gagal membuat pengaturan invitation default.",
  );

  return mapInvitationSettingRow(inserted);
}

export async function createDefaultInvitation(
  userId: string,
  displayName = "Pengantin",
  client?: SupabaseDbClient,
) {
  const writableClient = await resolveServerClient(client);
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
  const slugLookupClient = await getSlugLookupClient(writableClient);
  const coupleSlug = await generateUniqueSlug(baseCoupleSlug, async (candidate) => {
    const existing = await unwrapMaybeSingle<Pick<InvitationRow, "id">>(
      await slugLookupClient
        .from("invitations")
        .select("id")
        .eq("couple_slug", candidate)
        .maybeSingle(),
      "Gagal memeriksa couple slug invitation.",
    );

    return Boolean(existing);
  });
  const now = new Date();

  const insertedInvitation = await unwrapSingle<InvitationRow>(
    await writableClient
      .from("invitations")
      .insert({
        owner_id: userId,
        status: "DRAFT",
        template,
        couple_slug: coupleSlug,
        partner_one_name: partnerOneName,
        partner_two_name: partnerTwoName,
        headline: generatedCopy.legacy.headline,
        subheadline: generatedCopy.legacy.subheadline,
        story: generatedCopy.legacy.story,
        closing_note: generatedCopy.legacy.closingNote,
        template_config: templateConfig as Json,
      })
      .select(INVITATION_BASE_SELECT)
      .single(),
    "Gagal membuat invitation default.",
  );

  await unwrapSingle<Pick<InvitationSettingRow, "id">>(
    await writableClient
      .from("invitation_settings")
      .insert({
        invitation_id: insertedInvitation.id,
      })
      .select("id")
      .single(),
    "Gagal membuat pengaturan invitation default.",
  );

  await unwrapList<Pick<EventSlotRow, "id">>(
    await writableClient.from("event_slots").insert([
      {
        invitation_id: insertedInvitation.id,
        label: "Akad Nikah",
        starts_at: addDays(now, 30).toISOString(),
        venue_name: "Nama Venue Akad",
        address: "Alamat lengkap venue akad akan ditampilkan di sini.",
        sort_order: 0,
      },
      {
        invitation_id: insertedInvitation.id,
        label: "Resepsi",
        starts_at: addDays(now, 30).toISOString(),
        venue_name: "Nama Venue Resepsi",
        address: "Alamat lengkap venue resepsi akan ditampilkan di sini.",
        sort_order: 1,
      },
    ]).select("id"),
    "Gagal membuat jadwal acara invitation default.",
  );

  return hydrateInvitationWithRelations(mapInvitationRow(insertedInvitation), writableClient);
}

export async function getOrCreateDashboardInvitation(
  userId: string,
  displayName?: string | null,
  client?: SupabaseDbClient,
) {
  const readableClient = await resolveServerClient(client);
  const existingInvitation = await getInvitationBaseByOwnerId(userId, readableClient);

  if (existingInvitation) {
    await ensureInvitationSetting(existingInvitation.id, readableClient);
    return hydrateInvitationWithRelations(existingInvitation, readableClient);
  }

  return createDefaultInvitation(userId, displayName ?? undefined, readableClient);
}

export async function getDashboardInvitationSummary(userId: string, client?: SupabaseDbClient) {
  if (client) {
    const response = await client
      .from("invitations")
      .select(DASHBOARD_INVITATION_SUMMARY_SELECT)
      .eq("owner_id", userId)
      .maybeSingle();
    const invitation = await unwrapMaybeSingle<DashboardInvitationSummaryRow>(
      response as unknown as PostgrestMaybeSingleResponse<DashboardInvitationSummaryRow>,
      "Gagal mengambil ringkasan invitation.",
    );

    return invitation ? mapDashboardInvitationSummaryRow(invitation) : null;
  }

  const getCachedDashboardInvitationSummary = unstable_cache(
    async (cacheUserId: string) => {
      const adminClient = resolveAdminClient();
      const response = await adminClient
        .from("invitations")
        .select(DASHBOARD_INVITATION_SUMMARY_SELECT)
        .eq("owner_id", cacheUserId)
        .maybeSingle();
      const invitation = await unwrapMaybeSingle<DashboardInvitationSummaryRow>(
        response as unknown as PostgrestMaybeSingleResponse<DashboardInvitationSummaryRow>,
        "Gagal mengambil ringkasan invitation.",
      );

      return invitation ? mapDashboardInvitationSummaryRow(invitation) : null;
    },
    ["invitation-summary-by-user"],
    {
      tags: [DASHBOARD_INVITATION_SUMMARY_CACHE_TAG],
    },
  );

  return getCachedDashboardInvitationSummary(userId);
}

export function mapInvitationToRenderModel(
  invitation: InvitationWithRelations,
  guest?: DashboardInvitationGuest | null,
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

export async function trackInvitationOpen(
  invitationId: string,
  guestId: string,
  path?: string,
  client?: SupabaseDbClient,
) {
  const writableClient = resolveAdminClient(client);

  await unwrapSingle(
    await writableClient
      .from("invitation_view_logs")
      .insert({
        invitation_id: invitationId,
        guest_id: guestId,
        path: path ?? null,
      })
      .select("id")
      .single(),
    "Gagal mencatat kunjungan invitation.",
  );
}

export async function getDashboardAnalyticsSummary(
  userId: string,
  client?: SupabaseDbClient,
  existingInvitation?: DashboardInvitationSummary | null,
): Promise<DashboardAnalyticsSummary | null> {
  const readableClient = await resolveServerClient(client);
  const invitation = existingInvitation ?? (await getDashboardInvitationSummary(userId, readableClient));

  if (!invitation) {
    return null;
  }

  const getCachedViewLogStats = unstable_cache(
    async (invitationId: string) => {
      const adminClient = resolveAdminClient();
      const [{ count: totalInvitationOpens }, viewLogs] = await Promise.all([
        adminClient
          .from("invitation_view_logs")
          .select("id", { count: "exact", head: true })
          .eq("invitation_id", invitationId),
        unwrapList<Pick<TableRow<"invitation_view_logs">, "guest_id">>(
          await adminClient
            .from("invitation_view_logs")
            .select("guest_id")
            .eq("invitation_id", invitationId),
          "Gagal mengambil log pembukaan invitation.",
        ),
      ]);

      return {
        totalInvitationOpens: totalInvitationOpens ?? 0,
        uniqueGuestOpens: new Set(viewLogs.map((row) => row.guest_id)).size,
      };
    },
    ["dashboard-view-log-stats"],
    {
      tags: [DASHBOARD_ANALYTICS_SUMMARY_CACHE_TAG],
    },
  );

  const viewLogStats = await getCachedViewLogStats(invitation.id);

  const totalGuests = invitation.guests.length;
  const totalRsvps = invitation.guests.filter((guest) => Boolean(guest.rsvp)).length;
  const attending = invitation.guests.filter((guest) => guest.rsvp?.status === "ATTENDING").length;
  const declined = invitation.guests.filter((guest) => guest.rsvp?.status === "DECLINED").length;
  const maybe = invitation.guests.filter((guest) => guest.rsvp?.status === "MAYBE").length;

  return {
    totalGuests,
    totalPersonalLinks: totalGuests,
    totalRsvps,
    totalInvitationOpens: viewLogStats.totalInvitationOpens,
    uniqueGuestOpens: viewLogStats.uniqueGuestOpens,
    rsvpBreakdown: {
      attending,
      declined,
      maybe,
    },
  };
}

export const dashboardCacheTags = {
  invitationSummary: DASHBOARD_INVITATION_SUMMARY_CACHE_TAG,
  analyticsSummary: DASHBOARD_ANALYTICS_SUMMARY_CACHE_TAG,
} as const;

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
}) {
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
