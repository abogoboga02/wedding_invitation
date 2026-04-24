import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";

import type { InvitationRenderModel } from "./invitation.types";
import { mapInvitationToRenderModel, trackInvitationOpen } from "./invitation.service";

const publicInvitationMetadataSelect = {
  coupleSlug: true,
  partnerOneName: true,
  partnerTwoName: true,
  headline: true,
  subheadline: true,
  coverImage: true,
  coverImageAlt: true,
} satisfies Prisma.InvitationSelect;

const publicInvitationInclude = {
  setting: {
    select: {
      isRsvpEnabled: true,
      isWishEnabled: true,
      autoPlayMusic: true,
    },
  },
  eventSlots: {
    orderBy: {
      sortOrder: "asc",
    },
  },
  galleryImages: {
    orderBy: {
      sortOrder: "asc",
    },
  },
  wishes: {
    where: {
      isApproved: true,
    },
    include: {
      guest: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 8,
  },
} satisfies Prisma.InvitationInclude;

const publicGuestInclude = {
  rsvp: true,
  wish: true,
  invitation: {
    include: publicInvitationInclude,
  },
} satisfies Prisma.GuestInclude;

type PublicInvitationMetadataRecord = Prisma.InvitationGetPayload<{
  select: typeof publicInvitationMetadataSelect;
}>;

type PublicGuestRecord = Prisma.GuestGetPayload<{
  include: typeof publicGuestInclude;
}>;

export type PublicInvitationMetadata = PublicInvitationMetadataRecord;

function normalizePublicInvitation(guest: PublicGuestRecord): InvitationRenderModel {
  return mapInvitationToRenderModel(
    guest.invitation,
    guest,
    guest.invitation.wishes.map((wish) => ({
      id: wish.id,
      guestName: wish.guest.name,
      message: wish.message,
      createdAt: wish.createdAt.toISOString(),
    })),
  );
}

export async function getPublicInvitationMetadataBySlug(coupleSlug: string) {
  return prisma.invitation.findFirst({
    where: {
      coupleSlug,
      status: "PUBLISHED",
    },
    select: publicInvitationMetadataSelect,
  });
}

export async function getPublicInvitationMetadataByRoute(coupleSlug: string, guestSlug: string) {
  const guest = await prisma.guest.findFirst({
    where: {
      guestSlug,
      invitation: {
        coupleSlug,
        status: "PUBLISHED",
      },
    },
    select: {
      invitation: {
        select: publicInvitationMetadataSelect,
      },
    },
  });

  return guest?.invitation ?? null;
}

export async function getPublicInvitationRouteData(
  coupleSlug: string,
  guestSlug: string,
): Promise<InvitationRenderModel | null> {
  const guest = await prisma.guest.findFirst({
    where: {
      guestSlug,
      invitation: {
        coupleSlug,
        status: "PUBLISHED",
      },
    },
    include: publicGuestInclude,
  });

  if (!guest) {
    return null;
  }

  return normalizePublicInvitation(guest);
}

export function getPublicInvitationPath(coupleSlug: string, guestSlug: string) {
  return `/${coupleSlug}/${guestSlug}`;
}

export { trackInvitationOpen };
