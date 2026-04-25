import { connection } from "next/server";

import { SubmitButton } from "@/components/ui/SubmitButton";
import { getAdminTemplateUsage } from "@/features/admin/admin.service";
import { TEMPLATE_OPTIONS } from "@/lib/constants/invitation";

import { syncPlanCatalogAction } from "../_actions/admin-actions";
import { AdminSectionCard } from "../_components/AdminSectionCard";

export default async function AdminTemplatesPage() {
  await connection();
  const usageMap = await getAdminTemplateUsage();

  return (
    <div className="space-y-6">
      <AdminSectionCard
        title="Template Management"
        description="Template masih dikelola sebagai registry internal. Admin bisa memantau pemakaian dan menyinkronkan catalog plan dasar."
      >
        <div className="mb-6 flex justify-end">
          <form action={syncPlanCatalogAction}>
            <SubmitButton className="rounded-full bg-[var(--color-text-primary)] px-5 py-3 text-sm font-semibold text-white">
              Sinkronkan Plan Catalog
            </SubmitButton>
          </form>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {TEMPLATE_OPTIONS.map((template) => (
            <article key={template.id} className="rounded-[1.8rem] bg-[var(--color-surface-alt)] p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-secondary)]">
                {template.tagline}
              </p>
              <h3 className="mt-3 font-serif-display text-3xl text-[var(--color-text-primary)]">
                {template.label}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">
                {template.description}
              </p>
              <p className="mt-5 text-sm font-medium text-[var(--color-text-primary)]">
                Dipakai di {usageMap.get(template.id) ?? 0} invitation
              </p>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                {template.isPremium ? "Premium" : "Reguler"} â€¢ Rp
                {template.priceInIdr.toLocaleString("id-ID")}
              </p>
            </article>
          ))}
        </div>
      </AdminSectionCard>
    </div>
  );
}
