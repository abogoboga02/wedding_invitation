import type { InvitationStatus, InvitationTemplate, RsvpStatus } from "@/lib/domain/types";

import type { InvitationTemplateConfigValues } from "./form/config";
import type { InvitationTemplateSlug } from "./templates/template-slugs";

export type InvitationRenderModel = {
  id: string;
  status: InvitationStatus;
  template: InvitationTemplate;
  templateSlug: InvitationTemplateSlug;
  usesGeneratedCopy: boolean;
  coupleSlug: string;
  partnerOneName: string;
  partnerTwoName: string;
  headline: string;
  subheadline: string;
  story: string;
  closingNote: string;
  templateConfig: InvitationTemplateConfigValues;
  coverImage?: string | null;
  coverImageAlt?: string | null;
  musicUrl?: string | null;
  musicOriginalName?: string | null;
  musicMimeType?: string | null;
  publishedAt?: string | null;
  isRsvpEnabled: boolean;
  isWishEnabled: boolean;
  autoPlayMusic: boolean;
  guestName: string;
  guestId?: string;
  guestSlug?: string;
  guestPhone?: string | null;
  currentRsvp?: {
    respondentName?: string | null;
    status: RsvpStatus;
    attendees: number;
    note?: string | null;
  } | null;
  currentWish?: {
    message: string;
  } | null;
  events: Array<{
    id: string;
    label: string;
    startsAt: string;
    venueName: string;
    address: string;
    placeName?: string | null;
    formattedAddress?: string | null;
    mapsUrl?: string | null;
    googleMapsUrl?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  }>;
  galleryImages: Array<{
    id: string;
    imageUrl: string;
    altText?: string | null;
  }>;
  wishes: Array<{
    id: string;
    guestName: string;
    message: string;
    createdAt: string;
  }>;
};
