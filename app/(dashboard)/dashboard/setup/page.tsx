import Link from "next/link";
import dynamic from "next/dynamic";

import { getOrCreateDashboardInvitation } from "@/features/invitation/invitation.service";
import { requireClientUser } from "@/lib/auth/guards";
import { getTemplateDisplayName } from "@/features/invitation/templates/template-schema";

const SetupInvitationForm = dynamic(
  () => import("./_components/SetupInvitationForm").then((mod) => mod.SetupInvitationForm),
  {
    loading: () => (
      <div className="rounded-[1.75rem] border border-[var(--color-border)] bg-white px-5 py-5 text-sm text-[var(--color-text-secondary)]">
        Memuat editor setup undangan...
      </div>
    ),
  },
);

export default async function DashboardSetupPage() {
  const user = await requireClientUser();
  const invitation = await getOrCreateDashboardInvitation(user.id, user.name);

  const activeTemplateLabel = invitation.templateName ?? getTemplateDisplayName(invitation.template);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="rounded-[1.75rem] border border-[var(--color-border)] bg-white px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-secondary)]">
              Setup Invitation
            </p>
            <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] sm:text-3xl">
              Isi detail utama undangan
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-[var(--color-text-secondary)]">
              Lengkapi data inti terlebih dahulu agar undangan mudah ditinjau dan siap
              dipublikasikan. Media dan preview tetap bisa dibuka kapan saja tanpa membuat alur
              pengisian terasa ramai.
            </p>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
Template pilihan admin: {activeTemplateLabel}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/dashboard/media"
              className="button-secondary inline-flex justify-center rounded-full px-5 py-3 text-sm font-semibold"
            >
              Kelola Media
            </Link>
            <Link
              href="/dashboard/preview"
              className="button-primary inline-flex justify-center rounded-full px-5 py-3 text-sm font-semibold"
            >
              Lihat Preview
            </Link>
          </div>
        </div>
      </section>

      <SetupInvitationForm invitation={invitation} />
    </div>
  );
}
