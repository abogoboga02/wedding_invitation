"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db/prisma";

import { rsvpSchema } from "@/features/rsvp/rsvp.schema";

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

  const guest = await prisma.guest.findFirst({
    where: {
      id: parsedRsvp.data.guestId,
      guestSlug: parsedRsvp.data.guestSlug,
      invitation: {
        coupleSlug: parsedRsvp.data.coupleSlug,
        status: "PUBLISHED",
      },
    },
    select: {
      id: true,
      invitationId: true,
      invitation: {
        select: {
          setting: {
            select: {
              isRsvpEnabled: true,
              isWishEnabled: true,
            },
          },
        },
      },
      rsvp: {
        select: {
          updatedAt: true,
        },
      },
      wish: {
        select: {
          updatedAt: true,
        },
      },
    },
  });

  if (!guest) {
    return {
      error: "Link undangan tidak valid.",
    };
  }

  if (guest.invitation.setting?.isRsvpEnabled === false) {
    return {
      error: "Form RSVP sedang dinonaktifkan oleh pemilik undangan.",
    };
  }

  if (guest.rsvp?.updatedAt && Date.now() - guest.rsvp.updatedAt.getTime() < 30_000) {
    return {
      error: "Tunggu sebentar sebelum mengirim RSVP lagi.",
    };
  }

  if (
    guest.invitation.setting?.isWishEnabled !== false &&
    parsedRsvp.data.wishMessage?.trim() &&
    guest.wish?.updatedAt &&
    Date.now() - guest.wish.updatedAt.getTime() < 30_000
  ) {
    return {
      error: "Tunggu sebentar sebelum memperbarui ucapan lagi.",
    };
  }

  await prisma.$transaction(async (tx) => {
    await tx.rsvp.upsert({
      where: { guestId: guest.id },
      update: {
        respondentName: parsedRsvp.data.respondentName?.trim() || null,
        status: parsedRsvp.data.status,
        attendees: parsedRsvp.data.attendees,
        note: parsedRsvp.data.note?.trim() || null,
        respondedAt: new Date(),
      },
      create: {
        guestId: guest.id,
        respondentName: parsedRsvp.data.respondentName?.trim() || null,
        status: parsedRsvp.data.status,
        attendees: parsedRsvp.data.attendees,
        note: parsedRsvp.data.note?.trim() || null,
      },
    });

    if (guest.invitation.setting?.isWishEnabled !== false && parsedRsvp.data.wishMessage?.trim()) {
      await tx.wish.upsert({
        where: { guestId: guest.id },
        update: {
          message: parsedRsvp.data.wishMessage.trim(),
          isApproved: true,
        },
        create: {
          invitationId: guest.invitationId,
          guestId: guest.id,
          message: parsedRsvp.data.wishMessage.trim(),
        },
      });
    }
  });

  revalidatePath(`/${parsedRsvp.data.coupleSlug}/${parsedRsvp.data.guestSlug}`);
  revalidatePath("/dashboard/rsvp");
  revalidatePath("/dashboard/analytics");

  return {
    success: "Terima kasih, RSVP Anda sudah kami terima.",
  };
}
