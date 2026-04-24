import Image from "next/image";

import { normalizeTemplateConfig } from "@/features/invitation/form/config";

import type { TemplateComponentProps } from "../types";
import {
  CountdownBlock,
  CoupleProfiles,
  EventDetailCards,
  GalleryGrid,
  MusicPlayerCard,
  WeddingGiftBlock,
  WishesList,
} from "../shared/TemplateBlocks";

const modernMinimalThemes = {
  "classic-black": {
    shell: "bg-[#f4f1ed] text-[#12100f]",
    surface: "border border-black/10 bg-white/92",
    card: "border border-black/10 bg-[#ebe6df]",
    accent: "text-[#12100f]",
    muted: "text-[#67605b]",
  },
  "warm-gray": {
    shell: "bg-[#f6f2ee] text-[#181513]",
    surface: "border border-black/10 bg-white/88",
    card: "border border-black/10 bg-[#efebe6]",
    accent: "text-[#181513]",
    muted: "text-[#6a625c]",
  },
  "soft-contrast": {
    shell: "bg-[#fbf8f4] text-[#24201d]",
    surface: "border border-black/8 bg-[rgba(255,255,255,0.94)]",
    card: "border border-black/8 bg-[#f4efe8]",
    accent: "text-[#24201d]",
    muted: "text-[#746d66]",
  },
} as const;

function formatCase(value: string, mode: string) {
  return mode === "uppercase" ? value.toUpperCase() : value;
}

function Divider({ style }: { style: string }) {
  if (style === "none") {
    return null;
  }

  if (style === "block") {
    return <div className="h-2 w-16 rounded-full bg-black/12" />;
  }

  return <div className="h-px w-24 bg-black/15" />;
}

export function ModernMinimalTemplate({
  invitation,
  rsvpSlot,
  previewMode = false,
}: TemplateComponentProps) {
  const {
    coverPersonal,
    heroCouple,
    countdown,
    quote,
    profiles,
    eventDetails,
    gallery,
    loveStory,
    weddingGift,
    rsvp,
    closing,
  } = invitation.sections;
  const config = normalizeTemplateConfig("MODERN_MINIMAL", invitation.meta.templateConfig);
  const theme = modernMinimalThemes[config.theme.monochromeStyle];
  const headingClass =
    config.theme.typographyMode === "refined-sans"
      ? "font-sans tracking-[-0.05em]"
      : config.theme.typographyMode === "hybrid"
        ? "font-serif-display tracking-[-0.03em]"
        : "font-serif-display tracking-[-0.04em]";

  return (
    <div
      className={`overflow-hidden rounded-[2.4rem] border border-black/8 shadow-[0_28px_90px_rgba(25,20,16,0.1)] ${theme.shell}`}
    >
      <section className="border-b border-black/8">
        <div className="grid lg:grid-cols-[0.78fr_1.22fr]">
          <div className="border-b border-black/8 px-6 py-10 sm:px-10 lg:border-b-0 lg:border-r lg:px-12 lg:py-14">
            <p className="text-[11px] uppercase tracking-[0.34em] text-black/45">
              {previewMode ? "Preview Internal" : formatCase(coverPersonal.eyebrow, config.theme.titleCasingMode)}
            </p>
            <h1 className={`mt-6 text-4xl leading-none sm:text-5xl ${headingClass}`}>
              {heroCouple.partnerOneName}
              <span className="mx-3 inline-block text-black/30">&</span>
              {heroCouple.partnerTwoName}
            </h1>
            <p className="mt-6 max-w-md text-base leading-8 text-black/65">
              {coverPersonal.title}
            </p>

            <div className={`mt-8 rounded-[1.7rem] p-5 ${theme.surface}`}>
              <p className="text-[11px] uppercase tracking-[0.28em] text-black/40">
                {formatCase("Untuk tamu", config.theme.titleCasingMode)}
              </p>
              <p className="mt-3 text-2xl font-semibold">{coverPersonal.guestName}</p>
              <p className="mt-3 text-sm leading-7 text-black/60">{coverPersonal.subtitle}</p>
            </div>

            <div className="mt-8">
              <MusicPlayerCard coverPersonal={coverPersonal} theme={theme} />
            </div>
          </div>

          <div className="px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
            <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
              <div className={`rounded-[1.9rem] p-6 sm:p-8 ${theme.surface}`}>
                <p className="text-[11px] uppercase tracking-[0.28em] text-black/40">
                  {formatCase(heroCouple.eyebrow, config.theme.titleCasingMode)}
                </p>
                <h2 className={`mt-4 text-5xl leading-none sm:text-6xl ${headingClass}`}>
                  {formatCase(heroCouple.displayName, config.theme.titleCasingMode)}
                </h2>
                <p className="mt-6 max-w-xl text-sm leading-8 text-black/65">
                  {heroCouple.summary}
                </p>
              </div>

              {coverPersonal.image ? (
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1.9rem] border border-black/8">
                  <Image
                    src={coverPersonal.image.url}
                    alt={coverPersonal.image.altText ?? heroCouple.displayName}
                    fill
                    priority={!previewMode}
                    sizes="(max-width: 1024px) 100vw, 30vw"
                    className="object-cover grayscale-[12%]"
                  />
                </div>
              ) : (
                <div className="flex aspect-[4/5] items-end rounded-[1.9rem] border border-dashed border-black/12 bg-[linear-gradient(180deg,#ffffff,#ece7e1)] p-6">
                  <p className="max-w-xs text-sm leading-7 text-black/55">
                    Cover visual akan tampil di sini untuk menyeimbangkan ritme editorial template.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-[0.82fr_1.18fr]">
        <aside className="space-y-5 border-b border-black/8 px-6 py-8 sm:px-10 lg:border-b-0 lg:border-r lg:px-12 lg:py-12">
          <CountdownBlock countdown={countdown} theme={theme} />

          <section className={`rounded-[1.8rem] p-6 ${theme.surface}`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] uppercase tracking-[0.28em] text-black/40">
                {formatCase(quote.title, config.theme.titleCasingMode)}
              </p>
              <Divider style={config.theme.dividerStyle} />
            </div>
            <p className="mt-5 text-lg leading-8 text-black/75">“{quote.text}”</p>
            {quote.source ? (
              <p className="mt-4 text-sm font-medium text-black/55">{quote.source}</p>
            ) : null}
          </section>

          <section className={`rounded-[1.8rem] p-6 ${theme.surface}`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] uppercase tracking-[0.28em] text-black/40">
                {formatCase(loveStory.title, config.theme.titleCasingMode)}
              </p>
              <Divider style={config.theme.dividerStyle} />
            </div>
            <p className="mt-5 text-sm leading-8 text-black/65">{loveStory.narrative}</p>
          </section>

          <section className={`rounded-[1.8rem] p-6 ${theme.surface}`}>
            <p className="text-[11px] uppercase tracking-[0.28em] text-black/40">
              {formatCase(closing.title, config.theme.titleCasingMode)}
            </p>
            <p className="mt-4 text-sm leading-7 text-black/65">{closing.note}</p>
          </section>
        </aside>

        <div className="space-y-5 px-6 py-8 sm:px-10 lg:px-14 lg:py-12">
          <section className={`rounded-[1.9rem] p-6 sm:p-8 ${theme.surface}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-black/40">
                  {formatCase(profiles.title, config.theme.titleCasingMode)}
                </p>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-black/60">{profiles.intro}</p>
              </div>
              <Divider style={config.theme.dividerStyle} />
            </div>
            <div className="mt-5">
              <CoupleProfiles profiles={profiles} theme={theme} />
            </div>
          </section>

          <section className={`rounded-[1.9rem] p-6 sm:p-8 ${theme.surface}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-black/40">
                  {formatCase(eventDetails.title, config.theme.titleCasingMode)}
                </p>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-black/60">{eventDetails.intro}</p>
              </div>
              <Divider style={config.theme.dividerStyle} />
            </div>
            <div className="mt-5">
              <EventDetailCards eventDetails={eventDetails} theme={theme} />
            </div>
          </section>

          <section className={`rounded-[1.9rem] p-6 sm:p-8 ${theme.surface}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-black/40">
                  {formatCase(gallery.title, config.theme.titleCasingMode)}
                </p>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-black/60">{gallery.intro}</p>
              </div>
              <Divider style={config.theme.dividerStyle} />
            </div>
            <div className="mt-5">
              <GalleryGrid gallery={gallery} couple={heroCouple} theme={theme} />
            </div>
          </section>

          <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
            <section className={`rounded-[1.9rem] p-6 sm:p-8 ${theme.surface}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-black/40">
                    {formatCase(weddingGift.title, config.theme.titleCasingMode)}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-black/60">{weddingGift.intro}</p>
                </div>
                <Divider style={config.theme.dividerStyle} />
              </div>
              <div className="mt-5">
                <WeddingGiftBlock weddingGift={weddingGift} theme={theme} />
              </div>
            </section>

            <section className={`rounded-[1.9rem] p-6 sm:p-8 ${theme.surface}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-black/40">
                    {formatCase(rsvp.title, config.theme.titleCasingMode)}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-black/60">{rsvp.intro}</p>
                </div>
                <Divider style={config.theme.dividerStyle} />
              </div>
              <div className="mt-5 text-sm leading-7 text-black/65">
                {rsvp.enabled ? (
                  rsvpSlot
                ) : (
                  <p>Form RSVP sedang dinonaktifkan oleh pemilik invitation.</p>
                )}
              </div>
              <div className="mt-6 border-t border-black/8 pt-5">
                <WishesList rsvp={rsvp} theme={theme} />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
