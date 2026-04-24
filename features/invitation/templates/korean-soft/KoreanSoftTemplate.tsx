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

const koreanSoftThemes = {
  "soft-rose": {
    shell: "bg-[linear-gradient(180deg,#fffaf8,#fff3ef)] text-[#5f4b51]",
    surface: "border border-[rgba(200,125,135,0.18)] bg-[rgba(255,255,255,0.84)]",
    card: "border border-[rgba(200,125,135,0.14)] bg-[rgba(251,234,214,0.62)]",
    accent: "text-[#c87d87]",
    muted: "text-[#806b70]",
    glowA: "bg-[#f0c4cb]/35",
    glowB: "bg-[#fbead6]/70",
  },
  "peach-cream": {
    shell: "bg-[linear-gradient(180deg,#fffaf5,#fff0e7)] text-[#654e4a]",
    surface: "border border-[rgba(229,188,169,0.24)] bg-[rgba(255,255,255,0.86)]",
    card: "border border-[rgba(229,188,169,0.18)] bg-[rgba(251,234,214,0.7)]",
    accent: "text-[#d08f7e]",
    muted: "text-[#8b6c66]",
    glowA: "bg-[#e5bca9]/35",
    glowB: "bg-[#fbead6]/70",
  },
  "ivory-blush": {
    shell: "bg-[linear-gradient(180deg,#fffdfb,#fff5f3)] text-[#5f5053]",
    surface: "border border-[rgba(240,196,203,0.22)] bg-[rgba(255,255,255,0.9)]",
    card: "border border-[rgba(240,196,203,0.18)] bg-[rgba(255,244,246,0.78)]",
    accent: "text-[#c58591]",
    muted: "text-[#7e6d71]",
    glowA: "bg-[#f0c4cb]/28",
    glowB: "bg-[#ffffff]/70",
  },
} as const;

const frameStyles = {
  rounded: "rounded-[2.6rem] border border-white/70 shadow-[0_26px_64px_rgba(190,139,149,0.18)]",
  "soft-outline":
    "rounded-[2.6rem] border-2 border-[rgba(255,255,255,0.82)] shadow-[0_18px_40px_rgba(190,139,149,0.14)]",
  "floating-card":
    "rounded-[2.2rem] border border-white/65 shadow-[0_30px_72px_rgba(190,139,149,0.22)] -rotate-[1.5deg]",
} as const;

export function KoreanSoftTemplate({
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
  const config = normalizeTemplateConfig("KOREAN_SOFT", invitation.meta.templateConfig);
  const theme = koreanSoftThemes[config.theme.pastelVariant];

  return (
    <div
      className={`overflow-hidden rounded-[2.7rem] shadow-[0_32px_96px_rgba(194,144,154,0.16)] ${theme.shell}`}
    >
      <section className="relative isolate overflow-hidden px-6 pb-12 pt-14 sm:px-10 lg:px-16 lg:pb-16 lg:pt-18">
        <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_top_left,rgba(240,196,203,0.75),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(229,188,169,0.42),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.75),rgba(255,243,239,0.86))]" />
        <div className={`absolute -left-16 top-8 -z-20 h-44 w-44 rounded-full blur-3xl ${theme.glowA}`} />
        <div className={`absolute right-0 top-24 -z-20 h-52 w-52 rounded-full blur-3xl ${theme.glowB}`} />

        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.98fr_1.02fr] lg:items-center">
          <div className="order-2 text-center lg:order-1 lg:text-left">
            <p className="text-xs uppercase tracking-[0.34em] text-[#b17b83]">
              {previewMode ? "Preview Dashboard" : coverPersonal.eyebrow}
            </p>
            <h1 className="mt-7 font-serif-display text-5xl leading-none text-[#5f454b] sm:text-6xl lg:text-7xl">
              {heroCouple.partnerOneName}
              <span className={`mx-3 inline-block ${theme.accent}`}>&</span>
              {heroCouple.partnerTwoName}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#7f6a70] lg:mx-0 sm:text-lg">
              {coverPersonal.title}
            </p>

            <div className={`mx-auto mt-10 max-w-xl rounded-[2.1rem] p-6 sm:p-8 lg:mx-0 ${theme.surface}`}>
              <p className="text-xs uppercase tracking-[0.28em] text-[#b17b83]/85">Kepada</p>
              <p className="mt-4 text-3xl font-semibold text-[#5f454b] sm:text-4xl">
                {coverPersonal.guestName}
              </p>
              <p className="mt-4 text-sm leading-7 text-[#7f6a70]">{coverPersonal.subtitle}</p>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            {coverPersonal.image ? (
              <div className={`relative mx-auto aspect-[4/5] max-w-md overflow-hidden ${frameStyles[config.theme.frameStyle]}`}>
                <Image
                  src={coverPersonal.image.url}
                  alt={coverPersonal.image.altText ?? heroCouple.displayName}
                  fill
                  priority={!previewMode}
                  sizes="(max-width: 1024px) 100vw, 36vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.24))]" />
              </div>
            ) : (
              <div className={`mx-auto flex aspect-[4/5] max-w-md items-end border border-[rgba(200,125,135,0.18)] bg-[linear-gradient(180deg,rgba(240,196,203,0.28),rgba(255,255,255,0.85))] p-8 shadow-[0_26px_64px_rgba(190,139,149,0.12)] ${frameStyles[config.theme.frameStyle]}`}>
                <p className="max-w-xs text-sm leading-7 text-[#7f6a70]">
                  Cover image utama akan tampil di sini dengan framing lembut dan whitespace yang cukup.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-6 px-6 pb-6 sm:px-10 lg:px-16 lg:pb-12">
        <div className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <section className={`rounded-[2.1rem] p-6 sm:p-8 ${theme.surface}`}>
            <p className="text-xs uppercase tracking-[0.3em] text-[#b17b83]/85">{heroCouple.eyebrow}</p>
            <h2 className="mt-4 font-serif-display text-4xl text-[#5f454b] sm:text-5xl">
              {heroCouple.displayName}
            </h2>
            <p className="mt-5 text-base leading-8 text-[#7f6a70]">{heroCouple.summary}</p>
          </section>

          <CountdownBlock countdown={countdown} theme={theme} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className={`rounded-[2.1rem] p-6 sm:p-8 ${theme.surface}`}>
            <p className="text-xs uppercase tracking-[0.3em] text-[#b17b83]/85">{quote.title}</p>
            <p className="mt-5 font-serif-display text-2xl leading-9 text-[#5f454b]">“{quote.text}”</p>
            {quote.source ? (
              <p className="mt-4 text-sm font-medium text-[#7f6a70]">{quote.source}</p>
            ) : null}
          </section>

          <section className={`rounded-[2.1rem] p-6 sm:p-8 ${theme.surface}`}>
            <p className="text-xs uppercase tracking-[0.3em] text-[#b17b83]/85">{profiles.title}</p>
            <p className="mt-4 text-sm leading-7 text-[#7f6a70]">{profiles.intro}</p>
            <div className="mt-5">
              <CoupleProfiles profiles={profiles} theme={theme} />
            </div>
          </section>
        </div>

        <section className={`rounded-[2.1rem] p-6 sm:p-8 ${theme.surface}`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#b17b83]/85">{eventDetails.title}</p>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-[#7f6a70]">{eventDetails.intro}</p>
            </div>
            <MusicPlayerCard coverPersonal={coverPersonal} theme={theme} />
          </div>
          <div className="mt-5">
            <EventDetailCards eventDetails={eventDetails} theme={theme} />
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className={`rounded-[2.1rem] p-6 sm:p-8 ${theme.surface}`}>
            <p className="text-xs uppercase tracking-[0.3em] text-[#b17b83]/85">{gallery.title}</p>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#7f6a70]">{gallery.intro}</p>
            <div className="mt-5">
              <GalleryGrid gallery={gallery} couple={heroCouple} theme={theme} />
            </div>
          </section>

          <section className={`rounded-[2.1rem] p-6 sm:p-8 ${theme.surface}`}>
            <p className="text-xs uppercase tracking-[0.3em] text-[#b17b83]/85">{loveStory.title}</p>
            <p className="mt-5 text-sm leading-8 text-[#7f6a70]">{loveStory.narrative}</p>
          </section>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.98fr_1.02fr]">
          <section className={`rounded-[2.1rem] p-6 sm:p-8 ${theme.surface}`}>
            <p className="text-xs uppercase tracking-[0.3em] text-[#b17b83]/85">{weddingGift.title}</p>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#7f6a70]">{weddingGift.intro}</p>
            <div className="mt-5">
              <WeddingGiftBlock weddingGift={weddingGift} theme={theme} />
            </div>
          </section>

          <section className={`rounded-[2.1rem] p-6 sm:p-8 ${theme.surface}`}>
            <p className="text-xs uppercase tracking-[0.3em] text-[#b17b83]/85">{rsvp.title}</p>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#7f6a70]">{rsvp.intro}</p>
            <div className="mt-5 text-sm leading-7 text-[#7f6a70]">
              {rsvp.enabled ? (
                rsvpSlot
              ) : (
                <p>Form RSVP sedang dinonaktifkan sementara.</p>
              )}
            </div>
            <div className="mt-6 border-t border-[rgba(200,125,135,0.18)] pt-5">
              <WishesList rsvp={rsvp} theme={theme} />
            </div>
          </section>
        </div>

        <section className={`rounded-[2.1rem] p-6 text-center sm:p-8 ${theme.surface}`}>
          <p className="text-xs uppercase tracking-[0.3em] text-[#b17b83]/85">{closing.title}</p>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-8 text-[#7f6a70]">{closing.note}</p>
        </section>
      </section>
    </div>
  );
}
