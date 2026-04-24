import Image from "next/image";
import Link from "next/link";

import { formatEventDateTime, formatWishDate, getCountdownParts } from "@/lib/utils/date";

import type { SharedInvitationTemplateData } from "../contract";

type ThemeClasses = {
  surface: string;
  card: string;
  accent: string;
  muted: string;
};

type CountdownBlockProps = {
  countdown: SharedInvitationTemplateData["sections"]["countdown"];
  theme: ThemeClasses;
};

export function CountdownBlock({ countdown, theme }: CountdownBlockProps) {
  const countdownParts = getCountdownParts(countdown.startsAt);

  return (
    <section className={`rounded-[1.8rem] p-5 sm:p-6 ${theme.surface}`}>
      <p className={`text-xs uppercase tracking-[0.28em] ${theme.muted}`}>{countdown.label}</p>
      {countdownParts ? (
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          {[
            { label: "Hari", value: countdownParts.days },
            { label: "Jam", value: countdownParts.hours },
            { label: "Menit", value: countdownParts.minutes },
          ].map((item) => (
            <div key={item.label} className={`rounded-[1.35rem] px-3 py-4 ${theme.card}`}>
              <p className="text-2xl font-semibold sm:text-3xl">{item.value}</p>
              <p className={`mt-1 text-[11px] uppercase tracking-[0.2em] ${theme.muted}`}>
                {item.label}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className={`mt-4 text-sm leading-7 ${theme.muted}`}>
          Countdown akan otomatis aktif setelah jadwal utama undangan tersedia.
        </p>
      )}
    </section>
  );
}

type CoupleProfilesProps = {
  profiles: SharedInvitationTemplateData["sections"]["profiles"];
  theme: ThemeClasses;
};

export function CoupleProfiles({ profiles, theme }: CoupleProfilesProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {[profiles.partnerOne, profiles.partnerTwo].map((profile) => (
        <article key={profile.fullName} className={`rounded-[1.6rem] p-5 sm:p-6 ${theme.card}`}>
          <p className={`text-xs uppercase tracking-[0.24em] ${theme.muted}`}>
            {profile.nickname ? `Dipanggil ${profile.nickname}` : "Mempelai"}
          </p>
          <h3 className="mt-3 text-2xl font-semibold">{profile.fullName}</h3>
          <p className={`mt-4 text-sm leading-7 ${theme.muted}`}>{profile.bio}</p>
        </article>
      ))}
    </div>
  );
}

type EventDetailCardsProps = {
  eventDetails: SharedInvitationTemplateData["sections"]["eventDetails"];
  theme: ThemeClasses;
  ctaLabel?: string;
};

export function EventDetailCards({
  eventDetails,
  theme,
  ctaLabel,
}: EventDetailCardsProps) {
  const resolvedCtaLabel = ctaLabel ?? eventDetails.locationCtaLabel ?? "Buka Lokasi";

  if (eventDetails.events.length === 0) {
    return (
      <div className={`rounded-[1.6rem] p-5 text-sm leading-7 ${theme.card} ${theme.muted}`}>
        Detail acara akan tampil di sini setelah jadwal utama invitation dilengkapi.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {eventDetails.events.map((event) => {
        const schedule = formatEventDateTime(event.startsAt);
        const locationUrl = event.googleMapsUrl ?? event.mapsUrl;

        return (
          <article key={event.id} className={`rounded-[1.6rem] p-5 sm:p-6 ${theme.card}`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className={`text-xs uppercase tracking-[0.24em] ${theme.muted}`}>Acara</p>
                <h3 className="mt-2 text-xl font-semibold">{event.label}</h3>
              </div>
              <div className="sm:text-right">
                <p className={`text-sm font-semibold ${theme.accent}`}>{schedule.time}</p>
                <p className={`mt-1 text-sm ${theme.muted}`}>{schedule.date}</p>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <p className="text-base font-medium">{event.venueName}</p>
              <p className={`text-sm leading-7 ${theme.muted}`}>{event.address}</p>
              {locationUrl ? (
                <Link
                  href={locationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex text-sm font-semibold ${theme.accent}`}
                >
                  {resolvedCtaLabel}
                </Link>
              ) : (
                <p className={`text-sm ${theme.muted}`}>Tautan lokasi akan muncul otomatis.</p>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

type GalleryGridProps = {
  gallery: SharedInvitationTemplateData["sections"]["gallery"];
  couple: SharedInvitationTemplateData["sections"]["heroCouple"];
  theme: ThemeClasses;
};

export function GalleryGrid({ gallery, couple, theme }: GalleryGridProps) {
  if (gallery.items.length === 0) {
    return (
      <div className={`rounded-[1.6rem] p-5 text-sm leading-7 ${theme.card} ${theme.muted}`}>
        Galeri foto belum ditambahkan. Template tetap dirender penuh agar ritme konten bisa ditinjau
        lebih awal.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {gallery.items.map((image) => (
        <div key={image.id} className="relative aspect-[4/5] overflow-hidden rounded-[1.7rem]">
          <Image
            src={image.imageUrl}
            alt={image.altText ?? `${couple.partnerOneName} dan ${couple.partnerTwoName}`}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}

type WeddingGiftBlockProps = {
  weddingGift: SharedInvitationTemplateData["sections"]["weddingGift"];
  theme: ThemeClasses;
};

export function WeddingGiftBlock({ weddingGift, theme }: WeddingGiftBlockProps) {
  if (!weddingGift.enabled) {
    return (
      <div className={`rounded-[1.6rem] p-5 text-sm leading-7 ${theme.card} ${theme.muted}`}>
        Section wedding gift sedang tidak ditampilkan oleh pemilik undangan.
      </div>
    );
  }

  if (weddingGift.entries.length === 0) {
    return (
      <div className={`rounded-[1.6rem] p-5 text-sm leading-7 ${theme.card} ${theme.muted}`}>
        Wedding gift sudah diaktifkan, tetapi detail channel belum diisi.
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {weddingGift.entries.map((entry) => (
        <article key={`${entry.type}-${entry.label}-${entry.accountNumber}`} className={`rounded-[1.6rem] p-5 sm:p-6 ${theme.card}`}>
          <p className={`text-xs uppercase tracking-[0.24em] ${theme.muted}`}>{entry.type}</p>
          <h3 className="mt-3 text-xl font-semibold">{entry.label}</h3>
          <p className={`mt-3 text-sm leading-7 ${theme.muted}`}>{entry.accountName}</p>
          <p className="mt-1 text-lg font-semibold">{entry.accountNumber}</p>
          {entry.note ? (
            <p className={`mt-4 text-sm leading-7 ${theme.muted}`}>{entry.note}</p>
          ) : null}
        </article>
      ))}
    </div>
  );
}

type WishesListProps = {
  rsvp: SharedInvitationTemplateData["sections"]["rsvp"];
  theme: ThemeClasses;
};

export function WishesList({ rsvp, theme }: WishesListProps) {
  if (!rsvp.wishEnabled) {
    return (
      <p className={`text-sm leading-7 ${theme.muted}`}>
        Fitur ucapan sedang dinonaktifkan oleh pemilik invitation.
      </p>
    );
  }

  return rsvp.wishes.length > 0 ? (
    <div className="space-y-3">
      {rsvp.wishes.map((wish) => (
        <article key={wish.id} className={`rounded-[1.4rem] p-4 ${theme.card}`}>
          <div className="flex items-center justify-between gap-3">
            <p className="font-semibold">{wish.guestName}</p>
            <span className={`text-xs ${theme.muted}`}>{formatWishDate(wish.createdAt)}</span>
          </div>
          <p className={`mt-3 text-sm leading-7 ${theme.muted}`}>{wish.message}</p>
        </article>
      ))}
    </div>
  ) : (
    <p className={`text-sm leading-7 ${theme.muted}`}>
      Ucapan tamu akan tampil di sini setelah ada pesan yang masuk.
    </p>
  );
}

type MusicPlayerCardProps = {
  coverPersonal: SharedInvitationTemplateData["sections"]["coverPersonal"];
  theme: ThemeClasses;
};

export function MusicPlayerCard({ coverPersonal, theme }: MusicPlayerCardProps) {
  if (!coverPersonal.music) {
    return null;
  }

  return (
    <section className={`rounded-[1.8rem] p-5 sm:p-6 ${theme.surface}`}>
      <p className={`text-xs uppercase tracking-[0.28em] ${theme.muted}`}>Lagu Pembuka</p>
      <p className="mt-3 text-base font-medium">
        {coverPersonal.music.originalName ?? "Audio Undangan"}
      </p>
      <audio className="mt-4 w-full" controls preload="none">
        <source src={coverPersonal.music.url} type={coverPersonal.music.mimeType ?? undefined} />
        Browser Anda belum mendukung audio player.
      </audio>
    </section>
  );
}
