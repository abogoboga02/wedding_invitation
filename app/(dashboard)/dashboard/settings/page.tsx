import { getDashboardInvitationSummary } from "@/features/invitation/invitation.service";
import { requireClientUser } from "@/lib/auth/guards";

import { DashboardPageHeader } from "../_components/DashboardPageHeader";
import { DashboardSectionCard } from "../_components/DashboardSectionCard";

import { InvitationSettingsForm } from "./_components/InvitationSettingsForm";

export default async function DashboardSettingsPage() {
  const user = await requireClientUser();
  const invitation = await getDashboardInvitationSummary(user.id);

  if (!invitation) {
    return null;
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Settings"
        title="Atur hal-hal dasar yang memengaruhi invitation"
        description="Halaman settings disiapkan untuk kebutuhan seperti locale, timezone, status publish, dan preferensi fitur tambahan di iterasi berikutnya."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardSectionCard
          title="Identitas invitation"
          description="Informasi inti yang biasanya jarang berubah setelah undangan mendekati final."
        >
          <div className="space-y-3 text-sm text-[var(--color-text-secondary)]">
            <div className="rounded-[1.5rem] bg-[var(--color-surface-alt)] px-4 py-4">
              <p className="font-medium text-[var(--color-text-primary)]">Slug pasangan</p>
              <p className="mt-1">{invitation.coupleSlug}</p>
            </div>
            <div className="rounded-[1.5rem] bg-[var(--color-surface-alt)] px-4 py-4">
              <p className="font-medium text-[var(--color-text-primary)]">Status publish</p>
              <p className="mt-1">{invitation.status}</p>
            </div>
          </div>
        </DashboardSectionCard>

        <DashboardSectionCard
          title="Preferensi invitation"
          description="Pengaturan ini langsung terhubung ke behavior halaman publik dan distribusi dasar."
        >
          <InvitationSettingsForm invitation={invitation} />
        </DashboardSectionCard>
      </div>
    </div>
  );
}
