import Link from "next/link";

import { auth } from "@/auth";
import {
  getDashboardInvitationSummary,
  validateInvitationPublishability,
} from "@/features/invitation/invitation.service";
import { getPublicInvitationPath } from "@/features/invitation/public-invitation.service";

import { DashboardPageHeader } from "./_components/DashboardPageHeader";
import { InvitationStatusBadge } from "./_components/InvitationStatusBadge";
import { PublishInvitationPanel } from "./_components/PublishInvitationPanel";
import { DashboardSectionCard } from "./_components/DashboardSectionCard";
import { DashboardStatCard } from "./_components/DashboardStatCard";

export default async function DashboardPage() {
  const session = await auth();
  const invitation = await getDashboardInvitationSummary(session!.user.id);

  if (!invitation) {
    return null;
  }

  const guestCount = invitation.guests.length;
  const rsvpCount = invitation.guests.filter((guest) => guest.rsvp).length;
  const pendingRsvpCount = guestCount - rsvpCount;
  const publishValidation = validateInvitationPublishability(invitation);
  const sampleGuest = invitation.guests[0];
  const samplePublicPath = sampleGuest
    ? getPublicInvitationPath(invitation.coupleSlug, sampleGuest.guestSlug)
    : `/${invitation.coupleSlug}/slug-tamu`;

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Overview Dashboard"
        title="Ringkasan undangan, tamu, dan progres publish"
        description="Mulai dari template, lanjut ke setup detail acara, lalu undang tamu menggunakan personal link yang otomatis dibuat sistem."
        actions={
          <>
            <div className="hidden items-center sm:flex">
              <InvitationStatusBadge status={invitation.status} />
            </div>
            <Link
              href="/dashboard/setup"
              className="button-secondary inline-flex rounded-full px-5 py-3 text-sm font-semibold"
            >
              Lengkapi Setup
            </Link>
            <Link
              href="/dashboard/templates"
              className="button-primary inline-flex rounded-full px-5 py-3 text-sm font-semibold"
            >
              Pilih Template
            </Link>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          label="Status Undangan"
          value={invitation.status === "PUBLISHED" ? "Published" : "Draft"}
          helper={
            publishValidation.isValid
              ? "Semua syarat minimum publish sudah siap."
              : `${publishValidation.errors.length} syarat publish masih perlu dilengkapi.`
          }
        />
        <DashboardStatCard
          label="Template Aktif"
          value={invitation.template.replaceAll("_", " ")}
          helper="Satu invitation memakai satu template aktif."
        />
        <DashboardStatCard
          label="Jumlah Tamu"
          value={guestCount}
          helper="Guest list dapat diisi manual atau import CSV."
        />
        <DashboardStatCard
          label="RSVP Masuk"
          value={rsvpCount}
          helper={`${pendingRsvpCount} tamu belum merespons.`}
        />
      </section>

      <div className="grid gap-6 2xl:grid-cols-[1.15fr_0.85fr]">
        <DashboardSectionCard
          title="Alur yang disarankan"
          description="Urutan ini dibuat supaya user non-teknis bisa bergerak tanpa bingung memilih langkah berikutnya."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            {[
              {
                href: "/dashboard/templates",
                step: "01",
                title: "Pilih template",
                body: "Tentukan suasana visual sebelum mengisi detail lain.",
              },
              {
                href: "/dashboard/setup",
                step: "02",
                title: "Lengkapi setup undangan",
                body: "Isi nama pasangan, jadwal acara, lokasi, dan cerita singkat.",
              },
              {
                href: "/dashboard/media",
                step: "03",
                title: "Upload media",
                body: "Tambahkan cover, galeri, dan siapkan musik pembuka.",
              },
              {
                href: "/dashboard/guests",
                step: "04",
                title: "Tambah tamu",
                body: "Sistem akan membuat personal link untuk setiap tamu.",
              },
              {
                href: "/dashboard/send",
                step: "05",
                title: "Kirim undangan",
                body: "Bagikan link satu per satu atau gunakan alur kirim bertahap.",
              },
              {
                href: "/dashboard/analytics",
                step: "06",
                title: "Pantau hasil",
                body: "Lihat RSVP, tamu yang belum respons, dan performa dasar undangan.",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-[1.6rem] border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-5 py-5"
              >
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-secondary)]">
                  {item.step}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-[var(--color-text-primary)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-[var(--color-text-secondary)]">
                  {item.body}
                </p>
              </Link>
            ))}
          </div>
        </DashboardSectionCard>

        <div className="space-y-6">
          <PublishInvitationPanel
            status={invitation.status}
            publishedAt={invitation.publishedAt}
            validationErrors={publishValidation.errors}
            checklist={publishValidation.checklist}
            editHref="/dashboard/setup"
          />

          <DashboardSectionCard
            title="Route personal tamu"
            description="URL tamu akan mengikuti slug pasangan dan slug tamu."
          >
            <p className="rounded-[1.5rem] bg-[var(--color-text-primary)] px-4 py-4 text-sm text-white">
              {samplePublicPath}
            </p>
            <div className="mt-5 grid gap-3">
              <Link
                href="/dashboard/preview"
                className="button-secondary inline-flex justify-center rounded-full px-5 py-3 text-sm font-semibold"
              >
                Buka Preview
              </Link>
              <Link
                href="/dashboard/guests"
                className="button-primary inline-flex justify-center rounded-full px-5 py-3 text-sm font-semibold"
              >
                Kelola Tamu
              </Link>
            </div>
          </DashboardSectionCard>

          <DashboardSectionCard
            title="Checklist publish"
            description="Gunakan sebagai panduan cepat sebelum undangan dikirim."
          >
            <div className="space-y-3 text-sm text-[var(--color-text-secondary)]">
              {publishValidation.checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-[1.25rem] bg-[var(--color-surface-alt)] px-4 py-3"
                >
                  <span>{item.label}</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      item.isComplete
                        ? "bg-[rgba(79,123,98,0.12)] text-[var(--color-success)]"
                        : "bg-[rgba(181,87,99,0.12)] text-[var(--color-error)]"
                    }`}
                  >
                    {item.isComplete ? "Siap" : "Belum"}
                  </span>
                </div>
              ))}
            </div>
          </DashboardSectionCard>
        </div>
      </div>
    </div>
  );
}
