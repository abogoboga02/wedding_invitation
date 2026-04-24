import Link from "next/link";

import { resetPasswordAction } from "@/app/(auth)/_actions/auth-actions";
import { ResetPasswordForm } from "@/app/(auth)/_components/ResetPasswordForm";

export default async function ResetPasswordPage({
  searchParams,
}: PageProps<"/reset-password">) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : undefined;

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
          Gunakan token reset yang Anda terima, lalu masukkan password baru agar bisa kembali
          mengelola undangan.
        </p>
      </div>

      <ResetPasswordForm action={resetPasswordAction} token={token} />
    </div>
  );
}
