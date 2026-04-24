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

const theme = {
  shell: "bg-[#090808] text-[#f2dfaa]",
  surface: "border border-[#745722] bg-[rgba(12,11,11,0.74)]",
  card: "border border-[#745722] bg-[rgba(18,16,16,0.82)]",
  accent: "text-[#e5c977]",
  muted: "text-[#d8c79a]/78",
};

function GoldDivider() {
  return <div className="mx-auto h-px w-24 bg-[linear-gradient(90deg,transparent,#b48b3a,transparent)]" />;
}

export function ElegantLuxuryTemplate({
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
      className={`overflow-hidden rounded-[2.6rem] border border-[#6b4e1f] shadow-[0_34px_110px_rgba(0,0,0,0.3)] ${theme.shell}`}
    >
      <section className="relative isolate overflow-hidden px-6 py-12 sm:px-10 lg:px-16 lg:py-18">
        <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_top,rgba(229,201,119,0.15),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_48%)]" />
        {coverPersonal.image ? (
          <div className="absolute inset-0 -z-40 opacity-[0.16]">
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
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#8c6a2d] bg-[rgba(12,11,11,0.72)] text-xl font-semibold tracking-[0.28em] text-[#efd895]">
            {monogram}
          </div>
          <GoldDivider />
          <p className="mt-5 text-xs uppercase tracking-[0.4em] text-[#cdb980]">
            {previewMode ? "Preview Formal" : coverPersonal.eyebrow}
          </p>
          <h1 className="mt-8 font-serif-display text-5xl leading-none sm:text-6xl lg:text-7xl">
            {heroCouple.partnerOneName}
          </h1>
          <p className="mt-3 text-xl uppercase tracking-[0.42em] text-[#b99549]">&</p>
          <h2 className="mt-3 font-serif-display text-5xl leading-none sm:text-6xl lg:text-7xl">
            {heroCouple.partnerTwoName}
          </h2>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-[#dacba3]/82 sm:text-lg">
            {coverPersonal.title}
          </p>

          <div className={`mx-auto mt-10 max-w-2xl rounded-[2.1rem] p-6 text-center sm:p-8 ${theme.surface}`}>
            <p className="text-xs uppercase tracking-[0.34em] text-[#cdb980]/75">Kepada Yth.</p>
            <p className="mt-4 text-3xl font-semibold sm:text-4xl">{coverPersonal.guestName}</p>
            <p className="mt-4 text-sm leading-7 text-[#dacba3]/80">
              {config.theme.formalIntroQuote}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-6 px-6 pb-6 sm:px-10 lg:px-16 lg:pb-14">
        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <CountdownBlock countdown={countdown} theme={theme} />

          <section className={`rounded-[2rem] p-6 text-center sm:p-8 ${theme.surface}`}>
            <GoldDivider />
            <p className="mt-5 text-xs uppercase tracking-[0.34em] text-[#cdb980]/75">
              {heroCouple.eyebrow}
            </p>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-[#dacba3]/82">
              {heroCouple.summary}
            </p>
          </section>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className={`rounded-[2rem] p-6 text-center sm:p-8 ${theme.surface}`}>
            <GoldDivider />
            <p className="mt-5 text-xs uppercase tracking-[0.34em] text-[#cdb980]/75">{quote.title}</p>
            <p className="mx-auto mt-5 max-w-3xl font-serif-display text-2xl leading-10 text-[#f2dfaa]">
              “{quote.text}”
            </p>
            {quote.source ? (
              <p className="mt-4 text-sm font-medium text-[#dacba3]/75">{quote.source}</p>
            ) : null}
          </section>

          <MusicPlayerCard coverPersonal={coverPersonal} theme={theme} />
        </div>

        <section className={`rounded-[2rem] p-6 sm:p-8 ${theme.surface}`}>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.34em] text-[#cdb980]/75">{profiles.title}</p>
            <p className="mx-auto mt-4 max-w-3xl text-sm leading-8 text-[#dacba3]/78">{profiles.intro}</p>
          </div>
          <div className="mt-6">
            <CoupleProfiles profiles={profiles} theme={theme} />
          </div>
        </section>

        <section className={`rounded-[2rem] p-6 sm:p-8 ${theme.surface}`}>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.34em] text-[#cdb980]/75">{eventDetails.title}</p>
            <p className="mx-auto mt-4 max-w-3xl text-sm leading-8 text-[#dacba3]/78">{eventDetails.intro}</p>
          </div>
          <div className="mt-6">
            <EventDetailCards eventDetails={eventDetails} theme={theme} />
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[0.98fr_1.02fr]">
          <section className={`rounded-[2rem] p-6 sm:p-8 ${theme.surface}`}>
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.34em] text-[#cdb980]/75">{gallery.title}</p>
              <p className="mx-auto mt-4 max-w-3xl text-sm leading-8 text-[#dacba3]/78">{gallery.intro}</p>
            </div>
            <div className="mt-6">
              <GalleryGrid gallery={gallery} couple={heroCouple} theme={theme} />
            </div>
          </section>

          <section className={`rounded-[2rem] p-6 text-center sm:p-8 ${theme.surface}`}>
            <GoldDivider />
            <p className="mt-5 text-xs uppercase tracking-[0.34em] text-[#cdb980]/75">{loveStory.title}</p>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-[#dacba3]/82">{loveStory.narrative}</p>
            <p className="mt-6 text-sm uppercase tracking-[0.32em] text-[#cdb980]/60">
              {config.theme.dresscode}
            </p>
          </section>
        </div>

        {config.theme.showFamilySection ? (
          <section className={`rounded-[2rem] p-6 text-center sm:p-8 ${theme.surface}`}>
            <GoldDivider />
            <p className="mt-5 text-xs uppercase tracking-[0.34em] text-[#cdb980]/75">
              Family Section
            </p>
            <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-[#dacba3]/82">
              Dengan restu dan kebahagiaan keluarga besar {heroCouple.partnerOneName} dan{" "}
              {heroCouple.partnerTwoName}, kami menantikan kehadiran Anda di hari istimewa kami.
            </p>
          </section>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[0.94fr_1.06fr]">
          <section className={`rounded-[2rem] p-6 sm:p-8 ${theme.surface}`}>
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.34em] text-[#cdb980]/75">{weddingGift.title}</p>
              <p className="mx-auto mt-4 max-w-3xl text-sm leading-8 text-[#dacba3]/78">{weddingGift.intro}</p>
            </div>
            <div className="mt-6">
              <WeddingGiftBlock weddingGift={weddingGift} theme={theme} />
            </div>
          </section>

          <section className={`rounded-[2rem] p-6 sm:p-8 ${theme.surface}`}>
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.34em] text-[#cdb980]/75">{rsvp.title}</p>
              <p className="mx-auto mt-4 max-w-3xl text-sm leading-8 text-[#dacba3]/78">{rsvp.intro}</p>
            </div>
            <div className="mt-6 text-sm leading-7 text-[#dacba3]/82">
              {rsvp.enabled ? (
                rsvpSlot
              ) : (
                <p>Form RSVP sedang dinonaktifkan oleh pemilik invitation.</p>
              )}
            </div>
            <div className="mt-6 border-t border-[#745722] pt-6">
              <WishesList rsvp={rsvp} theme={theme} />
            </div>
          </section>
        </div>

        <section className={`rounded-[2rem] p-6 text-center sm:p-8 ${theme.surface}`}>
          <GoldDivider />
          <p className="mt-5 text-xs uppercase tracking-[0.34em] text-[#cdb980]/75">{closing.title}</p>
          <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-[#dacba3]/82">
            {closing.note}
          </p>
        </section>
      </section>
    </div>
  );
}
