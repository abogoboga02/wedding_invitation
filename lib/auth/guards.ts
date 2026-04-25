import { redirect } from "next/navigation";

import type { AuthenticatedAppUser } from "@/lib/domain/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function getAuthenticatedSessionUser(): Promise<AuthenticatedAppUser> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.id) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("id, name, email, role")
    .eq("id", authUser.id)
    .maybeSingle();

  return {
    id: authUser.id,
    name: profile?.name ?? authUser.user_metadata.name ?? null,
    email: profile?.email ?? authUser.email ?? null,
    role:
      profile?.role ??
      (authUser.app_metadata.role === "ADMIN" || authUser.user_metadata.role === "ADMIN"
        ? "ADMIN"
        : "CLIENT"),
  };
}

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
