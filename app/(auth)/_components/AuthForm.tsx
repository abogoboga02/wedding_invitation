"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";

import { loginSchema, registerClientSchema } from "@/features/auth/auth.schema";
import { SubmitButton } from "@/components/ui/SubmitButton";

import type { AuthActionState } from "../_actions/auth-actions";

type AuthFormProps = {
  action: (
    state: AuthActionState,
    formData: FormData,
  ) => Promise<AuthActionState>;
  mode: "login" | "register";
};

type ClientErrors = Partial<
  Record<"name" | "identifier" | "email" | "password" | "confirmPassword", string>
>;

const initialState: AuthActionState = {};

function baseInputClass(hasError: boolean) {
  return `w-full rounded-[1.4rem] border bg-white px-4 py-3.5 text-sm outline-none ${
    hasError
      ? "border-[var(--color-error)] text-[var(--color-text-primary)]"
      : "border-[var(--color-border)] text-[var(--color-text-primary)] focus:border-[var(--color-primary-strong)]"
  }`;
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-[var(--color-error)]">{message}</p>;
}

export function AuthForm({ action, mode }: AuthFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const [clientErrors, setClientErrors] = useState<ClientErrors>({});
  const isRegister = mode === "register";

  const submitLabel = useMemo(
    () => (isRegister ? "Buat Akun & Mulai" : "Masuk ke Dashboard"),
    [isRegister],
  );

  return (
    <form
      action={formAction}
      className="space-y-5"
      onSubmit={(event) => {
        const formData = new FormData(event.currentTarget);

        if (isRegister) {
          const parsed = registerClientSchema.safeParse({
            name: formData.get("name"),
            email: formData.get("email"),
            password: formData.get("password"),
            confirmPassword: formData.get("confirmPassword"),
          });

          if (!parsed.success) {
            event.preventDefault();
            const errors = parsed.error.flatten().fieldErrors;
            setClientErrors({
              name: errors.name?.[0],
              email: errors.email?.[0],
              password: errors.password?.[0],
              confirmPassword: errors.confirmPassword?.[0],
            });
            return;
          }
        } else {
          const parsed = loginSchema.safeParse({
            identifier: formData.get("identifier"),
            password: formData.get("password"),
          });

          if (!parsed.success) {
            event.preventDefault();
            const errors = parsed.error.flatten().fieldErrors;
            setClientErrors({
              identifier: errors.identifier?.[0],
              password: errors.password?.[0],
            });
            return;
          }
        }

        setClientErrors({});
      }}
    >
      {isRegister ? (
        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">Nama Anda</span>
          <input
            name="name"
            type="text"
            required
            className={baseInputClass(Boolean(clientErrors.name))}
            placeholder="Contoh: Nadia"
          />
          <FieldError message={clientErrors.name} />
        </label>
      ) : null}

      {isRegister ? (
        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">Email</span>
          <input
            name="email"
            type="email"
            required
            className={baseInputClass(Boolean(clientErrors.email))}
            placeholder="nama@email.com"
          />
          <FieldError message={clientErrors.email} />
        </label>
      ) : (
        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            Email atau Username
          </span>
          <input
            name="identifier"
            type="text"
            required
            autoCapitalize="none"
            className={baseInputClass(Boolean(clientErrors.identifier))}
            placeholder="admin atau nama@email.com"
          />
          <FieldError message={clientErrors.identifier} />
        </label>
      )}

      <label className="block space-y-2">
        <span className="text-sm font-medium text-[var(--color-text-primary)]">Password</span>
        <input
          name="password"
          type="password"
          required
          minLength={isRegister ? 8 : 1}
          className={baseInputClass(Boolean(clientErrors.password))}
          placeholder={isRegister ? "Minimal 8 karakter" : "Masukkan password Anda"}
        />
        <FieldError message={clientErrors.password} />
      </label>

      {isRegister ? (
        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            Konfirmasi Password
          </span>
          <input
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            className={baseInputClass(Boolean(clientErrors.confirmPassword))}
            placeholder="Ulangi password Anda"
          />
          <FieldError message={clientErrors.confirmPassword} />
        </label>
      ) : (
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-[var(--color-secondary)]"
          >
            Lupa password?
          </Link>
        </div>
      )}

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

      <SubmitButton
        className="button-primary w-full rounded-full px-5 py-3.5 text-sm font-semibold"
        pendingLabel={isRegister ? "Membuat akun..." : "Masuk..."}
      >
        {submitLabel}
      </SubmitButton>

      <p className="text-center text-sm text-[var(--color-text-secondary)]">
        {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
        <Link
          href={isRegister ? "/login" : "/register"}
          className="font-semibold text-[var(--color-primary-strong)]"
        >
          {isRegister ? "Masuk di sini" : "Daftar sekarang"}
        </Link>
      </p>
    </form>
  );
}
