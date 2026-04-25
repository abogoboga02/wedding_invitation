"use server";

import { redirect } from "next/navigation";

import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/features/auth/auth.schema";
import { createDefaultInvitation } from "@/features/invitation/invitation.service";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { buildSiteHref } from "@/lib/utils/site-url";

export type AuthActionState = {
  error?: string;
  success?: string;
};

function isEmailIdentifier(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function resolveLoginEmail(identifier: string) {
  const normalizedIdentifier = identifier.trim().toLowerCase();

  if (isEmailIdentifier(normalizedIdentifier)) {
    return normalizedIdentifier;
  }

  const admin = getSupabaseAdminClient();
  const { data: adminUser } = await admin
    .from("users")
    .select("email")
    .eq("role", "ADMIN")
    .ilike("name", normalizedIdentifier)
    .maybeSingle();

  return adminUser?.email ?? normalizedIdentifier;
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsedForm = loginSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });

  if (!parsedForm.success) {
    const errors = parsedForm.error.flatten().fieldErrors;
    return {
      error: errors.identifier?.[0] ?? errors.password?.[0] ?? "Data login tidak valid.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const email = await resolveLoginEmail(parsedForm.data.identifier);
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: parsedForm.data.password,
  });

  if (error) {
    return {
      error: "Email/username atau password tidak cocok.",
    };
  }

  redirect("/dashboard");
}

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsedForm = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsedForm.success) {
    const errors = parsedForm.error.flatten().fieldErrors;
    return {
      error:
        errors.name?.[0] ??
        errors.email?.[0] ??
        errors.password?.[0] ??
        "Data registrasi belum lengkap.",
    };
  }

  const admin = getSupabaseAdminClient();
  const existingUser = await admin
    .from("users")
    .select("id")
    .eq("email", parsedForm.data.email)
    .maybeSingle();

  if (existingUser.data?.id) {
    return {
      error: "Email ini sudah terdaftar. Silakan masuk.",
    };
  }

  const { data: createdUser, error: createError } = await admin.auth.admin.createUser({
    email: parsedForm.data.email,
    password: parsedForm.data.password,
    email_confirm: true,
    user_metadata: {
      name: parsedForm.data.name,
    },
    app_metadata: {
      role: "CLIENT",
    },
  });

  if (createError || !createdUser.user?.id) {
    return {
      error:
        createError?.message === "A user with this email address has already been registered"
          ? "Email ini sudah terdaftar. Silakan masuk."
          : "Akun belum berhasil dibuat. Coba lagi.",
    };
  }

  const profileInsert = await admin
    .from("users")
    .upsert(
      {
        id: createdUser.user.id,
        name: parsedForm.data.name,
        email: parsedForm.data.email,
        role: "CLIENT",
      },
      {
        onConflict: "id",
      },
    )
    .select("id")
    .single();

  if (profileInsert.error) {
    return {
      error: "Akun auth berhasil dibuat, tetapi profil pengguna belum tersimpan.",
    };
  }

  try {
    await createDefaultInvitation(createdUser.user.id, parsedForm.data.name, admin);
  } catch {
    return {
      error: "Akun berhasil dibuat, tetapi draft undangan awal belum berhasil disiapkan.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const { error: loginError } = await supabase.auth.signInWithPassword({
    email: parsedForm.data.email,
    password: parsedForm.data.password,
  });

  if (loginError) {
    return {
      error: "Akun berhasil dibuat, tetapi login otomatis belum berhasil.",
    };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function forgotPasswordAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsedForm = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsedForm.success) {
    return {
      error: parsedForm.error.flatten().fieldErrors.email?.[0] ?? "Email tidak valid.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsedForm.data.email, {
    redirectTo: buildSiteHref("/auth/callback?next=/reset-password"),
  });

  if (error) {
    return {
      error: "Instruksi reset password belum berhasil dikirim.",
    };
  }

  return {
    success:
      "Jika email terdaftar, tautan reset password sudah dikirim. Cek inbox atau spam Anda.",
  };
}

export async function resetPasswordAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsedForm = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsedForm.success) {
    const errors = parsedForm.error.flatten().fieldErrors;
    return {
      error:
        errors.password?.[0] ??
        errors.confirmPassword?.[0] ??
        "Data reset password tidak valid.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Sesi reset password tidak ditemukan. Minta tautan reset baru terlebih dahulu.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsedForm.data.password,
  });

  if (error) {
    return {
      error: "Password baru belum berhasil disimpan.",
    };
  }

  return {
    success: "Password berhasil diperbarui. Anda bisa langsung melanjutkan ke dashboard.",
  };
}
