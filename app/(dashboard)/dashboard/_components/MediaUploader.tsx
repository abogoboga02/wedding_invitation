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
  initialAssets?: MediaAsset[];
  metadataFieldNames?: Partial<Record<"originalName" | "mimeType" | "size" | "storagePath", string>>;
  onUploadStateChange?: (isUploading: boolean) => void;
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

export function MediaUploader({
  label,
  helperText,
  name,
  kind,
  multiple = false,
  initialAssets = [],
  metadataFieldNames,
  onUploadStateChange,
}: MediaUploaderProps) {
  const [assets, setAssets] = useState(initialAssets);
  const [error, setError] = useState<string>();
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const inputAccept = useMemo(() => {
    if (kind === "music") {
      return "audio/mpeg,audio/mp4,audio/ogg,audio/wav";
    }

    return "image/jpeg,image/png,image/webp";
  }, [kind]);

  async function compressImageFile(file: File): Promise<File> {
    if (kind === "music" || file.size <= 350 * 1024 || !file.type.startsWith("image/")) {
      return file;
    }

    const objectUrl = URL.createObjectURL(file);

    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const nextImage = new window.Image();
        nextImage.onload = () => resolve(nextImage);
        nextImage.onerror = () => reject(new Error("Gagal membaca gambar."));
        nextImage.src = objectUrl;
      });

      const maxDimension = 2000;
      const scale = Math.min(maxDimension / image.width, maxDimension / image.height, 1);
      const targetWidth = Math.max(1, Math.round(image.width * scale));
      const targetHeight = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const context = canvas.getContext("2d");

      if (!context) {
        return file;
      }

      context.drawImage(image, 0, 0, targetWidth, targetHeight);

      const compressedBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/webp", 0.82);
      });

      if (!compressedBlob || compressedBlob.size >= file.size) {
        return file;
      }

      const compressedFileName = file.name.replace(/\.[a-zA-Z0-9]+$/, "") || "image";

      return new File([compressedBlob], `${compressedFileName}.webp`, {
        type: "image/webp",
      });
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  async function uploadFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);

    if (files.length === 0) {
      return;
    }

    setError(undefined);
    setIsUploading(true);
    setUploadProgress(0);
    onUploadStateChange?.(true);

    const optimizedFiles =
      kind === "music" ? files : await Promise.all(files.map((file) => compressImageFile(file)));

    const uniqueFiles = optimizedFiles.filter((file) => {
      const alreadyExists = assets.some(
        (asset) =>
          asset.originalName === file.name &&
          asset.size === file.size &&
          asset.mimeType === file.type,
      );

      return !alreadyExists;
    });

    if (uniqueFiles.length === 0) {
      setError("File yang sama sudah ada. Pilih file lain untuk diunggah.");
      setIsUploading(false);
      setUploadProgress(null);
      onUploadStateChange?.(false);
      return;
    }

    const payload = new FormData();
    payload.append("kind", kind);
    uniqueFiles.forEach((file) => payload.append("files", file));

    startTransition(async () => {
      try {
        const response = await new Promise<Response>((resolve, reject) => {
          const request = new XMLHttpRequest();
          request.open("POST", "/api/uploads");
          request.responseType = "text";
          request.upload.onprogress = (event) => {
            if (!event.lengthComputable) {
              return;
            }

            setUploadProgress(Math.round((event.loaded / event.total) * 100));
          };
          request.onload = () => {
            resolve(
              new Response(request.responseText, {
                status: request.status,
                statusText: request.statusText,
                headers: {
                  "Content-Type": "application/json",
                },
              }),
            );
          };
          request.onerror = () => reject(new Error("Gagal terhubung ke server upload."));
          request.send(payload);
        });

        const data = (await response.json()) as {
          error?: string;
          assets?: MediaAsset[];
        };

        if (!response.ok || !data.assets) {
          setError(data.error ?? "Upload belum berhasil.");
          setIsUploading(false);
          setUploadProgress(null);
          onUploadStateChange?.(false);
          return;
        }

        const uploadedAssets = data.assets;

        setAssets((currentAssets) =>
          multiple ? [...currentAssets, ...uploadedAssets] : uploadedAssets.slice(0, 1),
        );
        setIsUploading(false);
        setUploadProgress(null);
        onUploadStateChange?.(false);
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : "Upload belum berhasil.");
        setIsUploading(false);
        setUploadProgress(null);
        onUploadStateChange?.(false);
      }
    });
  }

  function removeAsset(targetUrl: string) {
    setAssets((currentAssets) => currentAssets.filter((asset) => asset.url !== targetUrl));
  }

  function moveAsset(targetIndex: number, direction: "left" | "right") {
    setAssets((currentAssets) => {
      const nextIndex = direction === "left" ? targetIndex - 1 : targetIndex + 1;

      if (nextIndex < 0 || nextIndex >= currentAssets.length) {
        return currentAssets;
      }

      const clonedAssets = [...currentAssets];
      const currentAsset = clonedAssets[targetIndex];
      clonedAssets[targetIndex] = clonedAssets[nextIndex];
      clonedAssets[nextIndex] = currentAsset;
      return clonedAssets;
    });
  }

  return (
    <div className="space-y-4 rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-surface-alt)]/70 p-5">
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-[var(--color-text-primary)]">{label}</h3>
        <p className="text-sm leading-7 text-[var(--color-text-secondary)]">{helperText}</p>
      </div>

      <label
        className={`flex min-h-36 flex-col items-center justify-center rounded-[1.6rem] border border-dashed px-4 py-6 text-center transition ${
          isDragging
            ? "border-[var(--color-primary-strong)] bg-white"
            : "border-[var(--color-border)] bg-white"
        } ${isUploading ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
        onDragOver={(event) => {
          if (isUploading) {
            return;
          }
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          if (isUploading) {
            return;
          }
          event.preventDefault();
          setIsDragging(false);
          void uploadFiles(event.dataTransfer.files);
        }}
      >
        <input
          type="file"
          accept={inputAccept}
          multiple={multiple}
          disabled={isUploading}
          onChange={(event) => {
            if (event.target.files?.length) {
              void uploadFiles(event.target.files);
              event.target.value = "";
            }
          }}
          className="sr-only"
        />
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">
          {isUploading
            ? `Mengunggah file${uploadProgress !== null ? ` (${uploadProgress}%)` : "..."}`
            : "Drag & drop atau pilih file"}
        </p>
        <p className="mt-2 max-w-sm text-xs leading-6 text-[var(--color-text-secondary)]">
          {kind === "music"
            ? "Mendukung MP3, M4A, OGG, atau WAV hingga 12MB."
            : "Mendukung JPG, PNG, atau WEBP hingga 6MB per file."}
        </p>
      </label>

      {error ? (
        <p className="rounded-[1.3rem] border border-[rgba(181,87,99,0.2)] bg-[rgba(181,87,99,0.08)] px-4 py-3 text-sm text-[var(--color-error)]">
          {error}
        </p>
      ) : null}

      {assets.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {assets.map((asset, index) => (
            <div
              key={`${asset.url}-${index}`}
              className="overflow-hidden rounded-[1.5rem] border border-[var(--color-border)] bg-white"
            >
              {kind === "music" ? (
                <div className="space-y-4 p-4">
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {asset.originalName ?? "Audio undangan"}
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
                <div className="relative aspect-[4/3] bg-stone-100">
                  <Image
                    src={asset.url}
                    alt={asset.originalName ?? label}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-[var(--color-text-primary)]">
                    {asset.originalName ?? asset.url}
                  </p>
                  {kind !== "music" ? (
                    <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                      {formatFileSize(asset.size) ?? "Gambar siap dipakai"}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  {multiple ? (
                    <>
                  <button
                    type="button"
                    onClick={() => moveAsset(index, "left")}
                    disabled={isUploading}
                    className={buttonClass()}
                  >
                        Geser kiri
                      </button>
                      <button
                        type="button"
                        onClick={() => moveAsset(index, "right")}
                        disabled={isUploading}
                        className={buttonClass()}
                      >
                        Geser kanan
                      </button>
                    </>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => removeAsset(asset.url)}
                    disabled={isUploading}
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
