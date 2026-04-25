"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { resetPasswordSchema } from "@/features/auth/auth.schema";
import { SubmitButton } from "@/components/ui/SubmitButton";

import type { AuthActionState } from "../_actions/auth-actions";

type ResetPasswordFormProps = {
  action: (
    state: AuthActionState,
    formData: FormData,
  ) => Promise<AuthActionState>;
};

type ClientErrors = Partial<Record<"password" | "confirmPassword", string>>;

const initialState: AuthActionState = {};

export function ResetPasswordForm({ action }: ResetPasswordFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const [clientErrors, setClientErrors] = useState<ClientErrors>({});

  return (
    <form
      action={formAction}
      className="space-y-5"
      onSubmit={(event) => {
        const formData = new FormData(event.currentTarget);
        const parsed = resetPasswordSchema.safeParse({
          password: formData.get("password"),
          confirmPassword: formData.get("confirmPassword"),
        });

        if (!parsed.success) {
          event.preventDefault();
          const errors = parsed.error.flatten().fieldErrors;
          setClientErrors({
            password: errors.password?.[0],
            confirmPassword: errors.confirmPassword?.[0],
          });
          return;
        }

        setClientErrors({});
      }}
    >
      <label className="block space-y-2">
        <span className="text-sm font-medium text-[var(--color-text-primary)]">Password baru</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="Minimal 8 karakter"
          className={`w-full rounded-[1.4rem] border bg-white px-4 py-3.5 text-sm outline-none ${
            clientErrors.password
              ? "border-[var(--color-error)]"
              : "border-[var(--color-border)] focus:border-[var(--color-primary-strong)]"
          }`}
        />
        {clientErrors.password ? (
          <p className="text-sm text-[var(--color-error)]">{clientErrors.password}</p>
        ) : null}
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-[var(--color-text-primary)]">
          Konfirmasi password baru
        </span>
        <input
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          placeholder="Ulangi password baru"
          className={`w-full rounded-[1.4rem] border bg-white px-4 py-3.5 text-sm outline-none ${
            clientErrors.confirmPassword
              ? "border-[var(--color-error)]"
              : "border-[var(--color-border)] focus:border-[var(--color-primary-strong)]"
          }`}
        />
        {clientErrors.confirmPassword ? (
          <p className="text-sm text-[var(--color-error)]">{clientErrors.confirmPassword}</p>
        ) : null}
      </label>

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
        pendingLabel="Menyimpan password baru..."
      >
        Simpan Password Baru
      </SubmitButton>

      <p className="text-center text-sm text-[var(--color-text-secondary)]">
        Kembali ke{" "}
        <Link href="/login" className="font-semibold text-[var(--color-primary-strong)]">
          halaman login
        </Link>
      </p>
    </form>
  );
}
