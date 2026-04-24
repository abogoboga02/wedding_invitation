import type { MetadataRoute } from "next";
import { connection } from "next/server";

import { prisma } from "@/lib/db/prisma";
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
    const invitations = await prisma.invitation.findMany({
      where: {
        status: "PUBLISHED",
      },
      select: {
        updatedAt: true,
        coupleSlug: true,
        guests: {
          select: {
            guestSlug: true,
          },
          take: 10,
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    const invitationRoutes: MetadataRoute.Sitemap = invitations.flatMap((invitation) =>
      invitation.guests.map((guest) => ({
        url: buildSiteHref(`/${invitation.coupleSlug}/${guest.guestSlug}`),
        lastModified: invitation.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      })),
    );

    return [...staticRoutes, ...invitationRoutes];
  } catch {
    return staticRoutes;
  }
}
