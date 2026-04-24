import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="editorial-shell flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-5xl overflow-hidden rounded-[2.75rem] border border-white/70 bg-white/90 shadow-[0_36px_110px_rgba(0,0,0,0.10)] lg:grid lg:grid-cols-[1.1fr_0.9fr]">
        <section className="hidden bg-[linear-gradient(160deg,#fffefb,#e7e1d8_48%,#cfadc0)] p-10 lg:flex lg:flex-col lg:justify-between">
          <div className="space-y-4">
            <p className="font-serif-display text-3xl uppercase tracking-[0.18em] text-[var(--color-rose-dark)]">
              Atelier Amora
            </p>
            <h1 className="font-serif-display text-5xl leading-none text-[var(--color-ink)]">
              Dashboard ringan untuk membangun undangan yang terasa personal.
            </h1>
            <p className="max-w-md text-base leading-8 text-stone-700">
              Pilih template, isi data acara, upload foto inti, lalu generate link tamu
              personal secara otomatis.
            </p>
          </div>
          <Link href="/" className="text-sm font-semibold text-[var(--color-olive)]">
            Kembali ke homepage
          </Link>
        </section>

        <section className="p-6 sm:p-8 lg:p-10">{children}</section>
      </div>
    </main>
  );
}
