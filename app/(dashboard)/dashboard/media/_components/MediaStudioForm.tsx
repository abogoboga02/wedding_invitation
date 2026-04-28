"use client";

import { useActionState, useMemo, useState } from "react";

import { SubmitButton } from "@/components/ui/SubmitButton";
import type { InvitationTemplateConfigValues } from "@/features/invitation/form/config";

import type { DashboardActionState } from "../../_actions/dashboard-actions";
import { saveMediaInvitationAction } from "../../_actions/dashboard-actions";
import { MediaUploader } from "../../_components/MediaUploader";
import { MusicPresetPicker } from "./MusicPresetPicker";

type MediaStudioFormProps = {
  templateConfig: InvitationTemplateConfigValues;
  galleryImages: Array<{ imageUrl: string; storagePath?: string | null }>;
  musicUrl: string | null;
  musicOriginalName: string | null;
  musicMimeType: string | null;
  musicSize: number | null;
  musicStoragePath: string | null;
};

const initialState: DashboardActionState = {};

export function MediaStudioForm({
  templateConfig,
  galleryImages,
  musicUrl,
  musicOriginalName,
  musicMimeType,
  musicSize,
  musicStoragePath,
}: MediaStudioFormProps) {
  const [state, formAction] = useActionState(saveMediaInvitationAction, initialState);
  const initialGalleryAssets = useMemo(
    () =>
      galleryImages.map((image) => ({
        url: image.imageUrl,
        storagePath: image.storagePath ?? undefined,
      })),
    [galleryImages],
  );
  const initialMusicAssets = useMemo(
    () =>
      musicUrl && templateConfig.music.source === "upload"
        ? [
            {
              url: musicUrl,
              storagePath: musicStoragePath ?? undefined,
              originalName: musicOriginalName ?? undefined,
              mimeType: musicMimeType ?? undefined,
              size: musicSize ?? undefined,
            },
          ]
        : [],
    [
      musicMimeType,
      musicOriginalName,
      musicSize,
      musicStoragePath,
      musicUrl,
      templateConfig.music.source,
    ],
  );
  const [hasManualUpload, setHasManualUpload] = useState(initialMusicAssets.length > 0);

  return (
    <form action={formAction} className="space-y-6">
      {state.error ? (
        <p className="rounded-[1.4rem] border border-[rgba(181,87,99,0.22)] bg-[rgba(181,87,99,0.08)] px-4 py-3 text-sm text-[var(--color-error)]">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-[1.4rem] border border-[rgba(79,123,98,0.18)] bg-[rgba(79,123,98,0.08)] px-4 py-3 text-sm text-[var(--color-success)]">
          {state.success}
        </p>
      ) : null}

      <MediaUploader
        compact
        label="Galeri pasangan"
        helperText="Unggah batch foto pasangan langsung di sini. Template akan memilih visual pembuka otomatis dari galeri yang tersedia, jadi Anda tidak perlu mengatur hero atau cover terpisah."
        name="galleryImages"
        kind="gallery"
        multiple
        initialAssets={initialGalleryAssets}
        metadataFieldNames={{
          storagePath: "galleryImageStoragePaths",
        }}
      />

      <section className="space-y-5 rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface-alt)]/70 p-5">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
            Daftar playlist pembuka
          </h3>
          <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
            Pilih preset yang paling cocok, atau gunakan kartu tanpa preset untuk upload lagu
            sendiri. Bila file upload tersedia, lagu itu akan otomatis diprioritaskan.
          </p>
        </div>

        <div className="rounded-[1.6rem] border border-[var(--color-border)] bg-white p-4">
          <div className="mb-4 space-y-1">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">
              Pilih playlist template
            </p>
            <p className="text-xs leading-6 text-[var(--color-text-secondary)]">
              Upload manual sekarang ada di kartu &quot;Tanpa preset&quot; agar seluruh opsi lagu tetap
              berada dalam satu area yang lebih ringkas.
            </p>
          </div>

          <MusicPresetPicker
            embedded
            defaultMood={templateConfig.music.mood}
            defaultPresetId={
              templateConfig.music.source === "preset" ? templateConfig.music.presetId : ""
            }
            isManualUploadActive={hasManualUpload}
            manualUploadSlot={
              <MediaUploader
                embedded
                compact
                hideHeader
                hideDropzoneWhenFilled
                label="Upload lagu sendiri"
                helperText="Opsional. Cocok jika pasangan sudah punya satu lagu pembuka khusus."
                name="musicUrl"
                kind="music"
                initialAssets={initialMusicAssets}
                metadataFieldNames={{
                  originalName: "musicOriginalName",
                  mimeType: "musicMimeType",
                  size: "musicSize",
                  storagePath: "musicStoragePath",
                }}
                onAssetsChange={(assets) => setHasManualUpload(assets.length > 0)}
              />
            }
          />
        </div>
      </section>

      <SubmitButton
        pendingLabel="Menyimpan media..."
        className="button-primary rounded-full px-6 py-3.5 text-sm font-semibold"
      >
        Simpan Media
      </SubmitButton>
    </form>
  );
}
