import type { InvitationSocialPlatform } from "./form/config";

type InvitationDisplayImage = {
  imageUrl: string;
  altText?: string | null;
};

type ResolveInvitationLeadImageInput = {
  invitationId: string;
  partnerOneName: string;
  partnerTwoName: string;
  coverImage?: string | null;
  coverImageAlt?: string | null;
  galleryImages: InvitationDisplayImage[];
};

export type InvitationLeadImage = {
  url: string;
  altText: string | null;
  source: "gallery" | "cover";
};

export type InvitationResolvedSocialLink = {
  platform: InvitationSocialPlatform;
  handle: string;
  href: string;
  label: string;
};

function buildCoupleImageAlt(partnerOneName: string, partnerTwoName: string) {
  const names = [partnerOneName.trim(), partnerTwoName.trim()].filter(Boolean).join(" & ");
  return names ? `Potret ${names}` : "Potret pasangan";
}

function getStableIndex(seed: string, length: number) {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return length > 0 ? hash % length : 0;
}

function normalizeSocialHandle(handle: string) {
  const trimmedHandle = handle.trim();

  if (!trimmedHandle) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmedHandle)) {
    try {
      const parsedUrl = new URL(trimmedHandle);
      const segments = parsedUrl.pathname
        .split("/")
        .map((segment) => segment.trim())
        .filter(Boolean);
      const candidate = segments[segments.length - 1] ?? "";
      return candidate.replace(/^@+/, "");
    } catch {
      return trimmedHandle.replace(/^@+/, "");
    }
  }

  return trimmedHandle.replace(/^@+/, "");
}

export function resolveInvitationLeadImage({
  invitationId,
  partnerOneName,
  partnerTwoName,
  coverImage,
  coverImageAlt,
  galleryImages,
}: ResolveInvitationLeadImageInput): InvitationLeadImage | null {
  const fallbackAltText =
    coverImageAlt?.trim() || buildCoupleImageAlt(partnerOneName, partnerTwoName);

  if (galleryImages.length > 0) {
    const pickedImage = galleryImages[getStableIndex(invitationId, galleryImages.length)];

    return {
      url: pickedImage.imageUrl,
      altText: pickedImage.altText?.trim() || fallbackAltText,
      source: "gallery",
    };
  }

  if (!coverImage?.trim()) {
    return null;
  }

  return {
    url: coverImage,
    altText: fallbackAltText,
    source: "cover",
  };
}

export function resolveInvitationSocialLink(
  platform: InvitationSocialPlatform | "",
  handle: string,
): InvitationResolvedSocialLink | null {
  const normalizedHandle = normalizeSocialHandle(handle);

  if (!platform || !normalizedHandle) {
    return null;
  }

  return {
    platform,
    handle: normalizedHandle,
    href:
      platform === "instagram"
        ? `https://instagram.com/${normalizedHandle}`
        : `https://tiktok.com/@${normalizedHandle}`,
    label: `@${normalizedHandle}`,
  };
}
