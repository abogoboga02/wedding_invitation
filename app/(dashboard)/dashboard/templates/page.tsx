import Link from "next/link";

import { getDashboardInvitationCore } from "@/features/invitation/invitation.service";
import { getTemplateDisplayName } from "@/features/invitation/templates/template-schema";
import { requireClientUser } from "@/lib/auth/guards";

import { DashboardPageHeader } from "../_components/DashboardPageHeader";

export default async function DashboardTemplatesPage() {
  const user = await requireClientUser();
  const invitation = await getDashboardInvitationCore(user.id);

  if (!invitation) {
    return null;
  }

  const activeTemplateLabel = invitation.templateName ?? getTemplateDisplayName(invitation.template);

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Template Undangan"
        title="Template ditentukan admin untuk akun Anda"
        description="Anda tidak perlu memilih template dari daftar. Dashboard difokuskan untuk mengelola data undangan, preview, dan simpan perubahan."
      />

      <section className="rounded-[1.75rem] border border-[var(--color-border)] bg-white px-5 py-5 sm:px-6">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-secondary)]">Template Aktif</p>
        <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">{activeTemplateLabel}</h2>
        <p className="mt-2 text-sm leading-7 text-[var(--color-text-secondary)]">
          Jika perlu ganti template, silakan hubungi admin. Di halaman ini Anda cukup meninjau template
          aktif lalu lanjut ke pengisian data undangan.
        </p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/dashboard/setup"
            className="button-primary inline-flex justify-center rounded-full px-5 py-3 text-sm font-semibold"
          >
            Isi Data Undangan
          </Link>
          <Link
            href="/dashboard/preview"
            className="button-secondary inline-flex justify-center rounded-full px-5 py-3 text-sm font-semibold"
          >
            Preview Template
          </Link>
        </div>
      </section>
    </div>
  );
}
