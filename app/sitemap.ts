import type { MetadataRoute } from "next";
import { connection } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { unwrapList } from "@/lib/supabase/helpers";
import { getPublicInvitationPath } from "@/features/invitation/public-invitation.service";
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

    const invitationRoutes: MetadataRoute.Sitemap = invitations.map((invitation) => ({
      url: buildSiteHref(getPublicInvitationPath(invitation.couple_slug)),
      lastModified: new Date(invitation.updated_at),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    return [...staticRoutes, ...invitationRoutes];
  } catch {
    return staticRoutes;
  }
}
