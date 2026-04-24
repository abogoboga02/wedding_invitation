import { afterEach, describe, expect, it } from "vitest";

import { buildSiteHref, getSiteMetadataBase, getSiteUrl } from "@/lib/utils/site-url";

const originalNextAuthUrl = process.env.NEXTAUTH_URL;

afterEach(() => {
  if (originalNextAuthUrl === undefined) {
    delete process.env.NEXTAUTH_URL;
    return;
  }

  process.env.NEXTAUTH_URL = originalNextAuthUrl;
});

describe("site url helpers", () => {
  it("falls back to localhost when NEXTAUTH_URL is empty", () => {
    delete process.env.NEXTAUTH_URL;

    expect(getSiteUrl()).toBe("http://localhost:3000");
    expect(buildSiteHref("/pricing")).toBe("http://localhost:3000/pricing");
  });

  it("adds https to production domains without a protocol", () => {
    process.env.NEXTAUTH_URL = "wedding-invitation-3z29.vercel.app";

    expect(getSiteUrl()).toBe("https://wedding-invitation-3z29.vercel.app");
    expect(getSiteMetadataBase().toString()).toBe("https://wedding-invitation-3z29.vercel.app/");
  });

  it("keeps http for localhost values without a protocol", () => {
    process.env.NEXTAUTH_URL = "localhost:4000";

    expect(getSiteUrl()).toBe("http://localhost:4000");
    expect(buildSiteHref("/robots.txt")).toBe("http://localhost:4000/robots.txt");
  });
});
