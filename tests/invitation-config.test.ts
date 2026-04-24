import { describe, expect, it } from "vitest";

import { buildGeneratedInvitationCopy } from "@/features/invitation/generated-copy";
import {
  normalizeTemplateConfig,
  updateTemplateConfigMusicSelection,
} from "@/features/invitation/form/config";

describe("invitation template config", () => {
  it("keeps fixed template defaults even when legacy theme config is present", () => {
    const normalized = normalizeTemplateConfig("KOREAN_SOFT", {
      floralStyle: "wild-bloom",
      pastelVariant: "peach-cream",
      frameStyle: "floating-card",
      greetingTone: "gentle",
    });

    expect(normalized.theme.floralStyle).toBe("blush-petal");
    expect(normalized.theme.pastelVariant).toBe("soft-rose");
    expect(normalized.copy.partnerNicknames.partnerOne).toBe("");
    expect(normalized.gift.enabled).toBe(false);
    expect(normalized.music.source).toBe("preset");
  });

  it("updates music selection without dropping the existing shared config", () => {
    const nextConfig = updateTemplateConfigMusicSelection("MODERN_MINIMAL", null, {
      source: "preset",
      presetId: "editorial-muse",
      mood: "editorial",
    });

    expect(nextConfig.music.presetId).toBe("editorial-muse");
    expect(nextConfig.music.mood).toBe("editorial");
    expect(nextConfig.copy.partnerNicknames.partnerTwo).toBe("");
  });
});

describe("generated invitation copy", () => {
  it("builds deterministic fixed copy from template slug and structured config", () => {
    const config = normalizeTemplateConfig("ELEGANT_LUXURY", {
      copy: {
        partnerNicknames: {
          partnerOne: "Adrian",
          partnerTwo: "Selma",
        },
      },
      loveStory: {
        narrative: "Kami bertemu, bertumbuh, lalu memutuskan melangkah ke babak baru bersama.",
      },
    });

    const copy = buildGeneratedInvitationCopy({
      templateSlug: "elegant-luxury",
      partnerOneName: "Adrian Putra",
      partnerTwoName: "Selma Kirana",
      config,
    });

    expect(copy.sections.coverPersonal.title).toContain("Adrian");
    expect(copy.sections.coverPersonal.title).toContain("Selma");
    expect(copy.sections.quote.text).toContain("kebesaran-Nya");
    expect(copy.sections.eventDetails.locationCtaLabel).toBe("Lihat lokasi");
    expect(copy.sections.loveStory.narrative).toContain("melangkah ke babak baru");
  });
});
