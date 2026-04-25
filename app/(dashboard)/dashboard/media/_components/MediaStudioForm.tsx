"use client";

import { useActionState, useEffect, useMemo, useState } from "react";

import { SubmitButton } from "@/components/ui/SubmitButton";
import type { InvitationTemplateConfigValues } from "@/features/invitation/form/config";

import type { DashboardActionState } from "../../_actions/dashboard-actions";
import { saveMediaInvitationAction } from "../../_actions/dashboard-actions";
import { MediaUploader } from "../../_components/MediaUploader";
import { MusicPresetPicker } from "./MusicPresetPicker";

type MediaStudioFormProps = {
  partnerOneName: string;
  partnerTwoName: string;
  templateConfig: InvitationTemplateConfigValues;
  coverImage: string | null;
  coverImageAlt: string | null;
  coverImageStoragePath: string | null;
  galleryImages: Array<{ imageUrl: string; storagePath?: string | null }>;
  musicUrl: string | null;
  musicOriginalName: string | null;
  musicMimeType: string | null;
  musicSize: number | null;
  musicStoragePath: string | null;
};

const initialState: DashboardActionState = {};

export function MediaStudioForm({
  partnerOneName,
  partnerTwoName,
  templateConfig,
  coverImage,
  coverImageAlt,
  coverImageStoragePath,
  galleryImages,
  musicUrl,
  musicOriginalName,
  musicMimeType,
  musicSize,
  musicStoragePath,
}: MediaStudioFormProps) {
  const [state, formAction] = useActionState(saveMediaInvitationAction, initialState);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [activeUploads, setActiveUploads] = useState(0);
  const [manualCoverAlt, setManualCoverAlt] = useState(Boolean(coverImageAlt?.trim()));

  const defaultCoverAlt = useMemo(() => {
    const groom = partnerOneName.trim();
    const bride = partnerTwoName.trim();

    if (groom && bride) {
      return `Undangan pernikahan ${groom} dan ${bride}`;
    }

    return "Cover undangan pernikahan digital";
  }, [partnerOneName, partnerTwoName]);

  const coverAltValue = manualCoverAlt ? coverImageAlt ?? "" : defaultCoverAlt;
  const isUploading = activeUploads > 0;

  useEffect(() => {
    if (state.success) {
      setToastType("success");
      setToastMessage("Media berhasil disimpan");
      return;
    }

    if (state.error) {
      setToastType("error");
      setToastMessage(state.error);
    }
  }, [state.error, state.success]);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setToastMessage(null);
    }, 2800);

    return () => window.clearTimeout(timeoutId);
  }, [toastMessage]);

  function handleUploadStateChange(isUploaderBusy: boolean) {
    setActiveUploads((currentCount) => {
      if (isUploaderBusy) {
        return currentCount + 1;
      }

      return Math.max(0, currentCount - 1);
    });
  }

  return (
    <form action={formAction} className="space-y-6">
      {toastMessage ? (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
          <p
            className={`rounded-full px-4 py-2 text-sm font-medium text-white shadow-lg ${
              toastType === "success" ? "bg-[var(--color-success)]" : "bg-[var(--color-error)]"
            }`}
            role="status"
            aria-live="polite"
          >
            {toastMessage}
          </p>
        </div>
      ) : null}
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
        initialAssets={
          coverImage ? [{ url: coverImage, storagePath: coverImageStoragePath ?? undefined }] : []
        }
        metadataFieldNames={{
          storagePath: "coverImageStoragePath",
        }}
        onUploadStateChange={handleUploadStateChange}
      />

      <label className="block space-y-2 rounded-[2rem] border border-[var(--color-border)] bg-white p-5">
        <span className="text-sm font-medium text-[var(--color-text-primary)]">
          Alt text cover
        </span>
        <input
          name="coverImageAlt"
          defaultValue={coverAltValue}
          onChange={() => {
            setManualCoverAlt(true);
          }}
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
        initialAssets={galleryImages.map((image) => ({
          url: image.imageUrl,
          storagePath: image.storagePath ?? undefined,
        }))}
        metadataFieldNames={{
          storagePath: "galleryImageStoragePaths",
        }}
        onUploadStateChange={handleUploadStateChange}
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
                  storagePath: musicStoragePath ?? undefined,
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
          storagePath: "musicStoragePath",
        }}
        onUploadStateChange={handleUploadStateChange}
      />

      <MusicPresetPicker
        defaultMood={templateConfig.music.mood}
        defaultPresetId={templateConfig.music.source === "preset" ? templateConfig.music.presetId : ""}
      />

      <SubmitButton
        pendingLabel="Menyimpan media..."
        disabled={isUploading}
        className="button-primary rounded-full px-6 py-3.5 text-sm font-semibold"
      >
        {isUploading ? "Tunggu upload selesai..." : "Simpan Media"}
      </SubmitButton>
    </form>
  );
}
