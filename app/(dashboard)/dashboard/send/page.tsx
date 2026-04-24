import Link from "next/link";

import { auth } from "@/auth";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { getDashboardInvitationSummary } from "@/features/invitation/invitation.service";
import { SEND_CHANNEL_LABELS } from "@/lib/constants/pricing";
import { prisma } from "@/lib/db/prisma";

import { DashboardPageHeader } from "../_components/DashboardPageHeader";
import { DashboardSectionCard } from "../_components/DashboardSectionCard";
import { DashboardStatCard } from "../_components/DashboardStatCard";
import { logManualSendAction } from "../_actions/dashboard-actions";

export default async function DashboardSendPage() {
  const session = await auth();
  const invitation = await getDashboardInvitationSummary(session!.user.id);

  if (!invitation) {
    return null;
  }

  const sendReadyGuests = invitation.guests.filter((guest) => guest.phone || guest.email);
  const recentLogs = await prisma.sendLog.findMany({
    where: {
      invitationId: invitation.id,
    },
    include: {
      guest: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 8,
  });

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Kirim Undangan"
        title="Distribusikan link personal ke tamu yang sudah siap dihubungi"
        description="Untuk MVP, alur terbaik adalah manual send yang ringan: copy link personal dan kirim lewat channel yang sudah biasa dipakai pasangan."
        actions={
          <Link
            href="/dashboard/guests"
            className="button-secondary inline-flex rounded-full px-5 py-3 text-sm font-semibold"
          >
            Kelola Guest List
          </Link>
        }
      />

      <section className="grid gap-4 md:grid-cols-3">
        <DashboardStatCard label="Total tamu" value={invitation.guests.length} />
        <DashboardStatCard label="Siap dikirim" value={sendReadyGuests.length} />
        <DashboardStatCard
          label="Status invitation"
          value={invitation.status === "PUBLISHED" ? "Published" : "Draft"}
          helper="Kirim idealnya dilakukan setelah status Published."
        />
      </section>

      <DashboardSectionCard
        title="Flow kirim MVP"
        description="Sebelum auto send aktif, dashboard ini membantu user memahami langkah distribusi yang paling aman."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {[
            "Pastikan undangan sudah dipreview dan siap publish.",
            "Tambahkan nomor WhatsApp atau email pada tamu yang ingin dihubungi.",
            "Gunakan personal link per tamu untuk menjaga sapaan tetap relevan.",
            "Status auto send dan retry worker bisa ditambahkan pada iterasi berikutnya.",
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

      <DashboardSectionCard
        title="Manual send log"
        description="Tandai pengiriman manual agar tim tetap punya jejak distribusi yang sederhana."
      >
        <div className="space-y-4">
          {sendReadyGuests.length > 0 ? (
            sendReadyGuests.map((guest) => (
              <article
                key={guest.id}
                className="rounded-[1.6rem] bg-[var(--color-surface-alt)] px-4 py-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-medium text-[var(--color-text-primary)]">{guest.name}</p>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                      /{invitation.coupleSlug}/{guest.guestSlug}
                    </p>
                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                      {guest.phone ?? "Tanpa nomor HP"} • {guest.email ?? "Tanpa email"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(["MANUAL", "WHATSAPP", "EMAIL"] as const).map((channel) => {
                      const hasRecipient =
                        channel === "EMAIL" ? Boolean(guest.email) : channel === "WHATSAPP" ? Boolean(guest.phone) : Boolean(guest.phone || guest.email);

                      return (
                        <form key={channel} action={logManualSendAction}>
                          <input type="hidden" name="guestId" value={guest.id} />
                          <input type="hidden" name="channel" value={channel} />
                          <SubmitButton
                            disabled={!hasRecipient}
                            className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-semibold text-[var(--color-text-primary)] disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {hasRecipient
                              ? `Tandai ${SEND_CHANNEL_LABELS[channel]}`
                              : `${SEND_CHANNEL_LABELS[channel]} belum siap`}
                          </SubmitButton>
                        </form>
                      );
                    })}
                  </div>
                </div>
              </article>
            ))
          ) : (
            <p className="rounded-[1.5rem] bg-[var(--color-surface-alt)] px-4 py-5 text-sm leading-7 text-[var(--color-text-secondary)]">
              Belum ada tamu yang punya nomor atau email untuk dicatat ke send log.
            </p>
          )}
        </div>
      </DashboardSectionCard>

      <DashboardSectionCard
        title="Riwayat distribusi terbaru"
        description="Jejak manual ini membantu admin dan client melihat siapa yang sudah dikirim lebih dulu."
      >
        <div className="space-y-3">
          {recentLogs.length > 0 ? (
            recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex flex-col gap-2 rounded-[1.5rem] bg-[var(--color-surface-alt)] px-4 py-4 text-sm text-[var(--color-text-secondary)] sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">
                    {log.guest?.name ?? "Tamu tidak ditemukan"}
                  </p>
                  <p className="mt-1">
                    {SEND_CHANNEL_LABELS[log.channel]} • {log.recipient}
                  </p>
                </div>
                <p>{log.sentAt?.toLocaleString("id-ID") ?? "-"}</p>
              </div>
            ))
          ) : (
            <p className="rounded-[1.5rem] bg-[var(--color-surface-alt)] px-4 py-5 text-sm leading-7 text-[var(--color-text-secondary)]">
              Belum ada send log yang tercatat. Begitu pengiriman manual ditandai, riwayat akan muncul
              di sini.
            </p>
          )}
        </div>
      </DashboardSectionCard>
    </div>
  );
}
