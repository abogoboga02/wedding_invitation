import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { after } from "next/server";

import {
  getPublicInvitationMetadataBySlug,
  getPublicInvitationPath,
  getPublicInvitationRouteData,
  trackInvitationOpen,
} from "@/features/invitation/public-invitation.service";
import { TemplateRenderer } from "@/features/invitation/templates/TemplateRenderer";
import { RsvpForm } from "@/features/rsvp/RsvpForm";

function resolveSingleSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function PublicRsvpGuestNotice() {
  return (
    <div className="rounded-[1.6rem] border border-current/15 bg-current/5 px-4 py-4 text-sm leading-7 text-current/80">
      Gunakan link tamu dengan parameter <span className="font-semibold">?to=</span> agar form
      RSVP aktif dan tersimpan ke tamu yang benar.
    </div>
  );
}

export async function generateMetadata(
  props: PageProps<"/[coupleSlug]">,
): Promise<Metadata> {
  const { coupleSlug } = await props.params;
  const invitation = await getPublicInvitationMetadataBySlug(coupleSlug);

  if (!invitation) {
    return {
      title: "Undangan Tidak Ditemukan",
      description: "Link undangan ini belum tersedia atau sudah tidak aktif.",
    };
  }

  const title = `${invitation.partnerOneName} & ${invitation.partnerTwoName} | Undangan Digital`;
  const description = invitation.subheadline;
  const canonicalPath = `/${coupleSlug}`;
  const ogImage = `/${coupleSlug}/opengraph-image`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        invitation.coverImage
          ? { url: invitation.coverImage, alt: invitation.coverImageAlt ?? title }
          : { url: ogImage, alt: title },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [invitation.coverImage ?? ogImage],
    },
  };
}

export default async function PublicInvitationPage(
  props: PageProps<"/[coupleSlug]">,
) {
  const { coupleSlug } = await props.params;
  const searchParams = await props.searchParams;
  const guestQuery = resolveSingleSearchParam(searchParams.to);
  const invitation = await getPublicInvitationRouteData(coupleSlug, guestQuery);

  if (!invitation) {
    notFound();
  }

  const trackedPath =
    invitation.guestId && guestQuery
      ? getPublicInvitationPath(coupleSlug, guestQuery)
      : null;

  after(() => {
    if (!trackedPath || !invitation.guestId) {
      return;
    }

    return trackInvitationOpen(invitation.id, invitation.guestId, trackedPath).catch(() => {
      // Skip blocking the public page if open-log persistence fails.
    });
  });

  const rsvpSlot = invitation.isRsvpEnabled ? (
    invitation.guestId ? (
      <RsvpForm invitation={invitation} />
    ) : (
      <PublicRsvpGuestNotice />
    )
  ) : null;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fbf6ef,#ffffff)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <TemplateRenderer invitation={invitation} rsvpSlot={rsvpSlot} />
      </div>
    </main>
  );
}
