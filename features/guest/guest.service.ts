import { slugify } from "@/lib/utils/slug";

import type { ParsedGuestCsvRow } from "./guest-csv";

export type GuestImportPreviewRow = {
  name: string;
  phone?: string;
  email?: string;
  guestSlug: string;
  line: number;
  status: "ready" | "duplicate";
  reason?: string;
};

export function createUniqueGuestSlug(
  name: string,
  existingSlugs: Set<string>,
  options?: { ignoreSlug?: string },
) {
  const baseSlug = slugify(name) || "guest";
  let candidate = baseSlug;
  let suffix = 2;

  while (
    existingSlugs.has(candidate) &&
    (!options?.ignoreSlug || candidate !== options.ignoreSlug)
  ) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  existingSlugs.add(candidate);

  return candidate;
}

export function buildGuestImportPreview(
  rows: ParsedGuestCsvRow[],
  existingGuests: Array<{
    name: string;
    phone?: string | null;
    email?: string | null;
    guestSlug: string;
  }>,
) {
  const existingSlugs = new Set(existingGuests.map((guest) => guest.guestSlug));
  const existingKeys = new Set(
    existingGuests.flatMap((guest) =>
      [guest.phone?.trim(), guest.email?.trim(), guest.name.trim().toLowerCase()].filter(Boolean),
    ),
  );
  const seenKeysInFile = new Set<string>();

  return rows.map<GuestImportPreviewRow>((row) => {
    const guestSlug = createUniqueGuestSlug(row.name, existingSlugs);
    const primaryKey =
      row.phone?.trim() || row.email?.trim() || row.name.trim().toLowerCase() || undefined;

    if (primaryKey && seenKeysInFile.has(primaryKey)) {
      return {
        name: row.name,
        phone: row.phone,
        email: row.email,
        line: row.line,
        guestSlug,
        status: "duplicate",
        reason: "Duplikat di file import.",
      };
    }

    if (primaryKey && existingKeys.has(primaryKey)) {
      seenKeysInFile.add(primaryKey);
      return {
        name: row.name,
        phone: row.phone,
        email: row.email,
        line: row.line,
        guestSlug,
        status: "duplicate",
        reason: "Sudah ada di daftar tamu.",
      };
    }

    if (primaryKey) {
      seenKeysInFile.add(primaryKey);
    }

    return {
      name: row.name,
      phone: row.phone,
      email: row.email,
      line: row.line,
      guestSlug,
      status: "ready",
    };
  });
}

export function buildGuestSlugBatch(names: string[]) {
  const existingSlugs = new Set<string>();
  return names.map((name) => createUniqueGuestSlug(name, existingSlugs));
}
