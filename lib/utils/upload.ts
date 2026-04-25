import { randomUUID } from "node:crypto";
import path from "node:path";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseStorageBucket } from "@/lib/supabase/helpers";

export type UploadKind = "cover" | "gallery" | "music";

export type StoredUploadAsset = {
  url: string;
  storagePath: string;
  mimeType: string;
  size: number;
  originalName: string;
};

const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MUSIC_MIME_TYPES = ["audio/mpeg", "audio/mp4", "audio/ogg", "audio/wav"] as const;

const UPLOAD_RULES: Record<
  UploadKind,
  { maxSizeInBytes: number; mimeTypes: readonly string[]; directory: string }
> = {
  cover: {
    maxSizeInBytes: 6 * 1024 * 1024,
    mimeTypes: IMAGE_MIME_TYPES,
    directory: "cover",
  },
  gallery: {
    maxSizeInBytes: 6 * 1024 * 1024,
    mimeTypes: IMAGE_MIME_TYPES,
    directory: "gallery",
  },
  music: {
    maxSizeInBytes: 12 * 1024 * 1024,
    mimeTypes: MUSIC_MIME_TYPES,
    directory: "music",
  },
};

const MIME_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "audio/mpeg": ".mp3",
  "audio/mp4": ".m4a",
  "audio/ogg": ".ogg",
  "audio/wav": ".wav",
};

export function getUploadValidationRule(kind: UploadKind) {
  return UPLOAD_RULES[kind];
}

export function validateUploadFile(file: File, kind: UploadKind) {
  const rule = getUploadValidationRule(kind);

  if (!rule.mimeTypes.includes(file.type)) {
    const label = kind === "music" ? "audio" : "gambar";
    throw new Error(`Format ${label} tidak didukung.`);
  }

  if (file.size > rule.maxSizeInBytes) {
    const maxMb = Math.round(rule.maxSizeInBytes / (1024 * 1024));
    throw new Error(`Ukuran file maksimal ${maxMb}MB.`);
  }
}

function sanitizeBaseFilename(name: string) {
  return name
    .toLowerCase()
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function buildSafeFilename(file: File) {
  const baseName = sanitizeBaseFilename(file.name) || "asset";
  const extension = MIME_EXTENSION_MAP[file.type] ?? path.extname(file.name) ?? "";
  return `${Date.now()}-${baseName}-${randomUUID()}${extension}`;
}

export async function storeUploadedFiles({
  files,
  ownerId,
  invitationId,
  kind,
}: {
  files: File[];
  ownerId: string;
  invitationId: string;
  kind: UploadKind;
}) {
  if (files.length === 0) {
    return [];
  }

  const rule = getUploadValidationRule(kind);
  const bucket = getSupabaseStorageBucket();
  const admin = getSupabaseAdminClient();
  const assets: StoredUploadAsset[] = [];

  for (const file of files) {
    validateUploadFile(file, kind);

    const safeFilename = buildSafeFilename(file);
    const storagePath = `${ownerId}/${invitationId}/${rule.directory}/${safeFilename}`;
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const { error } = await admin.storage.from(bucket).upload(storagePath, fileBuffer, {
      contentType: file.type,
      upsert: false,
    });

    if (error) {
      throw new Error(`Upload ke storage gagal. ${error.message}`);
    }

    const { data } = admin.storage.from(bucket).getPublicUrl(storagePath);

    assets.push({
      url: data.publicUrl,
      storagePath,
      mimeType: file.type,
      size: file.size,
      originalName: file.name,
    });
  }

  return assets;
}

export async function deleteStoredFiles(storagePaths: Array<string | null | undefined>) {
  const paths = [...new Set(storagePaths.filter((item): item is string => Boolean(item?.trim())))];

  if (paths.length === 0) {
    return;
  }

  const admin = getSupabaseAdminClient();
  const bucket = getSupabaseStorageBucket();
  const { error } = await admin.storage.from(bucket).remove(paths);

  if (error) {
    throw new Error(`Gagal menghapus file lama di storage. ${error.message}`);
  }
}
