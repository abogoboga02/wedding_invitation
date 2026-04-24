import Link from "next/link";

export default function NotFound() {
  return (
    <main className="editorial-shell flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      <div className="max-w-xl rounded-[2.75rem] border border-white/70 bg-white/90 p-8 text-center shadow-[0_36px_110px_rgba(0,0,0,0.10)] sm:p-10">
        <p className="text-sm uppercase tracking-[0.28em] text-[var(--color-rose-dark)]">
          Undangan Tidak Ditemukan
        </p>
        <h1 className="mt-4 font-serif-display text-5xl text-[var(--color-ink)]">
          Link ini belum tersedia
        </h1>
        <p className="mt-4 text-sm leading-7 text-stone-600">
          Pastikan slug pasangan dan slug tamu benar, atau undangan sudah dipublikasikan.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-[var(--color-olive)] px-6 py-3 text-sm font-semibold text-white"
        >
          Kembali ke Homepage
        </Link>
      </div>
    </main>
  );
}
