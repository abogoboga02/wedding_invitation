import Image from "next/image";

import { normalizeTemplateConfig } from "@/features/invitation/form/config";
import { formatEventDateTime, getCountdownParts } from "@/lib/utils/date";

import type { TemplateComponentProps } from "../types";
import { MusicPlayerCard, WeddingGiftBlock, WishesList } from "../shared/TemplateBlocks";

const koreanSoftThemes = {
  "soft-rose": {
    shell:
      "border-[#e8d8cc] bg-[linear-gradient(180deg,#fcf6ef_0%,#f7efe5_48%,#fbf8f3_100%)] text-[#5d4138]",
    surface: "border border-[#e4d3c3] bg-[rgba(255,250,244,0.92)]",
    card: "border border-[#ebddd1] bg-[#fffaf5]",
    richSurface:
      "border border-[#71483a] bg-[linear-gradient(180deg,#5c372c_0%,#43231d_100%)] text-[#f8ead8]",
    richCard: "border border-[rgba(255,241,223,0.16)] bg-[rgba(255,248,240,0.08)]",
    accent: "text-[#8d5a43]",
    muted: "text-[#87695d]",
    line: "border-[#d7c0b1]",
    chip: "bg-[#f2e3d6] text-[#7d4c3b]",
    ornament: "text-[#b78a70]",
    glow:
      "bg-[radial-gradient(circle_at_top,rgba(199,154,123,0.18),transparent_48%),radial-gradient(circle_at_bottom_right,rgba(140,95,69,0.1),transparent_34%)]",
  },
  "peach-cream": {
    shell:
      "border-[#ead8c8] bg-[linear-gradient(180deg,#fff7f0_0%,#f8efe6_50%,#fbf7f1_100%)] text-[#62473d]",
    surface: "border border-[#e5d3c2] bg-[rgba(255,251,246,0.92)]",
    card: "border border-[#efdfd0] bg-[#fffaf4]",
    richSurface:
      "border border-[#825747] bg-[linear-gradient(180deg,#6a4131_0%,#4a2b22_100%)] text-[#faecd8]",
    richCard: "border border-[rgba(255,239,218,0.18)] bg-[rgba(255,247,236,0.08)]",
    accent: "text-[#9a664c]",
    muted: "text-[#8d6c60]",
    line: "border-[#dcc3b2]",
    chip: "bg-[#f5e4d6] text-[#85533f]",
    ornament: "text-[#c18f73]",
    glow:
      "bg-[radial-gradient(circle_at_top,rgba(209,150,113,0.2),transparent_48%),radial-gradient(circle_at_bottom_left,rgba(167,117,89,0.12),transparent_34%)]",
  },
  "ivory-blush": {
    shell:
      "border-[#eadfd6] bg-[linear-gradient(180deg,#fffaf5_0%,#f6efe7_48%,#fcfaf7_100%)] text-[#584039]",
    surface: "border border-[#e7d9ce] bg-[rgba(255,252,248,0.94)]",
    card: "border border-[#efe4db] bg-[#fffdf8]",
    richSurface:
      "border border-[#6c4a3d] bg-[linear-gradient(180deg,#56362b_0%,#3d231d_100%)] text-[#f9edde]",
    richCard: "border border-[rgba(255,242,226,0.18)] bg-[rgba(255,248,240,0.1)]",
    accent: "text-[#8c614f]",
    muted: "text-[#7d665d]",
    line: "border-[#d9cabc]",
    chip: "bg-[#f3e8df] text-[#795546]",
    ornament: "text-[#b88f79]",
    glow:
      "bg-[radial-gradient(circle_at_top,rgba(198,153,123,0.16),transparent_48%),radial-gradient(circle_at_bottom_right,rgba(150,110,92,0.12),transparent_32%)]",
  },
} as const;

const floralOverlays = {
  "blush-petal":
    "bg-[radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.52),transparent_16%),radial-gradient(circle_at_78%_24%,rgba(227,192,166,0.3),transparent_18%),radial-gradient(circle_at_22%_78%,rgba(227,192,166,0.22),transparent_16%),radial-gradient(circle_at_82%_74%,rgba(255,255,255,0.48),transparent_18%)]",
  "wild-bloom":
    "bg-[radial-gradient(circle_at_16%_18%,rgba(196,146,115,0.18),transparent_18%),radial-gradient(circle_at_84%_18%,rgba(255,255,255,0.5),transparent_20%),radial-gradient(circle_at_20%_82%,rgba(255,255,255,0.42),transparent_18%),radial-gradient(circle_at_82%_78%,rgba(188,136,104,0.2),transparent_20%)]",
  "minimal-bud":
    "bg-[radial-gradient(circle_at_24%_24%,rgba(255,255,255,0.45),transparent_14%),radial-gradient(circle_at_78%_72%,rgba(214,181,157,0.2),transparent_18%)]",
} as const;

const frameStyles = {
  rounded:
    "rounded-[2.4rem] border border-white/80 shadow-[0_24px_70px_rgba(96,65,49,0.16)]",
  "soft-outline":
    "rounded-[2.4rem] border-2 border-[rgba(255,255,255,0.88)] shadow-[0_24px_70px_rgba(96,65,49,0.14)]",
  "floating-card":
    "rounded-[2.2rem] border border-white/78 shadow-[0_24px_70px_rgba(96,65,49,0.18)] -rotate-[1.2deg]",
} as const;

function resolveSingleSearchLabel(mode: "warm" | "gentle" | "intimate") {
  if (mode === "intimate") {
    return "Dengan penuh kasih kami mengundang";
  }

  if (mode === "gentle") {
    return "Kami menantikan kehadiran";
  }

  return "Kepada tamu istimewa";
}

function OrnamentDivider({
  monogram,
  tone,
}: {
  monogram: string;
  tone: string;
}) {
  return (
    <div className={`flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.42em] ${tone}`}>
      <span className="h-px w-12 bg-current/40" />
      <span className="rounded-full border border-current/35 px-3 py-1 leading-none">{monogram}</span>
      <span className="h-px w-12 bg-current/40" />
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  tone,
  titleClassName = "text-[#5a3d34]",
}: {
  eyebrow: string;
  title: string;
  tone: string;
  titleClassName?: string;
}) {
  return (
    <div className="text-center">
      <p className={`text-[11px] uppercase tracking-[0.34em] ${tone}`}>{eyebrow}</p>
      <h2 className={`mt-3 font-serif-display text-3xl sm:text-4xl ${titleClassName}`}>{title}</h2>
    </div>
  );
}

type CardVisual = {
  src: string;
  alt: string;
} | null;

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
  const countdownParts = getCountdownParts(countdown.startsAt);
  const primaryEventSchedule = eventDetails.primaryEvent
    ? formatEventDateTime(eventDetails.primaryEvent.startsAt)
    : null;
  const monogram = `${heroCouple.partnerOneName.charAt(0)}${heroCouple.partnerTwoName.charAt(0)}`.toUpperCase();

  const heroVisual: CardVisual = coverPersonal.image
    ? {
        src: coverPersonal.image.url,
        alt: coverPersonal.image.altText ?? heroCouple.displayName,
      }
    : gallery.items[0]
      ? {
          src: gallery.items[0].imageUrl,
          alt: gallery.items[0].altText ?? heroCouple.displayName,
        }
      : null;

  const coupleVisuals: CardVisual[] = [
    gallery.items[0]
      ? {
          src: gallery.items[0].imageUrl,
          alt: gallery.items[0].altText ?? profiles.partnerOne.fullName,
        }
      : heroVisual,
    gallery.items[1]
      ? {
          src: gallery.items[1].imageUrl,
          alt: gallery.items[1].altText ?? profiles.partnerTwo.fullName,
        }
      : heroVisual,
  ];

  const storyMoments = [
    {
      id: "first-meeting",
      title: "Awal Bertemu",
      narrative: config.loveStory.firstMeeting.trim(),
    },
    {
      id: "proposal",
      title: "Lamaran",
      narrative: config.loveStory.proposal.trim(),
    },
    {
      id: "wedding-day",
      title: "Hari Bahagia",
      narrative: config.loveStory.wedding.trim(),
    },
  ].filter((item) => item.narrative);

  const resolvedStoryMoments =
    storyMoments.length > 0
      ? storyMoments
      : [
          {
            id: "story-fallback",
            title: loveStory.title,
            narrative: loveStory.narrative,
          },
        ];

  return (
    <div
      className={`relative overflow-hidden rounded-[2.8rem] border shadow-[0_34px_110px_rgba(99,67,51,0.14)] ${theme.shell}`}
    >
      <div className={`absolute inset-0 ${theme.glow}`} />
      <div className={`absolute inset-0 opacity-90 ${floralOverlays[config.theme.floralStyle]}`} />
      <div className="absolute inset-x-6 top-8 h-px bg-[linear-gradient(90deg,transparent,rgba(155,119,95,0.34),transparent)]" />
      <div className="absolute inset-x-6 bottom-8 h-px bg-[linear-gradient(90deg,transparent,rgba(155,119,95,0.24),transparent)]" />

      <section className="relative px-5 pb-10 pt-12 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full border ${theme.surface}`}>
            <span className="font-serif-display text-2xl tracking-[0.26em] text-[#8d5a43]">
              {monogram}
            </span>
          </div>

          <p className={`mt-6 text-[11px] uppercase tracking-[0.38em] ${theme.ornament}`}>
            {previewMode ? "Preview Dashboard" : coverPersonal.eyebrow}
          </p>
          <h1 className="mt-4 font-serif-display text-5xl leading-none text-[#5a3d34] sm:text-6xl">
            {heroCouple.partnerOneName}
          </h1>
          <p className={`mt-2 text-sm uppercase tracking-[0.5em] ${theme.ornament}`}>&amp;</p>
          <h2 className="mt-2 font-serif-display text-5xl leading-none text-[#5a3d34] sm:text-6xl">
            {heroCouple.partnerTwoName}
          </h2>
          <p className={`mx-auto mt-5 max-w-2xl text-sm leading-8 sm:text-base ${theme.muted}`}>
            {coverPersonal.title}
          </p>

          {primaryEventSchedule ? (
            <div className="mt-6">
              <OrnamentDivider monogram={monogram} tone={theme.ornament} />
              <p className={`mt-4 text-sm uppercase tracking-[0.32em] ${theme.ornament}`}>
                {primaryEventSchedule.date}
              </p>
            </div>
          ) : null}
        </div>

        <div className="mx-auto mt-8 grid max-w-5xl gap-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="order-2 space-y-5 lg:order-1">
            <div className={`rounded-[2rem] p-6 sm:p-7 ${theme.surface}`}>
              <p className={`text-[11px] uppercase tracking-[0.32em] ${theme.ornament}`}>
                {resolveSingleSearchLabel(config.theme.greetingTone)}
              </p>
              <p className="mt-3 font-serif-display text-3xl text-[#5a3d34] sm:text-4xl">
                {coverPersonal.guestName}
              </p>
              <p className={`mt-4 text-sm leading-7 ${theme.muted}`}>{coverPersonal.subtitle}</p>
            </div>

            <div className={`rounded-[2rem] p-6 sm:p-7 ${theme.richSurface}`}>
              <p className="text-[11px] uppercase tracking-[0.32em] text-[#dfc6b0]">
                {countdown.label}
              </p>
              {countdownParts ? (
                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: "Hari", value: countdownParts.days },
                    { label: "Jam", value: countdownParts.hours },
                    { label: "Menit", value: countdownParts.minutes },
                  ].map((item) => (
                    <div key={item.label} className={`rounded-[1.5rem] px-3 py-4 ${theme.richCard}`}>
                      <p className="font-serif-display text-3xl text-[#fff6ea]">{item.value}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-[#e6d2bc]">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm leading-7 text-[#e6d2bc]">
                  Countdown akan tampil otomatis setelah jadwal utama tersedia.
                </p>
              )}
            </div>

            <MusicPlayerCard coverPersonal={coverPersonal} theme={theme} />
          </div>

          <div className="order-1 lg:order-2">
            {heroVisual ? (
              <div
                className={`relative mx-auto aspect-[4/5] max-w-md overflow-hidden bg-[#ead9cd] ${frameStyles[config.theme.frameStyle]}`}
              >
                <Image
                  src={heroVisual.src}
                  alt={heroVisual.alt}
                  fill
                  priority={!previewMode}
                  sizes="(max-width: 1024px) 100vw, 34vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(77,45,34,0.14))]" />
              </div>
            ) : (
              <div
                className={`mx-auto flex aspect-[4/5] max-w-md items-end border border-dashed border-[#d8c5b8] bg-[linear-gradient(180deg,#fffaf6,#f0e4d8)] p-7 ${frameStyles[config.theme.frameStyle]}`}
              >
                <p className={`max-w-xs text-sm leading-7 ${theme.muted}`}>
                  Foto cover akan tampil di area ini untuk membentuk ritme pembuka undangan.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-5xl space-y-5 px-5 pb-5 sm:px-8 lg:px-12">
        <div className={`rounded-[2rem] p-6 text-center sm:p-8 ${theme.richSurface}`}>
          <p className="text-[11px] uppercase tracking-[0.34em] text-[#dfc6b0]">{quote.title}</p>
          <p className="mx-auto mt-4 max-w-3xl font-serif-display text-2xl leading-9 text-[#fff4e6] sm:text-3xl">
            &ldquo;{quote.text}&rdquo;
          </p>
          {quote.source ? (
            <p className="mt-4 text-sm uppercase tracking-[0.24em] text-[#e5d5c3]">{quote.source}</p>
          ) : null}
        </div>

        <section className={`rounded-[2rem] p-6 sm:p-8 ${theme.surface}`}>
          <SectionHeading eyebrow={profiles.title} title="Calon Mempelai" tone={theme.ornament} />
          <p className={`mx-auto mt-4 max-w-3xl text-center text-sm leading-7 ${theme.muted}`}>
            {profiles.intro}
          </p>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {[
              { profile: profiles.partnerOne, visual: coupleVisuals[0] },
              { profile: profiles.partnerTwo, visual: coupleVisuals[1] },
            ].map(({ profile, visual }, index) => (
              <article key={profile.fullName} className={`overflow-hidden rounded-[1.8rem] ${theme.card}`}>
                {visual ? (
                  <div className="relative aspect-[5/6]">
                    <Image
                      src={visual.src}
                      alt={visual.alt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 24vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0),rgba(52,30,24,0.16))]" />
                  </div>
                ) : null}

                <div className="p-5 sm:p-6">
                  <span className={`inline-flex rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.26em] ${theme.chip}`}>
                    {index === 0 ? "Mempelai" : "Pasangan"}
                  </span>
                  <h3 className="mt-4 font-serif-display text-3xl text-[#5a3d34]">
                    {profile.fullName}
                  </h3>
                  {profile.nickname ? (
                    <p className={`mt-2 text-xs uppercase tracking-[0.28em] ${theme.ornament}`}>
                      Dipanggil {profile.nickname}
                    </p>
                  ) : null}
                  <p className={`mt-4 text-sm leading-7 ${theme.muted}`}>{profile.bio}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={`rounded-[2rem] p-6 sm:p-8 ${theme.surface}`}>
          <SectionHeading eyebrow={gallery.title} title="Galeri Pilihan" tone={theme.ornament} />
          <p className={`mx-auto mt-4 max-w-3xl text-center text-sm leading-7 ${theme.muted}`}>
            {gallery.intro}
          </p>

          <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            {gallery.items.length > 0 ? (
              gallery.items.map((image, index) => (
                <div
                  key={image.id}
                  className={`relative overflow-hidden rounded-[1.4rem] ${
                    index % 5 === 0 ? "aspect-[4/5]" : "aspect-square"
                  }`}
                >
                  <Image
                    src={image.imageUrl}
                    alt={image.altText ?? heroCouple.displayName}
                    fill
                    sizes="(max-width: 768px) 33vw, 18vw"
                    className="object-cover"
                  />
                </div>
              ))
            ) : (
              <div className={`col-span-full rounded-[1.6rem] p-5 text-sm leading-7 ${theme.card} ${theme.muted}`}>
                Galeri foto belum ditambahkan. Template tetap dirender penuh agar ritme visualnya
                bisa ditinjau lebih awal.
              </div>
            )}
          </div>
        </section>

        <section className={`rounded-[2rem] p-6 sm:p-8 ${theme.surface}`}>
          <SectionHeading eyebrow={eventDetails.title} title="Waktu & Tempat" tone={theme.ornament} />
          <p className={`mx-auto mt-4 max-w-3xl text-center text-sm leading-7 ${theme.muted}`}>
            {eventDetails.intro}
          </p>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {eventDetails.events.length > 0 ? (
              eventDetails.events.map((event, index) => {
                const schedule = formatEventDateTime(event.startsAt);
                const locationUrl = event.googleMapsUrl ?? event.mapsUrl;

                return (
                  <article key={event.id} className={`rounded-[1.8rem] p-5 sm:p-6 ${theme.card}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-full ${theme.chip}`}>
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div className="text-right">
                        <p className={`text-[11px] uppercase tracking-[0.26em] ${theme.ornament}`}>
                          {schedule.date}
                        </p>
                        <p className="mt-2 font-semibold text-[#5a3d34]">{schedule.time}</p>
                      </div>
                    </div>

                    <h3 className="mt-5 font-serif-display text-3xl text-[#5a3d34]">{event.label}</h3>
                    <p className="mt-3 text-base font-medium text-[#6a4a3e]">{event.venueName}</p>
                    <p className={`mt-3 text-sm leading-7 ${theme.muted}`}>{event.address}</p>

                    <div className="mt-5">
                      {locationUrl ? (
                        <a
                          href={locationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex rounded-full bg-[#5a362b] px-4 py-2.5 text-sm font-semibold text-white"
                        >
                          {eventDetails.locationCtaLabel}
                        </a>
                      ) : (
                        <p className={`text-sm ${theme.muted}`}>Tautan lokasi akan muncul otomatis.</p>
                      )}
                    </div>
                  </article>
                );
              })
            ) : (
              <div className={`rounded-[1.6rem] p-5 text-sm leading-7 ${theme.card} ${theme.muted}`}>
                Detail acara akan muncul di sini setelah jadwal utama undangan dilengkapi.
              </div>
            )}
          </div>
        </section>

        <section className={`rounded-[2rem] p-6 sm:p-8 ${theme.surface}`}>
          <SectionHeading eyebrow={loveStory.title} title="Cerita Kami" tone={theme.ornament} />
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {resolvedStoryMoments.map((item, index) => (
              <article key={item.id} className={`rounded-[1.8rem] p-5 sm:p-6 ${theme.card}`}>
                <span className={`inline-flex rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.24em] ${theme.chip}`}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-serif-display text-2xl text-[#5a3d34]">{item.title}</h3>
                <p className={`mt-4 text-sm leading-7 ${theme.muted}`}>{item.narrative}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <section className={`rounded-[2rem] p-6 sm:p-8 ${theme.richSurface}`}>
          <SectionHeading
            eyebrow={weddingGift.title}
            title="Wedding Gift"
            tone="text-[#dfc6b0]"
            titleClassName="text-[#fff4e6]"
          />
            <p className="mx-auto mt-4 max-w-3xl text-center text-sm leading-7 text-[#ecdac8]">
              {weddingGift.intro}
            </p>
            <div className="mt-6">
              <WeddingGiftBlock weddingGift={weddingGift} theme={theme} />
            </div>
          </section>

          <section className={`rounded-[2rem] p-6 sm:p-8 ${theme.surface}`}>
          <SectionHeading eyebrow={closing.title} title="Penutup" tone={theme.ornament} />
            <p className={`mx-auto mt-4 max-w-3xl text-center text-sm leading-8 ${theme.muted}`}>
              {closing.note}
            </p>
          </section>
        </div>

        <section className={`rounded-[2rem] p-6 sm:p-8 ${theme.richSurface}`}>
          <SectionHeading
            eyebrow={rsvp.title}
            title="Ucapan & RSVP"
            tone="text-[#dfc6b0]"
            titleClassName="text-[#fff4e6]"
          />
          <p className="mx-auto mt-4 max-w-3xl text-center text-sm leading-7 text-[#ecdac8]">
            {rsvp.intro}
          </p>

          <div className="mt-6 grid gap-5 lg:grid-cols-[0.98fr_1.02fr]">
            <div className={`rounded-[1.8rem] p-5 sm:p-6 ${theme.richCard}`}>
              {rsvp.enabled ? (
                rsvpSlot
              ) : (
                <p className="text-sm leading-7 text-[#ecdac8]">
                  Form RSVP sedang dinonaktifkan sementara oleh pemilik undangan.
                </p>
              )}
            </div>

            <div className={`rounded-[1.8rem] p-5 sm:p-6 ${theme.richCard}`}>
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#dfc6b0]">
                Ucapan Tamu
              </p>
              <div className="mt-4 text-sm leading-7 text-[#f6ead9]">
                <WishesList rsvp={rsvp} theme={theme} />
              </div>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}
