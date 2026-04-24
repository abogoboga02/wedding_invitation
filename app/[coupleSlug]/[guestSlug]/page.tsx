import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getPublicInvitationPath,
  getPublicInvitationMetadataByRoute,
  getPublicInvitationRouteData,
  trackInvitationOpen,
} from "@/features/invitation/public-invitation.service";
import { TemplateRenderer } from "@/features/invitation/templates/TemplateRenderer";
import { RsvpForm } from "@/features/rsvp/RsvpForm";

export async function generateMetadata(
  props: PageProps<"/[coupleSlug]/[guestSlug]">,
): Promise<Metadata> {
  const { coupleSlug, guestSlug } = await props.params;
  const invitation = await getPublicInvitationMetadataByRoute(coupleSlug, guestSlug);

  if (!invitation) {
    return {
      title: "Undangan Tidak Ditemukan",
      description: "Link undangan ini belum tersedia atau sudah tidak aktif.",
    };
  }

  const title = `${invitation.partnerOneName} & ${invitation.partnerTwoName} | Undangan Digital`;
  const description = invitation.subheadline;
  const canonicalPath = `/${coupleSlug}/${guestSlug}`;
  const ogImage = `/${coupleSlug}/${guestSlug}/opengraph-image`;

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
  props: PageProps<"/[coupleSlug]/[guestSlug]">,
) {
  const { coupleSlug, guestSlug } = await props.params;
  const invitation = await getPublicInvitationRouteData(coupleSlug, guestSlug);

  if (!invitation) {
    notFound();
  }

  await trackInvitationOpen(
    invitation.id,
    invitation.guestId!,
    getPublicInvitationPath(coupleSlug, guestSlug),
  );

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fdfaf7,#ffffff)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <TemplateRenderer
          invitation={invitation}
          rsvpSlot={invitation.isRsvpEnabled ? <RsvpForm invitation={invitation} /> : null}
        />
      </div>
    </main>
  );
}
