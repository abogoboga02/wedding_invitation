import dynamic from "next/dynamic";

import { normalizeTemplateConfig } from "@/features/invitation/form/config";
import { getDashboardInvitationMediaView } from "@/features/invitation/invitation.service";
import { requireClientUser } from "@/lib/auth/guards";

import { DashboardPageHeader } from "../_components/DashboardPageHeader";

const MediaStudioForm = dynamic(
  () => import("./_components/MediaStudioForm").then((mod) => mod.MediaStudioForm),
  {
    loading: () => (
      <div className="rounded-[1.75rem] border border-[var(--color-border)] bg-white px-5 py-5 text-sm text-[var(--color-text-secondary)]">
        Memuat studio media...
      </div>
    ),
  },
);

export default async function DashboardMediaPage() {
  const user = await requireClientUser();
  const invitation = await getDashboardInvitationMediaView(user.id);

  if (!invitation) {
    return null;
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Media Upload"
        title="Kelola galeri dan lagu pembuka"
        description="Halaman media sekarang fokus pada dua hal inti: batch foto pasangan dan pilihan lagu pembuka. Hero undangan akan dipilih otomatis dari galeri yang tersedia."
      />

      <MediaStudioForm
        templateConfig={normalizeTemplateConfig(invitation.template, invitation.templateConfig)}
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
