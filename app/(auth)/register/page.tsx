import Link from "next/link";

import { registerAction } from "@/app/(auth)/_actions/auth-actions";
import { AuthForm } from "@/app/(auth)/_components/AuthForm";

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Link href="/" className="text-sm font-medium text-[var(--color-olive)] lg:hidden">
          Kembali ke homepage
        </Link>
        <p className="text-sm uppercase tracking-[0.28em] text-[var(--color-rose-dark)]">
          Buat Akun
        </p>
        <h1 className="font-serif-display text-4xl text-[var(--color-ink)]">
          Mulai undangan digital pertama Anda
        </h1>
        <p className="text-sm leading-7 text-stone-600">
          Setelah daftar, sistem langsung membuat draft undangan awal agar Anda bisa
          memilih template dan mulai mengisi data tanpa langkah tambahan.
        </p>
      </div>

      <AuthForm mode="register" action={registerAction} />
    </div>
  );
}
