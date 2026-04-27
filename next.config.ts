import type { NextConfig } from "next";

const supabaseStorageBucket =
  process.env.SUPABASE_STORAGE_BUCKET?.trim() || "invitation-media";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseRemotePatterns = supabaseUrl
  ? [
      new URL(
        `/storage/v1/object/public/${supabaseStorageBucket}/**`,
        `${supabaseUrl.replace(/\/$/, "")}/`,
      ),
    ]
  : [];

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.80"],
  images: {
    remotePatterns: supabaseRemotePatterns,
  },
};

export default nextConfig;
