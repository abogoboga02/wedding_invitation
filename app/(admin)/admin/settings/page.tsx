import { connection } from "next/server";

import { prisma } from "@/lib/db/prisma";

import { AdminSectionCard } from "../_components/AdminSectionCard";

export default async function AdminSettingsPage() {
  await connection();

  const [invitationSettingsCount, rsvpEnabledCount, wishEnabledCount] = await Promise.all([
    prisma.invitationSetting.count(),
    prisma.invitationSetting.count({
      where: { isRsvpEnabled: true },
    }),
    prisma.invitationSetting.count({
      where: { isWishEnabled: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <AdminSectionCard
        title="Platform Settings Snapshot"
        description="Ringkasan ini membantu melihat seberapa banyak invitation yang sudah memakai settings dasar yang baru."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              label: "Invitation settings",
              value: invitationSettingsCount,
              description: "Jumlah invitation yang sudah punya record setting.",
            },
            {
              label: "RSVP enabled",
              value: rsvpEnabledCount,
              description: "Invitation yang masih membuka form RSVP publik.",
            },
            {
              label: "Wish enabled",
              value: wishEnabledCount,
              description: "Invitation yang masih membuka ucapan tamu.",
            },
          ].map((item) => (
            <article key={item.label} className="rounded-[1.7rem] bg-[var(--color-surface-alt)] p-5">
              <p className="text-sm text-[var(--color-text-secondary)]">{item.label}</p>
              <p className="mt-3 text-3xl font-semibold text-[var(--color-text-primary)]">
                {item.value}
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </AdminSectionCard>
    </div>
  );
}
