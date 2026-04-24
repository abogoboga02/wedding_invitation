import { RESERVED_SLUGS } from "@/lib/constants/invitation";

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function isReservedSlug(value: string) {
  return RESERVED_SLUGS.has(value.toLowerCase());
}

export function buildCoupleSlug(partnerOneName: string, partnerTwoName: string) {
  const first = slugify(partnerOneName);
  const second = slugify(partnerTwoName);

  return [first, second].filter(Boolean).join("-dan-") || "undangan-pengantin";
}

export async function generateUniqueSlug(
  baseValue: string,
  exists: (candidate: string) => Promise<boolean>,
) {
  const normalizedBase = slugify(baseValue) || "undangan";
  let candidate = normalizedBase;
  let suffix = 1;

  while (isReservedSlug(candidate) || (await exists(candidate))) {
    suffix += 1;
    candidate = `${normalizedBase}-${suffix}`;
  }

  return candidate;
}
