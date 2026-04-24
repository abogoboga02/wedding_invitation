import { auth } from "@/auth";
import { getDashboardInvitationSummary } from "@/features/invitation/invitation.service";
import { RSVP_STATUS_LABELS } from "@/lib/constants/invitation";
import { formatAdminDateTime } from "@/lib/utils/date";

import { DashboardPageHeader } from "../_components/DashboardPageHeader";
import { DashboardSectionCard } from "../_components/DashboardSectionCard";
import { DashboardStatCard } from "../_components/DashboardStatCard";

export default async function DashboardRsvpPage() {
  const session = await auth();
  const invitation = await getDashboardInvitationSummary(session!.user.id);

  if (!invitation) {
    return null;
  }

  const rsvps = invitation.guests
    .filter((guest) => guest.rsvp)
    .sort(
      (left, right) =>
        new Date(right.rsvp!.respondedAt).getTime() - new Date(left.rsvp!.respondedAt).getTime(),
    );
  const attending = rsvps.filter((guest) => guest.rsvp?.status === "ATTENDING").length;
  const maybe = rsvps.filter((guest) => guest.rsvp?.status === "MAYBE").length;
  const declined = rsvps.filter((guest) => guest.rsvp?.status === "DECLINED").length;
  const totalAttendees = rsvps
    .filter((guest) => guest.rsvp?.status === "ATTENDING")
    .reduce((sum, guest) => sum + (guest.rsvp?.attendees ?? 0), 0);
  const pending = invitation.guests.length - rsvps.length;

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="RSVP"
        title="Pantau tamu yang sudah merespons kehadiran"
        description="Halaman ini membantu pasangan membaca status hadir, nama responden, dan pesan singkat dari form RSVP publik tanpa perlu membuka data tamu satu per satu."
      />

      <section className="grid gap-4 md:grid-cols-5">
        <DashboardStatCard label="Semua RSVP" value={rsvps.length} />
        <DashboardStatCard label="Hadir" value={attending} />
        <DashboardStatCard label="Ragu" value={maybe} />
        <DashboardStatCard label="Tidak hadir" value={declined} />
        <DashboardStatCard
          label="Estimasi hadir"
          value={totalAttendees}
          helper={`${pending} tamu belum kirim RSVP.`}
        />
      </section>

      <DashboardSectionCard
        title="Respons terbaru"
        description="Menampilkan RSVP yang sudah masuk dari personal link tamu beserta nama responden, jumlah hadir, pesan singkat, dan ucapan."
      >
        <div className="space-y-3">
          {rsvps.length > 0 ? (
            rsvps.slice(0, 12).map((guest) => (
              <div
                key={guest.id}
                className="flex flex-col gap-3 rounded-[1.5rem] bg-[var(--color-surface-alt)] px-4 py-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">{guest.name}</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    /{invitation.coupleSlug}/{guest.guestSlug}
                  </p>
                  {guest.rsvp?.respondentName ? (
                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                      Responden: {guest.rsvp.respondentName}
                    </p>
                  ) : null}
                  {guest.rsvp?.note ? (
                    <p className="mt-2 text-sm leading-7 text-[var(--color-text-secondary)]">
                      Pesan: &ldquo;{guest.rsvp.note}&rdquo;
                    </p>
                  ) : null}
                  {guest.wish ? (
                    <p className="mt-2 text-sm leading-7 text-[var(--color-text-secondary)]">
                      Ucapan: &ldquo;{guest.wish.message}&rdquo;
                    </p>
                  ) : null}
                </div>

                <div className="text-sm text-[var(--color-text-secondary)] sm:text-right">
                  <p className="font-medium text-[var(--color-text-primary)]">
                    {guest.rsvp ? RSVP_STATUS_LABELS[guest.rsvp.status] : "-"}
                  </p>
                  <p className="mt-1">{guest.rsvp?.attendees ?? 1} orang</p>
                  <p className="mt-1">
                    {guest.rsvp ? formatAdminDateTime(guest.rsvp.respondedAt) : "-"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="rounded-[1.5rem] bg-[var(--color-surface-alt)] px-4 py-5 text-sm leading-7 text-[var(--color-text-secondary)]">
              Belum ada RSVP yang masuk. Setelah tamu membuka link personal dan mengisi form,
              daftar respons akan tampil di sini.
            </p>
          )}
        </div>
      </DashboardSectionCard>
    </div>
  );
}
