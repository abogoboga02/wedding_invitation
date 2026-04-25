import Link from "next/link";

import { forgotPasswordAction } from "@/app/(auth)/_actions/auth-actions";
import { ForgotPasswordForm } from "@/app/(auth)/_components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Link href="/" className="text-sm font-medium text-[var(--color-secondary)] lg:hidden">
          Kembali ke homepage
        </Link>
        <p className="text-sm uppercase tracking-[0.28em] text-[var(--color-rose-dark)]">
          Reset Access
        </p>
        <h1 className="font-serif-display text-4xl text-[var(--color-ink)]">
          Minta tautan reset password
        </h1>
        <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
          Masukkan email akun Anda. Sistem akan memakai flow reset password Supabase dan
          mengarahkan Anda kembali ke halaman ganti password setelah tautan dibuka.
        </p>
      </div>

      <ForgotPasswordForm action={forgotPasswordAction} />
    </div>
  );
}
