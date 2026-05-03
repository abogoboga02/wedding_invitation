import Image from "next/image";

import { normalizeTemplateConfig } from "@/features/invitation/form/config";

import type { TemplateComponentProps } from "../types";
import {
  CountdownBlock,
  CoupleProfiles,
  EventDetailCards,
  GalleryGrid,
  LoveStoryMoments,
  MusicPlayerCard,
  WeddingGiftBlock,
  WishesList,
} from "../shared/TemplateBlocks";
import { VideoSection } from "../shared/TemplateBlocks";

const theme = {
  shell: "bg-[#1a1410] text-[#e8d7c6]",
  surface: "border border-[#8b6f47] bg-[rgba(20,18,15,0.85)]",
  card: "border border-[#8b6f47] bg-[rgba(28,25,20,0.9)]",
  accent: "text-[#d4a574]",
  muted: "text-[#c9b8a8]/75",
  primary: "#d4a574",
  primaryLight: "#e8d7c6",
};

function GoldDivider() {
  return (
    <div className="mx-auto h-px w-32 bg-gradient-to-r from-transparent via-[#d4a574] to-transparent" />
  );
}

function RoyalSeparator() {
  return (
    <div className="flex items-center justify-center gap-4">
      <div className="h-px flex-grow bg-gradient-to-r from-transparent to-[#8b6f47]" />
      <div className="flex gap-2">
        <div className="h-2 w-2 rounded-full bg-[#d4a574]" />
        <div className="h-2 w-2 rounded-full bg-[#8b6f47]" />
        <div className="h-2 w-2 rounded-full bg-[#d4a574]" />
      </div>
      <div className="h-px flex-grow bg-gradient-to-l from-transparent to-[#8b6f47]" />
    </div>
  );
}

export function RoyalMomentsTemplate({
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
  
  const config = normalizeTemplateConfig("ELEGANT_LUXURY", invitation.meta.templateConfig);
  const monogram =
    config.theme.monogram.trim() ||
    `${heroCouple.partnerOneName.charAt(0).toUpperCase()}${heroCouple.partnerTwoName.charAt(0).toUpperCase()}`;

  return (
    <div
      className={`overflow-hidden rounded-[2.2rem] border border-[#6b4e1f] shadow-[0_50px_120px_rgba(0,0,0,0.5)] ${theme.shell}`}
    >
      {/* HERO SECTION */}
      <section className="relative isolate overflow-hidden px-6 py-14 sm:px-10 lg:px-16 lg:py-20">
        <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_top,rgba(212,165,116,0.12),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_50%)]" />
        {coverPersonal.image ? (
          <div className="absolute inset-0 -z-40 opacity-[0.12]">
            <Image
              src={coverPersonal.image.url}
              alt={coverPersonal.image.altText ?? heroCouple.displayName}
              fill
              priority={!previewMode}
              sizes="100vw"
              className="object-cover"
            />
          </div>
        ) : null}

        <div className="mx-auto max-w-4xl text-center">
          {/* Monogram */}
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#d4a574] bg-[rgba(20,18,15,0.7)] text-2xl font-semibold tracking-[0.4em] text-[#e8d7c6] shadow-lg">
            {monogram}
          </div>

          <GoldDivider />

          <p className="mt-6 text-xs uppercase tracking-[0.45em] text-[#c9b8a8]/80">
            {previewMode ? "Preview Formal" : coverPersonal.eyebrow}
          </p>

          {/* Partner Names - Large & Elegant */}
          <h1 className="mt-8 font-serif text-6xl font-light leading-none sm:text-7xl lg:text-8xl text-[#e8d7c6]">
            {heroCouple.partnerOneName}
          </h1>
          <p className="mt-4 text-2xl uppercase tracking-[0.5em] text-[#d4a574] font-light">&</p>
          <h2 className="mt-4 font-serif text-6xl font-light leading-none sm:text-7xl lg:text-8xl text-[#e8d7c6]">
            {heroCouple.partnerTwoName}
          </h2>

          {/* Subtitle */}
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-[#c9b8a8]/85 sm:text-xl font-light">
            {coverPersonal.title}
          </p>

          {/* Guest Greeting Card */}
          <div
            className={`mx-auto mt-12 max-w-2xl rounded-[2rem] p-8 text-center sm:p-10 backdrop-blur-sm ${theme.surface}`}
          >
            <p className="text-xs uppercase tracking-[0.4em] text-[#c9b8a8]/70">
              Kepada Yth.
            </p>
            <p className="mt-5 text-4xl font-light text-[#e8d7c6] sm:text-5xl font-serif">
              {coverPersonal.guestName}
            </p>
            <RoyalSeparator />
            <p className="mt-6 text-base leading-8 text-[#c9b8a8]/80 font-light">
              {config.theme.formalIntroQuote}
            </p>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="mx-auto max-w-6xl space-y-8 px-6 pb-8 sm:px-10 lg:px-16 lg:pb-16">
        {/* Countdown & Overview */}
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <CountdownBlock countdown={countdown} theme={theme} />

          <section
            className={`rounded-[1.8rem] p-8 text-center backdrop-blur-sm ${theme.surface}`}
          >
            <GoldDivider />
            <p className="mt-6 text-xs uppercase tracking-[0.4em] text-[#c9b8a8]/70">
              {heroCouple.eyebrow}
            </p>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-[#c9b8a8]/80 font-light">
              {heroCouple.summary}
            </p>
          </section>
        </div>

        {/* Quote & Music */}
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <section
            className={`rounded-[1.8rem] p-8 text-center backdrop-blur-sm ${theme.surface}`}
          >
            <GoldDivider />
            <p className="mt-6 text-xs uppercase tracking-[0.4em] text-[#c9b8a8]/70">
              {quote.title}
            </p>
            <p className="mx-auto mt-6 max-w-3xl font-serif text-3xl leading-10 text-[#e8d7c6] font-light">
              "{quote.text}"
            </p>
            {quote.source ? (
              <p className="mt-5 text-sm font-light text-[#c9b8a8]/70">— {quote.source}</p>
            ) : null}
          </section>

          <MusicPlayerCard coverPersonal={coverPersonal} theme={theme} />
        </div>

        {/* Couple Profiles */}
        <section className={`rounded-[1.8rem] p-8 backdrop-blur-sm ${theme.surface}`}>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-[#c9b8a8]/70">
              {profiles.title}
            </p>
            <p className="mx-auto mt-5 max-w-3xl text-sm leading-8 text-[#c9b8a8]/80 font-light">
              {profiles.intro}
            </p>
          </div>
          <div className="mt-8">
            <CoupleProfiles profiles={profiles} theme={theme} />
          </div>
        </section>

        {/* Event Details */}
        <section className={`rounded-[1.8rem] p-8 backdrop-blur-sm ${theme.surface}`}>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-[#c9b8a8]/70">
              {eventDetails.title}
            </p>
            <p className="mx-auto mt-5 max-w-3xl text-sm leading-8 text-[#c9b8a8]/80 font-light">
              {eventDetails.intro}
            </p>
          </div>
          <div className="mt-8">
            <EventDetailCards eventDetails={eventDetails} theme={theme} />
          </div>
        </section>

        {/* Gallery & Love Story */}
        <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr]">
          <section className={`rounded-[1.8rem] p-8 backdrop-blur-sm ${theme.surface}`}>
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.4em] text-[#c9b8a8]/70">
                {gallery.title}
              </p>
              <p className="mx-auto mt-5 max-w-3xl text-sm leading-8 text-[#c9b8a8]/80 font-light">
                {gallery.intro}
              </p>
            </div>
            <div className="mt-8">
              <GalleryGrid gallery={gallery} couple={heroCouple} theme={theme} />
            </div>
          </section>

          <section className={`rounded-[1.8rem] p-8 backdrop-blur-sm ${theme.surface}`}>
            <div className="text-center">
              <GoldDivider />
              <p className="mt-6 text-xs uppercase tracking-[0.4em] text-[#c9b8a8]/70">
                {loveStory.title}
              </p>
            </div>
            <div className="mx-auto mt-6 max-w-3xl text-left">
              <LoveStoryMoments loveStory={loveStory} theme={theme} />
            </div>
            <p className="mt-6 text-center text-xs uppercase tracking-[0.32em] text-[#c9b8a8]/60">
              {config.theme.dresscode}
            </p>
          </section>
        </div>

        {/* Video Section */}
        {coverPersonal.video && (
          <section className={`rounded-[1.8rem] p-8 backdrop-blur-sm ${theme.surface}`}>
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.4em] text-[#c9b8a8]/70">
                Our Moments
              </p>
              <p className="mx-auto mt-4 max-w-3xl text-sm leading-8 text-[#c9b8a8]/80 font-light">
                Watch our beautiful journey together
              </p>
            </div>
            <div className="mt-8">
              <div className="relative aspect-video overflow-hidden rounded-[1.5rem] border border-[#8b6f47]">
                <video
                  controls
                  className="h-full w-full object-cover"
                  poster={coverPersonal.image?.url}
                >
                  <source src={coverPersonal.video.url} type={coverPersonal.video.mimeType} />
                  Browser Anda belum mendukung video player.
                </video>
              </div>
            </div>
          </section>
        )}

        {/* Wedding Gift & RSVP */}
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
          <section className={`rounded-[1.8rem] p-8 backdrop-blur-sm ${theme.surface}`}>
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.4em] text-[#c9b8a8]/70">
                {weddingGift.title}
              </p>
              <p className="mx-auto mt-5 max-w-3xl text-sm leading-8 text-[#c9b8a8]/80 font-light">
                {weddingGift.intro}
              </p>
            </div>
            <div className="mt-8">
              <WeddingGiftBlock weddingGift={weddingGift} theme={theme} />
            </div>
          </section>

          <section className={`rounded-[1.8rem] p-8 backdrop-blur-sm ${theme.surface}`}>
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.4em] text-[#c9b8a8]/70">
                {rsvp.title}
              </p>
              <p className="mx-auto mt-5 max-w-3xl text-sm leading-8 text-[#c9b8a8]/80 font-light">
                {rsvp.intro}
              </p>
            </div>
            <div className="mt-8 text-sm leading-7 text-[#c9b8a8]/80">
              {rsvp.enabled ? (
                rsvpSlot
              ) : (
                <p className="text-center font-light">
                  Form RSVP sedang dinonaktifkan oleh pemilik invitation.
                </p>
              )}
            </div>
            <div className="mt-8 border-t border-[#8b6f47] pt-8">
              <WishesList rsvp={rsvp} theme={theme} />
            </div>
          </section>
        </div>

        {/* Closing */}
        <section className={`rounded-[1.8rem] p-8 text-center backdrop-blur-sm ${theme.surface}`}>
          <GoldDivider />
          <p className="mt-6 text-xs uppercase tracking-[0.4em] text-[#c9b8a8]/70">
            {closing.title}
          </p>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-[#e8d7c6] font-light">
            {closing.note}
          </p>
        </section>
      </section>
    </div>
  );
}
