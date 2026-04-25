import Link from "next/link";

import { resetPasswordAction } from "@/app/(auth)/_actions/auth-actions";
import { ResetPasswordForm } from "@/app/(auth)/_components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Link href="/" className="text-sm font-medium text-[var(--color-secondary)] lg:hidden">
          Kembali ke homepage
        </Link>
        <p className="text-sm uppercase tracking-[0.28em] text-[var(--color-rose-dark)]">
          Password Baru
        </p>
        <h1 className="font-serif-display text-4xl text-[var(--color-ink)]">
          Atur ulang akses ke dashboard
        </h1>
        <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
          Setelah membuka tautan reset dari email Supabase, masukkan password baru untuk
          melanjutkan akses ke dashboard Anda.
        </p>
      </div>

      <ResetPasswordForm action={resetPasswordAction} />
    </div>
  );
}
