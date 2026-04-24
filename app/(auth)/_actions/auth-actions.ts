"use server";

import { AuthError } from "next-auth";
import { hash } from "bcryptjs";

import { signIn, signOut } from "@/auth";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/features/auth/auth.schema";
import { createDefaultInvitation } from "@/features/invitation/invitation.service";
import { prisma } from "@/lib/db/prisma";

export type AuthActionState = {
  error?: string;
  success?: string;
};

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

  try {
    await signIn("credentials", {
      identifier: parsedForm.data.identifier,
      password: parsedForm.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
        return {
          error:
            error.type === "CredentialsSignin"
              ? "Email/username atau password tidak cocok."
              : "Login belum berhasil. Coba lagi.",
        };
    }

    throw error;
  }

  return {};
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

  const existingUser = await prisma.user.findUnique({
    where: { email: parsedForm.data.email },
    select: { id: true },
  });

  if (existingUser) {
    return {
      error: "Email ini sudah terdaftar. Silakan masuk.",
    };
  }

  const passwordHash = await hash(parsedForm.data.password, 12);
  const user = await prisma.user.create({
    data: {
      name: parsedForm.data.name,
      email: parsedForm.data.email,
      passwordHash,
    },
  });

  await createDefaultInvitation(user.id, parsedForm.data.name);

  try {
    await signIn("credentials", {
      identifier: parsedForm.data.email,
      password: parsedForm.data.password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: "Akun berhasil dibuat, tetapi login otomatis belum berhasil.",
      };
    }

    throw error;
  }

  return {};
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
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

  return {
    success:
      "Jika email terdaftar, instruksi reset password akan dikirim. Untuk MVP, flow email masih berupa placeholder.",
  };
}

export async function resetPasswordAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsedForm = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsedForm.success) {
    const errors = parsedForm.error.flatten().fieldErrors;
    return {
      error:
        errors.token?.[0] ??
        errors.password?.[0] ??
        errors.confirmPassword?.[0] ??
        "Data reset password tidak valid.",
    };
  }

  return {
    success:
      "Password baru sudah tervalidasi. Untuk MVP, endpoint pergantian password final masih berupa placeholder.",
  };
}
