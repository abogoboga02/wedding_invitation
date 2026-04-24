"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { forgotPasswordSchema } from "@/features/auth/auth.schema";
import { SubmitButton } from "@/components/ui/SubmitButton";

import type { AuthActionState } from "../_actions/auth-actions";

type ForgotPasswordFormProps = {
  action: (
    state: AuthActionState,
    formData: FormData,
  ) => Promise<AuthActionState>;
};

const initialState: AuthActionState = {};

export function ForgotPasswordForm({ action }: ForgotPasswordFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const [emailError, setEmailError] = useState<string>();

  return (
    <form
      action={formAction}
      className="space-y-5"
      onSubmit={(event) => {
        const formData = new FormData(event.currentTarget);
        const parsed = forgotPasswordSchema.safeParse({
          email: formData.get("email"),
        });

        if (!parsed.success) {
          event.preventDefault();
          setEmailError(parsed.error.flatten().fieldErrors.email?.[0]);
          return;
        }

        setEmailError(undefined);
      }}
    >
      <label className="block space-y-2">
        <span className="text-sm font-medium text-[var(--color-text-primary)]">Email akun</span>
        <input
          name="email"
          type="email"
          required
          placeholder="nama@email.com"
          className={`w-full rounded-[1.4rem] border bg-white px-4 py-3.5 text-sm outline-none ${
            emailError
              ? "border-[var(--color-error)]"
              : "border-[var(--color-border)] focus:border-[var(--color-primary-strong)]"
          }`}
        />
        {emailError ? <p className="text-sm text-[var(--color-error)]">{emailError}</p> : null}
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
        pendingLabel="Menyiapkan instruksi..."
      >
        Kirim Instruksi Reset
      </SubmitButton>

      <p className="text-center text-sm text-[var(--color-text-secondary)]">
        Sudah ingat password?{" "}
        <Link href="/login" className="font-semibold text-[var(--color-primary-strong)]">
          Kembali ke login
        </Link>
      </p>
    </form>
  );
}
