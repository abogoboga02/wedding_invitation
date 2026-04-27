import Link from "next/link";

export default function PublicInvitationNotFound() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fdfaf7,#ffffff)] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-xl rounded-[2.2rem] border border-[var(--color-border)] bg-white p-8 text-center shadow-[0_24px_70px_rgba(0,0,0,0.06)]">
        <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-rose-dark)]">404</p>
        <h1 className="mt-3 font-serif-display text-4xl text-[var(--color-text-primary)]">
          Link undangan tidak ditemukan
        </h1>
        <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">
          Bisa jadi slug pasangan tidak cocok, atau undangan memang belum dipublish.
        </p>
        <Link
          href="/"
          className="button-primary mt-6 inline-flex rounded-full px-5 py-3 text-sm font-semibold"
        >
          Kembali ke Homepage
        </Link>
      </div>
    </main>
  );
}
