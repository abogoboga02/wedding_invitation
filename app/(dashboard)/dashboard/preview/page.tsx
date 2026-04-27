import { buildDraftInvitationPreview } from "@/features/invitation/preview-invitation.service";
import {
  getDashboardInvitationPreview,
  validateInvitationPublishability,
} from "@/features/invitation/invitation.service";
import { TemplateRenderer } from "@/features/invitation/templates/TemplateRenderer";
import { requireClientUser } from "@/lib/auth/guards";

import { InvitationStatusBadge } from "../_components/InvitationStatusBadge";
import { PreviewPublishActions } from "./_components/PreviewPublishActions";

function PreviewRsvpPlaceholder() {
  return (
    <div className="space-y-3">
      <p>Area RSVP akan muncul di sini untuk setiap tamu yang membuka link undangan.</p>
      <p>
        Saat undangan live, tamu dapat memilih kehadiran dan meninggalkan ucapan langsung dari
        section ini.
      </p>
    </div>
  );
}

export default async function DashboardPreviewPage() {
  const user = await requireClientUser();
  const invitation = await getDashboardInvitationPreview(user.id);

  if (!invitation) {
    return null;
  }

  const draftPreview = buildDraftInvitationPreview(invitation);
  const publishValidation = validateInvitationPublishability({
    ...invitation,
    guestCount: invitation.guestCount,
  });

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <section className="rounded-[1.75rem] border border-[var(--color-border)] bg-white px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-secondary)]">
                Preview Undangan
              </p>
              <InvitationStatusBadge status={invitation.status} />
            </div>
            <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] sm:text-3xl">
              Lihat hasil undangan sebelum dibagikan
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-[var(--color-text-secondary)]">
              Preview ini menampilkan undangan seperti yang akan dilihat tamu.
              {draftPreview.isUsingSampleGuest
                ? ` Saat ini kami memakai tamu contoh agar tampilan tetap bisa dicek sebelum daftar tamu diisi.`
                : ` Tamu yang dipakai untuk simulasi adalah ${draftPreview.previewGuestName}.`}
            </p>
          </div>

          <PreviewPublishActions
            status={invitation.status}
            publishedAt={invitation.publishedAt}
            validationErrors={publishValidation.errors}
          />
        </div>
      </section>

      {publishValidation.errors.length > 0 ? (
        <section className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          <p className="font-semibold">Sebelum publish, lengkapi beberapa bagian berikut.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {publishValidation.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="overflow-hidden rounded-[2rem] border border-[var(--color-border)] bg-white shadow-[0_24px_70px_rgba(0,0,0,0.06)]">
        <TemplateRenderer
          invitation={draftPreview.renderModel}
          previewMode
          rsvpSlot={<PreviewRsvpPlaceholder />}
        />
      </section>
    </div>
  );
}
