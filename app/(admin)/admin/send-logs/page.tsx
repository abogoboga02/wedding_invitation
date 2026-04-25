import { connection } from "next/server";

import { getAdminSendLogs } from "@/features/admin/admin.service";
import { SEND_CHANNEL_LABELS } from "@/lib/constants/pricing";

import { AdminSectionCard } from "../_components/AdminSectionCard";

export default async function AdminSendLogsPage() {
  await connection();
  const logs = await getAdminSendLogs();

  return (
    <div className="space-y-6">
      <AdminSectionCard
        title="Send Logs"
        description="Riwayat distribusi membantu admin melihat channel mana yang paling sering dipakai dan siapa yang sudah dikirim."
      >
        <div className="space-y-3">
          {logs.length > 0 ? (
            logs.map((log) => (
              <div
                key={log.id}
                className="rounded-[1.5rem] bg-[var(--color-surface-alt)] px-4 py-4 text-sm text-[var(--color-text-secondary)]"
              >
                <p className="font-medium text-[var(--color-text-primary)]">
                  {log.guestName ?? "Tanpa tamu"} â€¢ /{log.invitationCoupleSlug}
                </p>
                <p className="mt-1">
                  {SEND_CHANNEL_LABELS[log.channel]} â€¢ {log.status} â€¢ {log.recipient}
                </p>
              </div>
            ))
          ) : (
            <p className="rounded-[1.5rem] bg-[var(--color-surface-alt)] px-4 py-5 text-sm leading-7 text-[var(--color-text-secondary)]">
              Belum ada send log. Begitu client menandai pengiriman manual dari dashboard, data akan
              tampil di sini.
            </p>
          )}
        </div>
      </AdminSectionCard>
    </div>
  );
}
