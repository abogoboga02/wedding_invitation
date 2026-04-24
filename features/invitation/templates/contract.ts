import type { InvitationStatus, InvitationTemplate, RsvpStatus } from "@prisma/client";

import { buildGeneratedInvitationCopy } from "@/features/invitation/generated-copy";
import type { InvitationTemplateConfigValues } from "@/features/invitation/form/config";
import { getMusicPresetById } from "@/lib/constants/music-playlist";

import type { InvitationRenderModel } from "../invitation.types";
import type { InvitationTemplateSlug } from "./template-slugs";

export type SharedInvitationEvent = {
  id: string;
  label: string;
  startsAt: string;
  venueName: string;
  address: string;
  placeName?: string | null;
  formattedAddress?: string | null;
  mapsUrl?: string | null;
  googleMapsUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export type SharedInvitationGalleryItem = {
  id: string;
  imageUrl: string;
  altText?: string | null;
};

export type SharedInvitationWish = {
  id: string;
  guestName: string;
  message: string;
  createdAt: string;
};

export type SharedInvitationRsvpState = {
  respondentName?: string | null;
  status: RsvpStatus;
  attendees: number;
  note?: string | null;
};

export type SharedInvitationTemplateData = {
  meta: {
    id: string;
    status: InvitationStatus;
    template: InvitationTemplate;
    templateSlug: InvitationTemplateSlug;
    templateConfig: InvitationTemplateConfigValues;
    coupleSlug: string;
    publishedAt?: string | null;
    usesGeneratedCopy: boolean;
  };
  sections: {
    coverPersonal: {
      eyebrow: string;
      title: string;
      subtitle: string;
      guestName: string;
      image?: {
        url: string;
        altText?: string | null;
      } | null;
      music?: {
        url: string;
        originalName?: string | null;
        mimeType?: string | null;
        autoPlay: boolean;
      } | null;
    };
    heroCouple: {
      eyebrow: string;
      partnerOneName: string;
      partnerTwoName: string;
      displayName: string;
      summary: string;
      invitationLine: string;
    };
    countdown: {
      startsAt?: string | null;
      label: string;
    };
    quote: {
      title: string;
      text: string;
      source?: string | null;
    };
    profiles: {
      title: string;
      intro: string;
      partnerOne: {
        fullName: string;
        nickname?: string | null;
        bio: string;
      };
      partnerTwo: {
        fullName: string;
        nickname?: string | null;
        bio: string;
      };
    };
    eventDetails: {
      title: string;
      intro: string;
      locationCtaLabel: string;
      events: SharedInvitationEvent[];
      primaryEvent?: SharedInvitationEvent | null;
    };
    gallery: {
      title: string;
      intro: string;
      items: SharedInvitationGalleryItem[];
    };
    loveStory: {
      title: string;
      narrative: string;
    };
    weddingGift: {
      title: string;
      intro: string;
      enabled: boolean;
      entries: InvitationTemplateConfigValues["gift"]["entries"];
    };
    rsvp: {
      title: string;
      intro: string;
      enabled: boolean;
      wishEnabled: boolean;
      currentResponse?: SharedInvitationRsvpState | null;
      wishes: SharedInvitationWish[];
    };
    closing: {
      title: string;
      note: string;
    };
  };
};

function getCoverMusic(invitation: InvitationRenderModel) {
  if (invitation.musicUrl) {
    return {
      url: invitation.musicUrl,
      originalName: invitation.musicOriginalName,
      mimeType: invitation.musicMimeType,
      autoPlay: invitation.autoPlayMusic,
    };
  }

  const preset =
    invitation.templateConfig.music.source === "preset"
      ? getMusicPresetById(invitation.templateConfig.music.presetId)
      : null;

  if (!preset) {
    return null;
  }

  return {
    url: preset.url,
    originalName: preset.title,
    mimeType: preset.mimeType,
    autoPlay: invitation.autoPlayMusic,
  };
}

export function buildSharedInvitationTemplateData(
  invitation: InvitationRenderModel,
): SharedInvitationTemplateData {
  const primaryEvent = invitation.events[0] ?? null;
  const coverImage = invitation.coverImage
    ? {
        url: invitation.coverImage,
        altText: invitation.coverImageAlt,
      }
    : null;
  const generatedCopy = buildGeneratedInvitationCopy({
    templateSlug: invitation.templateSlug,
    partnerOneName: invitation.partnerOneName,
    partnerTwoName: invitation.partnerTwoName,
    config: invitation.templateConfig,
  });

  return {
    meta: {
      id: invitation.id,
      status: invitation.status,
      template: invitation.template,
      templateSlug: invitation.templateSlug,
      templateConfig: invitation.templateConfig,
      coupleSlug: invitation.coupleSlug,
      publishedAt: invitation.publishedAt,
      usesGeneratedCopy: true,
    },
    sections: {
      coverPersonal: {
        eyebrow: generatedCopy.sections.coverPersonal.eyebrow,
        title: generatedCopy.sections.coverPersonal.title,
        subtitle: generatedCopy.sections.coverPersonal.subtitle,
        guestName: invitation.guestName,
        image: coverImage,
        music: getCoverMusic(invitation),
      },
      heroCouple: {
        eyebrow: generatedCopy.sections.heroCouple.eyebrow,
        partnerOneName: invitation.partnerOneName,
        partnerTwoName: invitation.partnerTwoName,
        displayName: `${invitation.partnerOneName} & ${invitation.partnerTwoName}`,
        summary: generatedCopy.sections.heroCouple.summary,
        invitationLine: generatedCopy.sections.heroCouple.invitationLine,
      },
      countdown: {
        startsAt: primaryEvent?.startsAt ?? null,
        label: primaryEvent?.label ?? "Acara Utama",
      },
      quote: generatedCopy.sections.quote,
      profiles: {
        title: generatedCopy.sections.profiles.title,
        intro: generatedCopy.sections.profiles.intro,
        partnerOne: {
          fullName: invitation.partnerOneName,
          nickname: invitation.templateConfig.copy.partnerNicknames.partnerOne || null,
          bio: generatedCopy.sections.profiles.partnerOneSummary,
        },
        partnerTwo: {
          fullName: invitation.partnerTwoName,
          nickname: invitation.templateConfig.copy.partnerNicknames.partnerTwo || null,
          bio: generatedCopy.sections.profiles.partnerTwoSummary,
        },
      },
      eventDetails: {
        title: generatedCopy.sections.eventDetails.title,
        intro: generatedCopy.sections.eventDetails.intro,
        locationCtaLabel: generatedCopy.sections.eventDetails.locationCtaLabel,
        events: invitation.events,
        primaryEvent,
      },
      gallery: {
        title: generatedCopy.sections.gallery.title,
        intro: generatedCopy.sections.gallery.intro,
        items: invitation.galleryImages,
      },
      loveStory: {
        title: generatedCopy.sections.loveStory.title,
        narrative: generatedCopy.sections.loveStory.narrative,
      },
      weddingGift: {
        title: generatedCopy.sections.weddingGift.title,
        intro: generatedCopy.sections.weddingGift.intro,
        enabled: invitation.templateConfig.gift.enabled,
        entries: invitation.templateConfig.gift.entries,
      },
      rsvp: {
        title: generatedCopy.sections.rsvp.title,
        intro: generatedCopy.sections.rsvp.intro,
        enabled: invitation.isRsvpEnabled,
        wishEnabled: invitation.isWishEnabled,
        currentResponse: invitation.currentRsvp,
        wishes: invitation.wishes,
      },
      closing: {
        title: generatedCopy.sections.closing.title,
        note: generatedCopy.sections.closing.note,
      },
    },
  };
}
