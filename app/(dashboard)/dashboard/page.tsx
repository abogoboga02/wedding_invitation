import Link from "next/link";

import { getPublicInvitationPath } from "@/features/invitation/public-invitation.service";
import {
  getDashboardInvitationOverview,
  getDashboardSendSummary,
  validateInvitationPublishability,
} from "@/features/invitation/invitation.service";
import { requireClientUser } from "@/lib/auth/guards";
import { formatAdminDateTime } from "@/lib/utils/date";

import { DashboardPageHeader } from "./_components/DashboardPageHeader";
import { DashboardSectionCard } from "./_components/DashboardSectionCard";
import { DashboardStatCard } from "./_components/DashboardStatCard";

type StatusTone = "success" | "pending" | "neutral" | "danger";
type DashboardNotification = {
  id: string;
  title: string;
  body: string;
  tone: "success" | "pending" | "neutral";
};

function isMeaningfulPartnerName(value: string) {
  const normalizedValue = value.trim().toLowerCase();
  return Boolean(normalizedValue) && normalizedValue !== "pengantin" && normalizedValue !== "pasangan";
}

function isFiniteCoordinate(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value);
}

function StatusPill({ label, tone }: { label: string; tone: StatusTone }) {
  const classes =
    tone === "success"
      ? "bg-[rgba(79,123,98,0.12)] text-[var(--color-success)]"
      : tone === "pending"
        ? "bg-[rgba(192,138,92,0.12)] text-[color:#8a5a2c]"
        : tone === "danger"
          ? "bg-[rgba(181,87,99,0.12)] text-[var(--color-error)]"
          : "bg-[rgba(70,70,70,0.08)] text-[var(--color-text-secondary)]";

  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${classes}`}>{label}</span>;
}

export default async function DashboardPage() {
  const user = await requireClientUser();
  const invitation = await getDashboardInvitationOverview(user.id);

  if (!invitation) {
    return null;
  }

  const publishValidation = validateInvitationPublishability({
    ...invitation,
    guestCount: invitation.guestCount,
  });
  const guestCount = invitation.guestCount;
  const rsvpCount = invitation.rsvpCount;
  const attendingCount = invitation.attendingCount;
  const declinedCount = invitation.declinedCount;
  const pendingRsvpCount = guestCount - rsvpCount;
  const sendSummary = await getDashboardSendSummary(invitation.id, guestCount);
  const primaryEvent = invitation.eventSlots[0];
  const publicPath = getPublicInvitationPath(invitation.coupleSlug, invitation.sampleGuestSlug);

  const setupChecklist = [
    {
      id: "couple",
      label: "Lengkapi data mempelai",
      description: "Nama pasangan utama sudah diisi dengan rapi.",
      href: "/dashboard/setup",
      isComplete:
        isMeaningfulPartnerName(invitation.partnerOneName) &&
        isMeaningfulPartnerName(invitation.partnerTwoName),
    },
    {
      id: "event",
      label: "Isi jadwal acara",
      description: "Minimal ada satu jadwal acara yang memiliki tanggal.",
      href: "/dashboard/setup",
      isComplete: Boolean(primaryEvent?.startsAt),
    },
    {
      id: "location",
      label: "Lengkapi lokasi utama",
      description: "Venue, alamat, dan titik peta utama sudah tersimpan.",
      href: "/dashboard/setup",
      isComplete: Boolean(
        primaryEvent?.venueName?.trim() &&
          primaryEvent?.address?.trim() &&
          isFiniteCoordinate(primaryEvent.latitude) &&
          isFiniteCoordinate(primaryEvent.longitude),
      ),
    },
    {
      id: "media",
      label: "Upload media",
      description: "Cover, galeri, atau musik pembuka sudah tersedia.",
      href: "/dashboard/media",
      isComplete: Boolean(
        invitation.coverImage || invitation.galleryImageCount > 0 || invitation.musicUrl,
      ),
    },
    {
      id: "guests",
      label: "Tambah daftar tamu",
      description: "Guest list siap dipakai untuk sapaan link tamu saat undangan dibagikan.",
      href: "/dashboard/guests",
      isComplete: guestCount > 0,
    },
    {
      id: "rsvp",
      label: "Cek pengaturan RSVP",
      description: "RSVP aktif sehingga tamu bisa langsung merespons dari undangan.",
      href: "/dashboard/settings",
      isComplete: invitation.setting?.isRsvpEnabled ?? true,
    },
  ];

  const completedSetupCount = setupChecklist.filter((item) => item.isComplete).length;
  const setupProgress = Math.round((completedSetupCount / setupChecklist.length) * 100);
  const statusSummary =
    invitation.status === "PUBLISHED"
      ? {
          label: "Published",
          tone: "success" as const,
          helper: "Link publik sudah aktif dan siap dibagikan kapan saja.",
        }
      : setupProgress <= 34
        ? {
            label: "Belum lengkap",
            tone: "danger" as const,
            helper: "Data dasar undangan masih perlu dilengkapi dulu.",
          }
        : publishValidation.isValid
          ? {
              label: "Draft",
              tone: "neutral" as const,
              helper: "Draft sudah rapi dan tinggal dipublish saat siap.",
            }
          : {
              label: "Butuh revisi",
              tone: "pending" as const,
              helper: `${publishValidation.errors.length} bagian masih perlu dirapikan sebelum publish.`,
            };

  const notifications = [
    invitation.status === "PUBLISHED"
      ? {
          id: "published",
          title: "Undangan sudah publish",
          body: invitation.publishedAt
            ? `Undangan aktif sejak ${formatAdminDateTime(invitation.publishedAt)}.`
            : "Link publik sudah aktif dan siap dibagikan.",
          tone: "success" as const,
        }
      : {
          id: "draft",
          title: "Draft tersimpan",
          body: "Perubahan Anda tetap tersimpan sambil melengkapi setup undangan.",
          tone: "neutral" as const,
        },
    !publishValidation.isValid
      ? {
          id: "incomplete",
          title: "Data belum lengkap",
          body: `${publishValidation.errors.length} syarat publish masih perlu dilengkapi.`,
          tone: "pending" as const,
        }
      : null,
    guestCount === 0
      ? {
          id: "guests",
          title: "Guest list masih kosong",
          body: "Tambahkan tamu bila Anda ingin membagikan link dengan sapaan yang lebih personal.",
          tone: "pending" as const,
        }
      : null,
    rsvpCount > 0
      ? {
          id: "rsvp",
          title: "RSVP sudah masuk",
          body: `${rsvpCount} tamu sudah merespons undangan Anda.`,
          tone: "success" as const,
        }
      : null,
    sendSummary.latestSentAt
      ? {
          id: "sent",
          title: "Undangan terakhir dikirim",
          body: `Distribusi terakhir tercatat pada ${formatAdminDateTime(sendSummary.latestSentAt)}.`,
          tone: "neutral" as const,
        }
      : null,
  ].filter((item): item is DashboardNotification => Boolean(item));

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Dashboard Client"
        title="Pantau progres setup undangan tanpa bingung langkah berikutnya"
        description="Fokus dashboard ini adalah membantu Anda melihat status undangan, progress setup, notifikasi penting, tamu, dan RSVP dari satu tempat."
        actions={
          <>
            <div className="flex items-center">
              <StatusPill label={statusSummary.label} tone={statusSummary.tone} />
            </div>
            <Link
              href="/dashboard/preview"
              className="button-secondary inline-flex rounded-full px-5 py-3 text-sm font-semibold"
            >
              Preview Cepat
            </Link>
            <Link
              href="/dashboard/setup"
              className="button-primary inline-flex rounded-full px-5 py-3 text-sm font-semibold"
            >
              Lengkapi Setup
            </Link>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          label="Status undangan"
          value={statusSummary.label}
          helper={statusSummary.helper}
        />
        <DashboardStatCard
          label="Progress setup"
          value={`${setupProgress}%`}
          helper={`${completedSetupCount}/${setupChecklist.length} bagian utama sudah lengkap.`}
        />
        <DashboardStatCard
          label="Jumlah tamu"
          value={guestCount}
          helper={`${sendSummary.sentGuests} sudah dikirim, ${sendSummary.pendingGuests} belum dikirim.`}
        />
        <DashboardStatCard
          label="RSVP"
          value={rsvpCount}
          helper={`${attendingCount} hadir, ${declinedCount} tidak hadir, ${pendingRsvpCount} belum respon.`}
        />
      </section>

      <div className="grid gap-6 2xl:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-6">
          <DashboardSectionCard
            title="Progress setup"
            description="Persentase ini dihitung dari data mempelai, acara, lokasi, media, tamu, dan RSVP agar Anda cepat tahu bagian mana yang belum selesai."
          >
            <div className="rounded-[1.5rem] bg-[var(--color-surface-alt)] p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  Kelengkapan setup
                </p>
                <p className="text-sm text-[var(--color-text-secondary)]">{setupProgress}%</p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/80">
                <div
                  className="h-full rounded-full bg-[var(--color-secondary)] transition-[width]"
                  style={{ width: `${setupProgress}%` }}
                />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {setupChecklist.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex flex-col gap-3 rounded-[1.5rem] bg-[var(--color-surface-alt)] px-4 py-4 transition hover:bg-white sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-[var(--color-text-primary)]">{item.label}</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                      {item.description}
                    </p>
                  </div>
                  <StatusPill
                    label={item.isComplete ? "Selesai" : "Perlu dilengkapi"}
                    tone={item.isComplete ? "success" : "pending"}
                  />
                </Link>
              ))}
            </div>
          </DashboardSectionCard>

          <DashboardSectionCard
            title="Notifikasi"
            description="Sinyal cepat yang membantu Anda tahu apa yang baru terjadi dan apa yang perlu diprioritaskan."
          >
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="rounded-[1.5rem] bg-[var(--color-surface-alt)] px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-[var(--color-text-primary)]">
                      {notification.title}
                    </p>
                    <StatusPill label="Info" tone={notification.tone} />
                  </div>
                  <p className="mt-2 text-sm leading-7 text-[var(--color-text-secondary)]">
                    {notification.body}
                  </p>
                </div>
              ))}
            </div>
          </DashboardSectionCard>
        </div>

        <div className="space-y-6">
          <DashboardSectionCard
            title="Preview cepat"
            description="Buka tampilan undangan dengan cepat untuk mengecek hasil akhir sebelum atau sesudah publish."
          >
            <div className="rounded-[1.5rem] bg-[var(--color-surface-alt)] px-4 py-4 text-sm leading-7 text-[var(--color-text-secondary)]">
              {invitation.status === "PUBLISHED"
                ? "Undangan Anda sudah punya link publik aktif. Anda bisa membuka preview internal atau langsung melihat halaman live."
                : "Gunakan preview internal untuk mengecek tampilan. Link publik akan aktif setelah undangan dipublish."}
            </div>
            <div className="mt-5 grid gap-3">
              <Link
                href="/dashboard/preview"
                className="button-secondary inline-flex justify-center rounded-full px-5 py-3 text-sm font-semibold"
              >
                Buka Preview Dashboard
              </Link>
              {invitation.status === "PUBLISHED" ? (
                <Link
                  href={publicPath}
                  className="button-primary inline-flex justify-center rounded-full px-5 py-3 text-sm font-semibold"
                >
                  Buka Preview Publik
                </Link>
              ) : null}
            </div>
          </DashboardSectionCard>

          <DashboardSectionCard
            title="Jumlah tamu"
            description="Lihat total tamu, yang sudah dikirim, dan yang masih belum dikirim dari satu ringkasan singkat."
          >
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Total tamu", value: guestCount },
                { label: "Sudah dikirim", value: sendSummary.sentGuests },
                { label: "Belum dikirim", value: sendSummary.pendingGuests },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.4rem] bg-[var(--color-surface-alt)] px-4 py-4"
                >
                  <p className="text-sm text-[var(--color-text-secondary)]">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </DashboardSectionCard>

          <DashboardSectionCard
            title="RSVP"
            description="Ringkasan cepat untuk membaca tamu yang hadir, tidak hadir, dan yang belum merespons."
          >
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Hadir", value: attendingCount },
                { label: "Tidak hadir", value: declinedCount },
                { label: "Belum respon", value: pendingRsvpCount },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.4rem] bg-[var(--color-surface-alt)] px-4 py-4"
                >
                  <p className="text-sm text-[var(--color-text-secondary)]">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </DashboardSectionCard>
        </div>
      </div>

      <DashboardSectionCard
        title="Aksi utama"
        description="Empat langkah yang paling sering dipakai pasangan saat menyiapkan undangan digital sampai siap dikirim."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              href: "/dashboard/setup",
              title: "Lengkapi setup",
              body: "Perbarui data pasangan, jadwal acara, lokasi, dan cerita undangan.",
            },
            {
              href: "/dashboard/media",
              title: "Upload media",
              body: "Tambahkan cover, galeri foto, dan musik pembuka supaya undangan terasa hidup.",
            },
            {
              href: "/dashboard/guests",
              title: "Tambah tamu",
              body: "Kelola guest list dan siapkan link tamu untuk distribusi yang lebih rapi.",
            },
            {
              href: "/dashboard/send",
              title: "Kirim undangan",
              body: "Bagikan link tamu yang sudah siap dan pantau distribusinya.",
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-[1.6rem] bg-[var(--color-surface-alt)] px-5 py-5 transition hover:bg-white"
            >
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-[var(--color-text-secondary)]">
                {item.body}
              </p>
            </Link>
          ))}
        </div>
      </DashboardSectionCard>
    </div>
  );
}
