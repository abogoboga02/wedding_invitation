import { redirect } from "next/navigation";
import { cache } from "react";

import type { AuthenticatedAppUser } from "@/lib/domain/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const getAuthenticatedSessionUser = cache(async (): Promise<AuthenticatedAppUser> => {
  const supabase = await createServerSupabaseClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const claims = claimsData?.claims;

  if (!claims?.sub) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id, name, email, role")
    .eq("id", claims.sub)
    .maybeSingle();

  return {
    id: claims.sub,
    name: profile?.name ?? claims.user_metadata?.name ?? null,
    email: profile?.email ?? claims.email ?? null,
    role:
      profile?.role ??
      (claims.app_metadata?.role === "ADMIN" || claims.user_metadata?.role === "ADMIN"
        ? "ADMIN"
        : "CLIENT"),
  };
});

export async function requireAuthenticatedUser() {
  return getAuthenticatedSessionUser();
}

export async function requireClientUser() {
  const user = await getAuthenticatedSessionUser();

  if (user.role !== "CLIENT") {
    redirect("/admin");
  }

  return user;
}

export async function requireAdminUser() {
  const user = await getAuthenticatedSessionUser();

  if (user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return user;
}
