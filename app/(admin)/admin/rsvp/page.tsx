import { connection } from "next/server";

import { RSVP_STATUS_LABELS } from "@/lib/constants/invitation";
import { prisma } from "@/lib/db/prisma";
import { formatAdminDateTime } from "@/lib/utils/date";

import { AdminSectionCard } from "../_components/AdminSectionCard";

export default async function AdminRsvpPage() {
  await connection();

  const [statusCounts, rsvps] = await Promise.all([
    prisma.rsvp.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    }),
    prisma.rsvp.findMany({
      include: {
        guest: {
          select: {
            name: true,
            guestSlug: true,
            invitation: {
              select: {
                coupleSlug: true,
                partnerOneName: true,
                partnerTwoName: true,
              },
            },
          },
        },
      },
      orderBy: {
        respondedAt: "desc",
      },
      take: 50,
    }),
  ]);

  const countMap = new Map(statusCounts.map((item) => [item.status, item._count.status]));

  return (
    <div className="space-y-6">
      <AdminSectionCard
        title="RSVP List"
        description="Admin dapat melihat respons tamu terbaru untuk memastikan invitation published benar-benar menghasilkan interaksi."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Hadir", value: countMap.get("ATTENDING") ?? 0 },
            { label: "Mungkin", value: countMap.get("MAYBE") ?? 0 },
            { label: "Tidak hadir", value: countMap.get("DECLINED") ?? 0 },
          ].map((item) => (
            <article
              key={item.label}
              className="rounded-[1.7rem] bg-[var(--color-surface-alt)] p-5"
            >
              <p className="text-sm text-[var(--color-text-secondary)]">{item.label}</p>
              <p className="mt-3 text-3xl font-semibold text-[var(--color-text-primary)]">
                {item.value}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {rsvps.length > 0 ? (
            rsvps.map((rsvp) => (
              <article
                key={rsvp.id}
                className="rounded-[1.7rem] bg-[var(--color-surface-alt)] px-4 py-4"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-medium text-[var(--color-text-primary)]">
                      {rsvp.guest.name}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                      /{rsvp.guest.invitation.coupleSlug}/{rsvp.guest.guestSlug}
                    </p>
                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                      {rsvp.guest.invitation.partnerOneName} &{" "}
                      {rsvp.guest.invitation.partnerTwoName}
                    </p>
                    {rsvp.respondentName ? (
                      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                        Responden: {rsvp.respondentName}
                      </p>
                    ) : null}
                    {rsvp.note ? (
                      <p className="mt-2 text-sm leading-7 text-[var(--color-text-secondary)]">
                        "{rsvp.note}"
                      </p>
                    ) : null}
                  </div>

                  <div className="text-sm text-[var(--color-text-secondary)] lg:text-right">
                    <p>
                      {RSVP_STATUS_LABELS[rsvp.status]} | {rsvp.attendees} orang
                    </p>
                    <p className="mt-1">{formatAdminDateTime(rsvp.respondedAt)}</p>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <p className="rounded-[1.7rem] bg-[var(--color-surface-alt)] px-4 py-5 text-sm leading-7 text-[var(--color-text-secondary)]">
              Belum ada RSVP yang tercatat.
            </p>
          )}
        </div>
      </AdminSectionCard>
    </div>
  );
}
