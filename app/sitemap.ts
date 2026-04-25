import type { MetadataRoute } from "next";
import { connection } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { unwrapList } from "@/lib/supabase/helpers";
import { buildSiteHref } from "@/lib/utils/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: buildSiteHref("/"),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: buildSiteHref("/pricing"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: buildSiteHref("/login"),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: buildSiteHref("/register"),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  try {
    const admin = getSupabaseAdminClient();
    const invitations = await unwrapList(
      await admin
        .from("invitations")
        .select("id, couple_slug, updated_at")
        .eq("status", "PUBLISHED"),
      "Gagal mengambil invitation untuk sitemap.",
    );

    if (invitations.length === 0) {
      return staticRoutes;
    }

    const guestRows = await unwrapList(
      await admin
        .from("guests")
        .select("invitation_id, guest_slug, created_at")
        .in(
          "invitation_id",
          invitations.map((invitation) => invitation.id),
        )
        .order("created_at", { ascending: true }),
      "Gagal mengambil guest untuk sitemap.",
    );

    const guestsByInvitationId = new Map<string, string[]>();
    guestRows.forEach((guest) => {
      const currentGuests = guestsByInvitationId.get(guest.invitation_id) ?? [];

      if (currentGuests.length < 10) {
        currentGuests.push(guest.guest_slug);
      }

      guestsByInvitationId.set(guest.invitation_id, currentGuests);
    });

    const invitationRoutes: MetadataRoute.Sitemap = invitations.flatMap((invitation) =>
      (guestsByInvitationId.get(invitation.id) ?? []).map((guestSlug) => ({
        url: buildSiteHref(`/${invitation.couple_slug}/${guestSlug}`),
        lastModified: new Date(invitation.updated_at),
        changeFrequency: "weekly",
        priority: 0.7,
      })),
    );

    return [...staticRoutes, ...invitationRoutes];
  } catch {
    return staticRoutes;
  }
}
