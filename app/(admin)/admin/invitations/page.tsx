import { connection } from "next/server";

import { SubmitButton } from "@/components/ui/SubmitButton";
import { prisma } from "@/lib/db/prisma";
import { formatAdminDateTime } from "@/lib/utils/date";

import { toggleInvitationStatusAction } from "../_actions/admin-actions";
import { AdminSectionCard } from "../_components/AdminSectionCard";

export default async function AdminInvitationsPage() {
  await connection();

  const invitations = await prisma.invitation.findMany({
    include: {
      owner: {
        select: {
          name: true,
          email: true,
        },
      },
      _count: {
        select: {
          guests: true,
          wishes: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <AdminSectionCard
        title="Invitation Management"
        description="Daftar invitation aktif untuk membantu admin melihat status publish, pemilik, dan kepadatan data tamu."
      >
        <div className="space-y-4">
          {invitations.map((invitation) => {
            const nextStatus = invitation.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

            return (
              <article
                key={invitation.id}
                className="rounded-[1.7rem] bg-[var(--color-surface-alt)] px-4 py-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-medium text-[var(--color-text-primary)]">
                      {invitation.partnerOneName} & {invitation.partnerTwoName}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                      /{invitation.coupleSlug} | {invitation.owner.name ?? invitation.owner.email}
                    </p>
                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                      Template {invitation.template} | {invitation._count.guests} tamu |{" "}
                      {invitation._count.wishes} ucapan | Update{" "}
                      {formatAdminDateTime(invitation.updatedAt)}
                    </p>
                  </div>

                  <form action={toggleInvitationStatusAction} className="flex items-center gap-3">
                    <input type="hidden" name="invitationId" value={invitation.id} />
                    <input type="hidden" name="status" value={nextStatus} />
                    <span className="rounded-full border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--color-text-primary)]">
                      {invitation.status}
                    </span>
                    <SubmitButton className="rounded-full bg-[var(--color-text-primary)] px-4 py-2.5 text-sm font-semibold text-white">
                      {nextStatus === "PUBLISHED" ? "Force Publish" : "Kembalikan ke Draft"}
                    </SubmitButton>
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      </AdminSectionCard>
    </div>
  );
}
