import { describe, expect, it } from "vitest";

import { buildCoupleSlug, generateUniqueSlug, slugify } from "@/lib/utils/slug";

describe("slug helpers", () => {
  it("slugify normalizes names with spaces and punctuation", () => {
    expect(slugify(" Vebri & Diva ")).toBe("vebri-diva");
  });

  it("buildCoupleSlug joins both partner names", () => {
    expect(buildCoupleSlug("Vebri", "Diva")).toBe("vebri-dan-diva");
  });

  it("generateUniqueSlug skips reserved and existing slugs", async () => {
    const candidate = await generateUniqueSlug("Login", async (value) =>
      ["login-2"].includes(value),
    );

    expect(candidate).toBe("login-3");
  });
});
