import { afterEach, describe, expect, it } from "vitest";

import { buildSiteHref, getSiteMetadataBase, getSiteUrl } from "@/lib/utils/site-url";

const originalAppUrl = process.env.APP_URL;
const originalAuthUrl = process.env.AUTH_URL;
const originalNextAuthUrl = process.env.NEXTAUTH_URL;

afterEach(() => {
  if (originalAppUrl === undefined) {
    delete process.env.APP_URL;
  } else {
    process.env.APP_URL = originalAppUrl;
  }

  if (originalAuthUrl === undefined) {
    delete process.env.AUTH_URL;
  } else {
    process.env.AUTH_URL = originalAuthUrl;
  }

  if (originalNextAuthUrl === undefined) {
    delete process.env.NEXTAUTH_URL;
    return;
  }

  process.env.NEXTAUTH_URL = originalNextAuthUrl;
});

describe("site url helpers", () => {
  it("falls back to localhost when no site url env is set", () => {
    delete process.env.APP_URL;
    delete process.env.AUTH_URL;
    delete process.env.NEXTAUTH_URL;

    expect(getSiteUrl()).toBe("http://localhost:3000");
    expect(buildSiteHref("/pricing")).toBe("http://localhost:3000/pricing");
  });

  it("prefers APP_URL and adds https to production domains without a protocol", () => {
    process.env.APP_URL = "wedding-invitation-3z29.vercel.app";
    delete process.env.AUTH_URL;
    delete process.env.NEXTAUTH_URL;

    expect(getSiteUrl()).toBe("https://wedding-invitation-3z29.vercel.app");
    expect(getSiteMetadataBase().toString()).toBe("https://wedding-invitation-3z29.vercel.app/");
  });

  it("falls back to AUTH_URL before NEXTAUTH_URL", () => {
    delete process.env.APP_URL;
    process.env.AUTH_URL = "atelier-amora.vercel.app";
    process.env.NEXTAUTH_URL = "localhost:4000";

    expect(getSiteUrl()).toBe("https://atelier-amora.vercel.app");
  });

  it("keeps http for localhost values without a protocol", () => {
    delete process.env.APP_URL;
    delete process.env.AUTH_URL;
    process.env.NEXTAUTH_URL = "localhost:4000";

    expect(getSiteUrl()).toBe("http://localhost:4000");
    expect(buildSiteHref("/robots.txt")).toBe("http://localhost:4000/robots.txt");
  });
});
