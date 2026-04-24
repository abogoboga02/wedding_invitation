import { describe, expect, it } from "vitest";

import {
  buildGuestImportPreview,
  buildGuestSlugBatch,
  createUniqueGuestSlug,
} from "@/features/guest/guest.service";

describe("guest import helpers", () => {
  it("creates unique guest slugs for duplicate names", () => {
    const existingSlugs = new Set<string>();

    expect(createUniqueGuestSlug("Angga", existingSlugs)).toBe("angga");
    expect(createUniqueGuestSlug("Angga", existingSlugs)).toBe("angga-2");
    expect(createUniqueGuestSlug("Angga", existingSlugs)).toBe("angga-3");
  });

  it("flags duplicates against existing guests and inside the same file", () => {
    const preview = buildGuestImportPreview(
      [
        { name: "Angga", phone: "08123", email: undefined, baseSlug: "angga", line: 2 },
        { name: "Angga", phone: "08123", email: undefined, baseSlug: "angga", line: 3 },
        { name: "Dina", phone: "08999", email: undefined, baseSlug: "dina", line: 4 },
      ],
      [{ name: "Dina", phone: "08999", email: null, guestSlug: "dina" }],
    );

    expect(preview[0]).toMatchObject({
      status: "ready",
      guestSlug: "angga",
    });
    expect(preview[1]).toMatchObject({
      status: "duplicate",
      reason: "Duplikat di file import.",
    });
    expect(preview[2]).toMatchObject({
      status: "duplicate",
      reason: "Sudah ada di daftar tamu.",
    });
  });

  it("builds slug batches safely for repeated names", () => {
    expect(buildGuestSlugBatch(["Bapak Tamu", "Bapak Tamu", "Ibu Tamu"])).toEqual([
      "bapak-tamu",
      "bapak-tamu-2",
      "ibu-tamu",
    ]);
  });
});
