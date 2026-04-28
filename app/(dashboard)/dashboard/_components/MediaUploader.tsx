"use client";

import Image from "next/image";
import { startTransition, useMemo, useState } from "react";

import type { UploadKind } from "@/lib/utils/upload";

type MediaAsset = {
  url: string;
  storagePath?: string;
  mimeType?: string;
  size?: number;
  originalName?: string;
};

type MediaUploaderProps = {
  label: string;
  helperText: string;
  name: string;
  kind: UploadKind;
  multiple?: boolean;
  embedded?: boolean;
  compact?: boolean;
  hideHeader?: boolean;
  hideDropzoneWhenFilled?: boolean;
  initialAssets?: MediaAsset[];
  metadataFieldNames?: Partial<Record<"originalName" | "mimeType" | "size" | "storagePath", string>>;
  onAssetsChange?: (assets: MediaAsset[]) => void;
};

function buttonClass() {
  return "rounded-full border border-[var(--color-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)] transition hover:border-[var(--color-primary-strong)] hover:text-[var(--color-text-primary)]";
}

function formatFileSize(size?: number) {
  if (!size) {
    return null;
  }

  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.ceil(size / 1024)} KB`;
}

function getAssetDisplayName(asset: MediaAsset, index: number, kind: UploadKind) {
  if (asset.originalName?.trim()) {
    return asset.originalName;
  }

  if (kind === "music") {
    return "Lagu pembuka";
  }

  return `Foto ${index + 1}`;
}

export function MediaUploader({
  label,
  helperText,
  name,
  kind,
  multiple = false,
  embedded = false,
  compact = false,
  hideHeader = false,
  hideDropzoneWhenFilled = false,
  initialAssets = [],
  metadataFieldNames,
  onAssetsChange,
}: MediaUploaderProps) {
  const [assets, setAssets] = useState(initialAssets);
  const [error, setError] = useState<string>();
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const inputAccept = useMemo(() => {
    if (kind === "music") {
      return "audio/mpeg,audio/mp4,audio/ogg,audio/wav";
    }

    return "image/jpeg,image/png,image/webp";
  }, [kind]);
  const shouldShowDropzone = !(hideDropzoneWhenFilled && !multiple && assets.length > 0);

  function applyAssets(nextAssets: MediaAsset[]) {
    setAssets(nextAssets);
    onAssetsChange?.(nextAssets);
  }

  async function uploadFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);

    if (files.length === 0) {
      return;
    }

    setError(undefined);
    setIsUploading(true);

    const payload = new FormData();
    payload.append("kind", kind);
    files.forEach((file) => payload.append("files", file));

    startTransition(async () => {
      const response = await fetch("/api/uploads", {
        method: "POST",
        body: payload,
      });

      const data = (await response.json()) as {
        error?: string;
        assets?: MediaAsset[];
      };

      if (!response.ok || !data.assets) {
        setError(data.error ?? "Upload belum berhasil.");
        setIsUploading(false);
        return;
      }

      const uploadedAssets = data.assets;
      const nextAssets = multiple
        ? [...assets, ...uploadedAssets]
        : uploadedAssets.slice(0, 1);

      applyAssets(nextAssets);
      setIsUploading(false);
    });
  }

  function removeAsset(targetUrl: string) {
    applyAssets(assets.filter((asset) => asset.url !== targetUrl));
  }

  function moveAsset(targetIndex: number, direction: "left" | "right") {
    const nextIndex = direction === "left" ? targetIndex - 1 : targetIndex + 1;

    if (nextIndex < 0 || nextIndex >= assets.length) {
      return;
    }

    const nextAssets = [...assets];
    const currentAsset = nextAssets[targetIndex];
    nextAssets[targetIndex] = nextAssets[nextIndex];
    nextAssets[nextIndex] = currentAsset;
    applyAssets(nextAssets);
  }

  return (
    <div
      className={
        embedded
          ? compact
            ? "space-y-3"
            : "space-y-4"
          : "space-y-4 rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface-alt)]/70 p-5"
      }
    >
      {!hideHeader ? (
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-[var(--color-text-primary)]">{label}</h3>
          <p className="text-sm leading-7 text-[var(--color-text-secondary)]">{helperText}</p>
        </div>
      ) : null}

      {shouldShowDropzone ? (
        <label
          className={`flex cursor-pointer flex-col items-center justify-center border border-dashed text-center transition ${
            compact
              ? "min-h-28 rounded-[1.3rem] px-4 py-4"
              : "min-h-36 rounded-[1.6rem] px-4 py-6"
          } ${
            isDragging
              ? "border-[var(--color-primary-strong)] bg-white"
              : "border-[var(--color-border)] bg-white"
          }`}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            void uploadFiles(event.dataTransfer.files);
          }}
        >
          <input
            type="file"
            accept={inputAccept}
            multiple={multiple}
            onChange={(event) => {
              if (event.target.files?.length) {
                void uploadFiles(event.target.files);
                event.target.value = "";
              }
            }}
            className="sr-only"
          />
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
            {isUploading ? "Mengunggah file..." : "Drag & drop atau pilih file"}
          </p>
          <p className="mt-2 max-w-sm text-xs leading-6 text-[var(--color-text-secondary)]">
            {kind === "music"
              ? "Mendukung MP3, M4A, OGG, atau WAV hingga 12MB."
              : "Mendukung JPG, PNG, atau WEBP hingga 6MB per file."}
          </p>
        </label>
      ) : null}

      {error ? (
        <p className="rounded-[1.3rem] border border-[rgba(181,87,99,0.2)] bg-[rgba(181,87,99,0.08)] px-4 py-3 text-sm text-[var(--color-error)]">
          {error}
        </p>
      ) : null}

      {assets.length > 0 ? (
        <div
          className={
            kind === "music"
              ? "grid gap-3"
              : compact
                ? "grid grid-cols-2 gap-3 lg:grid-cols-3"
                : "grid gap-3 sm:grid-cols-2"
          }
        >
          {assets.map((asset, index) => (
            <div
              key={`${asset.url}-${index}`}
              className={`overflow-hidden border border-[var(--color-border)] bg-white ${
                compact ? "rounded-[1.25rem]" : "rounded-[1.5rem]"
              }`}
            >
              {kind === "music" ? (
                <div className={compact ? "space-y-3 p-3" : "space-y-4 p-4"}>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {getAssetDisplayName(asset, index, kind)}
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                      {[asset.mimeType, formatFileSize(asset.size)].filter(Boolean).join(" • ")}
                    </p>
                  </div>
                  <audio controls preload="none" className="w-full">
                    <source src={asset.url} type={asset.mimeType ?? undefined} />
                  </audio>
                </div>
              ) : (
                <div
                  className={`relative bg-stone-100 ${compact ? "aspect-square" : "aspect-[4/3]"}`}
                >
                  <Image
                    src={asset.url}
                    alt={asset.originalName ?? label}
                    fill
                    sizes={compact ? "(max-width: 1024px) 50vw, 25vw" : "(max-width: 640px) 100vw, 50vw"}
                    className="object-cover"
                  />
                </div>
              )}

              <div
                className={`flex flex-wrap items-center justify-between gap-3 ${
                  compact ? "px-3 py-2.5" : "px-4 py-3"
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-[var(--color-text-primary)]">
                    {getAssetDisplayName(asset, index, kind)}
                  </p>
                  {kind !== "music" ? (
                    <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                      {formatFileSize(asset.size) ?? `Urutan galeri ${index + 1}`}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  {multiple ? (
                    <>
                      <button
                        type="button"
                        onClick={() => moveAsset(index, "left")}
                        className={buttonClass()}
                      >
                        Geser kiri
                      </button>
                      <button
                        type="button"
                        onClick={() => moveAsset(index, "right")}
                        className={buttonClass()}
                      >
                        Geser kanan
                      </button>
                    </>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => removeAsset(asset.url)}
                    className={buttonClass()}
                  >
                    Hapus
                  </button>
                </div>
              </div>

              <input type="hidden" name={name} value={asset.url} />
              {metadataFieldNames?.originalName ? (
                <input
                  type="hidden"
                  name={metadataFieldNames.originalName}
                  value={asset.originalName ?? ""}
                />
              ) : null}
              {metadataFieldNames?.mimeType ? (
                <input
                  type="hidden"
                  name={metadataFieldNames.mimeType}
                  value={asset.mimeType ?? ""}
                />
              ) : null}
              {metadataFieldNames?.size ? (
                <input
                  type="hidden"
                  name={metadataFieldNames.size}
                  value={asset.size?.toString() ?? ""}
                />
              ) : null}
              {metadataFieldNames?.storagePath ? (
                <input
                  type="hidden"
                  name={metadataFieldNames.storagePath}
                  value={asset.storagePath ?? ""}
                />
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
