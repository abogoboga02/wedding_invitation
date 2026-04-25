import { normalizeTemplateConfig } from "@/features/invitation/form/config";
import { getDashboardInvitationSummary } from "@/features/invitation/invitation.service";
import { requireClientUser } from "@/lib/auth/guards";

import { DashboardPageHeader } from "../_components/DashboardPageHeader";

import { MediaStudioForm } from "./_components/MediaStudioForm";

export default async function DashboardMediaPage() {
  const user = await requireClientUser();
  const invitation = await getDashboardInvitationSummary(user.id);

  if (!invitation) {
    return null;
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Media Upload"
        title="Kelola cover, galeri, dan lagu pembuka"
        description="Halaman media menjadi satu studio kecil untuk semua aset utama invitation agar flow setup tetap fokus dan ringan."
      />

      <MediaStudioForm
        templateConfig={normalizeTemplateConfig(invitation.template, invitation.templateConfig)}
        coverImage={invitation.coverImage}
        coverImageAlt={invitation.coverImageAlt}
        coverImageStoragePath={invitation.coverImageStoragePath}
        galleryImages={invitation.galleryImages}
        musicUrl={invitation.musicUrl}
        musicOriginalName={invitation.musicOriginalName}
        musicMimeType={invitation.musicMimeType}
        musicSize={invitation.musicSize}
        musicStoragePath={invitation.musicStoragePath}
      />
    </div>
  );
}
