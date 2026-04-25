import {
  getDashboardAnalyticsSummary,
  getDashboardInvitationSummary,
} from "@/features/invitation/invitation.service";
import { requireClientUser } from "@/lib/auth/guards";

import { DashboardPageHeader } from "../_components/DashboardPageHeader";
import { DashboardSectionCard } from "../_components/DashboardSectionCard";
import { DashboardStatCard } from "../_components/DashboardStatCard";

export default async function DashboardAnalyticsPage() {
  const user = await requireClientUser();
  const invitation = await getDashboardInvitationSummary(user.id);
  const analytics = await getDashboardAnalyticsSummary(user.id, undefined, invitation);

  if (!invitation || !analytics) {
    return null;
  }

  const responseRate =
    analytics.totalGuests > 0 ? Math.round((analytics.totalRsvps / analytics.totalGuests) * 100) : 0;

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Analytics Sederhana"
        title="Pantau performa invitation secara cepat dan jelas"
        description="Dashboard ini fokus pada sinyal yang paling penting untuk client di tahap MVP: jumlah tamu, link personal, total open, total RSVP, dan breakdown status kehadiran."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <DashboardStatCard
          label="Total tamu"
          value={analytics.totalGuests}
          helper="Jumlah guest yang terhubung ke invitation."
        />
        <DashboardStatCard
          label="Total link personal"
          value={analytics.totalPersonalLinks}
          helper="Satu guest menghasilkan satu personal link."
        />
        <DashboardStatCard
          label="Invitation opened"
          value={analytics.totalInvitationOpens}
          helper="Total seluruh open yang sudah tercatat."
        />
        <DashboardStatCard
          label="Total RSVP"
          value={analytics.totalRsvps}
          helper="RSVP yang sudah dikirim dari halaman invitation."
        />
        <DashboardStatCard
          label="Response rate"
          value={`${responseRate}%`}
          helper="Perbandingan RSVP masuk terhadap total tamu."
        />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <DashboardStatCard
          label="Hadir"
          value={analytics.rsvpBreakdown.attending}
          helper="Tamu yang mengonfirmasi hadir."
        />
        <DashboardStatCard
          label="Tidak hadir"
          value={analytics.rsvpBreakdown.declined}
          helper="Tamu yang belum bisa hadir."
        />
        <DashboardStatCard
          label="Ragu"
          value={analytics.rsvpBreakdown.maybe}
          helper="Tamu yang masih tentative."
        />
      </section>

      <DashboardSectionCard
        title="Ringkasan pembacaan"
        description="Metrik MVP ini sengaja dibuat ringan agar cepat dipahami client tanpa perlu chart kompleks."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {[
            analytics.totalInvitationOpens === 0
              ? "Belum ada invitation yang dibuka. Bagikan personal link ke tamu untuk mulai mengumpulkan data open."
              : `${analytics.totalInvitationOpens} total open sudah tercatat sejak invitation dibagikan.`,
            analytics.totalRsvps === 0
              ? "RSVP belum masuk. Setelah tamu mengisi form di halaman invitation, angka ini akan ter-update otomatis."
              : `${analytics.totalRsvps} RSVP sudah masuk dengan ${analytics.rsvpBreakdown.attending} tamu menyatakan hadir.`,
            analytics.rsvpBreakdown.declined > 0
              ? `${analytics.rsvpBreakdown.declined} tamu menyatakan belum bisa hadir. Gunakan data ini untuk estimasi akhir undangan.`
              : "Belum ada tamu yang menandai status tidak hadir.",
            analytics.rsvpBreakdown.maybe > 0
              ? `${analytics.rsvpBreakdown.maybe} tamu masih ragu. Follow up manual bisa dilakukan menjelang hari acara.`
              : "Belum ada status ragu. Respons tamu saat ini sudah cukup tegas dibaca dari dashboard.",
          ].map((item) => (
            <div
              key={item}
              className="rounded-[1.5rem] bg-[var(--color-surface-alt)] px-4 py-4 text-sm leading-7 text-[var(--color-text-secondary)]"
            >
              {item}
            </div>
          ))}
        </div>
      </DashboardSectionCard>
    </div>
  );
}
