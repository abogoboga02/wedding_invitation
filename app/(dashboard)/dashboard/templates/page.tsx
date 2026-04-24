import { auth } from "@/auth";
import { getDashboardInvitationSummary } from "@/features/invitation/invitation.service";

import { DashboardPageHeader } from "../_components/DashboardPageHeader";

import { TemplateSelectionGrid } from "./_components/TemplateSelectionGrid";

export default async function DashboardTemplatesPage() {
  const session = await auth();
  const invitation = await getDashboardInvitationSummary(session!.user.id);

  if (!invitation) {
    return null;
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Pilih Template"
        title="Tentukan visual yang paling sesuai dengan karakter pasangan"
        description="Anda hanya memilih satu template aktif untuk satu invitation. Konten undangan tetap sama, jadi Anda bisa berganti gaya tanpa harus mengisi ulang data."
      />

      <TemplateSelectionGrid activeTemplate={invitation.template} />
    </div>
  );
}
