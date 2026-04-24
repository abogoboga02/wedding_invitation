"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/ui/SubmitButton";
import type { InvitationTemplateConfigValues } from "@/features/invitation/form/config";

import type { DashboardActionState } from "../../_actions/dashboard-actions";
import { saveMediaInvitationAction } from "../../_actions/dashboard-actions";
import { MediaUploader } from "../../_components/MediaUploader";
import { MusicPresetPicker } from "./MusicPresetPicker";

type MediaStudioFormProps = {
  templateConfig: InvitationTemplateConfigValues;
  coverImage: string | null;
  coverImageAlt: string | null;
  galleryImages: Array<{ imageUrl: string }>;
  musicUrl: string | null;
  musicOriginalName: string | null;
  musicMimeType: string | null;
  musicSize: number | null;
};

const initialState: DashboardActionState = {};

export function MediaStudioForm({
  templateConfig,
  coverImage,
  coverImageAlt,
  galleryImages,
  musicUrl,
  musicOriginalName,
  musicMimeType,
  musicSize,
}: MediaStudioFormProps) {
  const [state, formAction] = useActionState(saveMediaInvitationAction, initialState);

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
        label="Cover Undangan"
        helperText="Unggah satu gambar utama untuk hero undangan."
        name="coverImage"
        kind="cover"
        initialAssets={coverImage ? [{ url: coverImage }] : []}
      />

      <label className="block space-y-2 rounded-[2rem] border border-[var(--color-border)] bg-white p-5">
        <span className="text-sm font-medium text-[var(--color-text-primary)]">
          Alt text cover
        </span>
        <input
          name="coverImageAlt"
          defaultValue={coverImageAlt ?? ""}
          className="w-full rounded-[1.3rem] border border-[var(--color-border)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary-strong)]"
          placeholder="Contoh: Potret editorial pasangan di taman"
        />
      </label>

      <MediaUploader
        label="Galeri Pasangan"
        helperText="Unggah beberapa foto inti untuk membuat undangan terasa lebih personal."
        name="galleryImages"
        kind="gallery"
        multiple
        initialAssets={galleryImages.map((image) => ({ url: image.imageUrl }))}
      />

      <MediaUploader
        label="Lagu Pembuka"
        helperText="Unggah satu file audio ringan bila ingin memakai lagu sendiri. Jika tidak, Anda bisa memilih preset playlist bawaan."
        name="musicUrl"
        kind="music"
        initialAssets={
          musicUrl && templateConfig.music.source === "upload"
            ? [
                {
                  url: musicUrl,
                  originalName: musicOriginalName ?? undefined,
                  mimeType: musicMimeType ?? undefined,
                  size: musicSize ?? undefined,
                },
              ]
            : []
        }
        metadataFieldNames={{
          originalName: "musicOriginalName",
          mimeType: "musicMimeType",
          size: "musicSize",
        }}
      />

      <MusicPresetPicker
        defaultMood={templateConfig.music.mood}
        defaultPresetId={templateConfig.music.source === "preset" ? templateConfig.music.presetId : ""}
      />

      <SubmitButton
        pendingLabel="Menyimpan media..."
        className="button-primary rounded-full px-6 py-3.5 text-sm font-semibold"
      >
        Simpan Media
      </SubmitButton>
    </form>
  );
}
