import type { InvitationRenderModel } from "./invitation.types";
import {
  getDashboardInvitationSummary,
  mapInvitationToRenderModel,
  trackInvitationOpen,
  type DashboardInvitationGuest,
  type DashboardInvitationSummary,
} from "./invitation.service";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { TableRow } from "@/lib/supabase/database.types";
import { unwrapMaybeSingle } from "@/lib/supabase/helpers";

export type PublicInvitationMetadata = Pick<
  DashboardInvitationSummary,
  | "coupleSlug"
  | "partnerOneName"
  | "partnerTwoName"
  | "headline"
  | "subheadline"
  | "coverImage"
  | "coverImageAlt"
>;

type PublishedInvitationLookup = Pick<TableRow<"invitations">, "id" | "owner_id">;

async function getPublishedInvitationBySlug(coupleSlug: string) {
  const admin = getSupabaseAdminClient();
  const invitation = await unwrapMaybeSingle<PublishedInvitationLookup>(
    await admin
      .from("invitations")
      .select("id, owner_id")
      .eq("couple_slug", coupleSlug)
      .eq("status", "PUBLISHED")
      .maybeSingle(),
    "Gagal mengambil invitation publik.",
  );

  if (!invitation) {
    return null;
  }

  return getDashboardInvitationSummary(invitation.owner_id, admin);
}

function buildApprovedPublicWishes(
  guests: DashboardInvitationGuest[],
) {
  return guests
    .filter((guest) => guest.wish?.isApproved)
    .sort(
      (left, right) =>
        right.wish!.createdAt.getTime() - left.wish!.createdAt.getTime(),
    )
    .slice(0, 8)
    .map((guest) => ({
      id: guest.wish!.id,
      guestName: guest.name,
      message: guest.wish!.message,
      createdAt: guest.wish!.createdAt.toISOString(),
    }));
}

function toPublicInvitationMetadata(
  invitation: DashboardInvitationSummary,
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

export async function getPublicInvitationMetadataBySlug(coupleSlug: string) {
  const invitation = await getPublishedInvitationBySlug(coupleSlug);
  return invitation ? toPublicInvitationMetadata(invitation) : null;
}

export async function getPublicInvitationMetadataByRoute(coupleSlug: string, guestSlug: string) {
  const invitation = await getPublishedInvitationBySlug(coupleSlug);

  if (!invitation) {
    return null;
  }

  const guest = invitation.guests.find((item) => item.guestSlug === guestSlug);

  return guest ? toPublicInvitationMetadata(invitation) : null;
}

export async function getPublicInvitationRouteData(
  coupleSlug: string,
  guestSlug: string,
): Promise<InvitationRenderModel | null> {
  const invitation = await getPublishedInvitationBySlug(coupleSlug);

  if (!invitation) {
    return null;
  }

  const guest = invitation.guests.find((item) => item.guestSlug === guestSlug);

  if (!guest) {
    return null;
  }

  return mapInvitationToRenderModel(
    invitation,
    guest,
    buildApprovedPublicWishes(invitation.guests),
  );
}

export function getPublicInvitationPath(coupleSlug: string, guestSlug: string) {
  return `/${coupleSlug}/${guestSlug}`;
}

export { trackInvitationOpen };
