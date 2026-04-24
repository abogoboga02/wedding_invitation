import type { MetadataRoute } from "next";

import { buildSiteHref, getSiteUrl } from "@/lib/utils/site-url";

const siteUrl = getSiteUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/pricing"],
      disallow: ["/dashboard", "/admin", "/api/"],
    },
    sitemap: buildSiteHref("/sitemap.xml"),
    host: siteUrl,
  };
}
