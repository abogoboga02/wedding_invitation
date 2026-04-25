import type {
  PostgrestMaybeSingleResponse,
  PostgrestResponse,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";

export function getSupabasePublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase public environment variables are not configured.");
  }

  return { url, key };
}

export function getSupabaseSecretKey() {
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error(
      "SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY must be configured for admin operations.",
    );
  }

  return key;
}

export function getSupabaseStorageBucket() {
  return process.env.SUPABASE_STORAGE_BUCKET?.trim() || "invitation-media";
}

export function unwrapList<T>(
  response: PostgrestResponse<T>,
  message = "Supabase query failed.",
) {
  if (response.error) {
    throw new Error(`${message} ${response.error.message}`);
  }

  return response.data;
}

export function unwrapSingle<T>(
  response: PostgrestSingleResponse<T>,
  message = "Supabase query failed.",
) {
  if (response.error) {
    throw new Error(`${message} ${response.error.message}`);
  }

  return response.data;
}

export function unwrapMaybeSingle<T>(
  response: PostgrestMaybeSingleResponse<T>,
  message = "Supabase query failed.",
) {
  if (response.error) {
    throw new Error(`${message} ${response.error.message}`);
  }

  return response.data;
}

export function toDate(value?: string | null) {
  return value ? new Date(value) : null;
}

export function coerceErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
