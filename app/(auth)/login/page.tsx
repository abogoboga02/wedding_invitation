import Link from "next/link";

import { loginAction } from "@/app/(auth)/_actions/auth-actions";
import { AuthForm } from "@/app/(auth)/_components/AuthForm";

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Link href="/" className="text-sm font-medium text-[var(--color-olive)] lg:hidden">
          Kembali ke homepage
        </Link>
        <p className="text-sm uppercase tracking-[0.28em] text-[var(--color-rose-dark)]">
          Masuk
        </p>
        <h1 className="font-serif-display text-4xl text-[var(--color-ink)]">
          Lanjutkan ke dashboard Anda
        </h1>
        <p className="text-sm leading-7 text-stone-600">
          Masuk untuk melanjutkan edit draft undangan, tamu, dan preview personal.
        </p>
      </div>

      <AuthForm mode="login" action={loginAction} />
    </div>
  );
}
