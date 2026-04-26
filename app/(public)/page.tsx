import Link from "next/link";

import { TEMPLATE_OPTIONS } from "@/lib/constants/invitation";
import { PRICING_PLANS } from "@/lib/constants/pricing";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import { MobileMenu } from "./_components/MobileMenu";
import { ScrollReveal } from "./_components/ScrollReveal";
import { SectionIntro } from "./_components/SectionIntro";
import { AtelierAmoraLogo } from "./_components/AtelierAmoraLogo";
import { TemplateShowcaseCard } from "./_components/TemplateShowcaseCard";

const navigationLeft = [
  { href: "#template", label: "Template" },
  { href: "#pricing", label: "Harga" },
];

const navigationRight = [
  { href: "#cta", label: "Mulai" },
];

const footerLinks = [
  { href: "#template", label: "Template" },
  { href: "#pricing", label: "Harga" },
  { href: "#cta", label: "Mulai" },
  { href: "/login", label: "Masuk" },
];

const LANDING_TEMPLATE_LIMIT = 8;

export default async function MarketingPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();
  const landingTemplates = TEMPLATE_OPTIONS.slice(0, LANDING_TEMPLATE_LIMIT);

  return (
    <main className="editorial-shell flex-1">
      <div className="mx-auto max-w-7xl px-4 pb-2 pt-5 sm:px-6 lg:px-8">
        <header className="surface-panel sticky top-4 z-30 rounded-full px-4 py-3 sm:px-5">
          <div className="grid grid-cols-[auto_1fr_auto] items-center md:grid-cols-[1fr_auto_1fr]">
            <nav className="hidden items-center gap-6 text-sm text-[var(--color-text-secondary)] md:flex">
              {navigationLeft.map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-[var(--color-text-primary)]">
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="justify-self-start md:hidden">
              <MobileMenu />
            </div>

            <div className="justify-self-center text-center">
              <AtelierAmoraLogo compact />
            </div>

            <div className="hidden items-center justify-end gap-4 md:flex">
              <nav className="flex items-center gap-6 text-sm text-[var(--color-text-secondary)]">
                {navigationRight.map((item) => (
                  <Link key={item.href} href={item.href} className="hover:text-[var(--color-text-primary)]">
                    {item.label}
                  </Link>
                ))}
                <Link href="/login" className="hover:text-[var(--color-text-primary)]">
                  Masuk
                </Link>
              </nav>
              <Link
                href="/register"
                className="button-primary rounded-full px-5 py-3 text-sm font-semibold"
              >
                Mulai Gratis
              </Link>
            </div>
          </div>
        </header>

        <section className="pb-8 pt-14 sm:pt-[4.5rem] lg:pt-24">
          <ScrollReveal className="mx-auto max-w-5xl text-center">
            <div className="mx-auto flex max-w-max items-center gap-3 rounded-full border border-[rgba(200,125,135,0.16)] bg-white/70 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--color-secondary)] shadow-[0_10px_28px_rgba(141,85,96,0.08)]">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[var(--color-primary-strong)]" />
              Tool Undangan Digital Personal
            </div>
            <p className="mt-4 text-xs text-[var(--color-text-secondary)]">
              Supabase session: {supabaseUser ? `aktif sebagai ${supabaseUser.email}` : "belum login"}
            </p>
            <h1 className="mt-7 font-serif-display text-balance text-[3.5rem] leading-[0.88] text-[var(--color-text-primary)] sm:text-[4.9rem] lg:text-[6.4rem]">
              Undangan yang terasa lebih intim, lebih premium, dan lebih hidup sejak link pertama dibuka.
            </h1>
            <p className="mx-auto mt-7 max-w-3xl text-base leading-8 text-[var(--color-text-secondary)] sm:text-lg">
              Rancang undangan digital yang ringan dibuka di ponsel, indah dilihat, dan
              personal lewat link tamu unik seperti <code>/alya-dan-raka/bu-rina</code>.
              Semua terasa rapi dari draft, preview, sampai RSVP masuk kembali ke dashboard.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="button-primary button-primary-emphasis inline-flex min-w-[15rem] justify-center rounded-full px-7 py-4 text-sm font-semibold sm:text-base"
              >
                Buat Undangan Pertama
              </Link>
              <Link
                href="#template"
                className="button-secondary inline-flex rounded-full px-6 py-4 text-sm font-semibold"
              >
                Lihat Showcase Template
              </Link>
            </div>

            <p className="mt-4 text-xs uppercase tracking-[0.24em] text-[var(--color-secondary)]/80 sm:text-sm">
              Mulai gratis, simpan draft, lalu publish saat semuanya siap.
            </p>
          </ScrollReveal>

          <div className="md:hidden" />
        </section>
      </div>

      <section id="template" className="section-shell section-spacing mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionIntro
            eyebrow="Template Showcase"
            title="Template unggulan yang siap dipamerkan di landing page."
            description="Setiap template dirancang untuk tetap terasa premium di layar ponsel, sambil memakai data undangan yang sama agar pasangan bebas ganti suasana kapan saja."
            align="center"
          />
        </ScrollReveal>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {landingTemplates.map((template, index) => (
            <TemplateShowcaseCard key={template.id} template={template} index={index} />
          ))}
        </div>

        <ScrollReveal className="mt-8 flex justify-center" delay={220}>
          <Link
            href="/templates"
            className="button-secondary inline-flex rounded-full px-6 py-3 text-sm font-semibold"
          >
            Lihat Semua Template
          </Link>
        </ScrollReveal>

        <ScrollReveal
          className="mt-6 rounded-[2.3rem] border border-dashed border-[var(--color-border)] bg-white/40 p-6"
          delay={260}
        >
          <div className="flex h-full flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div className="max-w-xl">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-secondary)]">
                Template Engine
              </p>
              <h3 className="mt-3 font-serif-display text-3xl text-[var(--color-text-primary)]">
                Satu data, banyak nuansa visual.
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">
                Struktur konten disimpan sekali, lalu diterjemahkan ke tampilan yang berbeda
                tanpa memaksa pasangan mengulang input.
              </p>
            </div>
            <Link
              href="/register"
              className="button-secondary inline-flex rounded-full px-5 py-3 text-sm font-semibold"
            >
              Coba di Dashboard
            </Link>
          </div>
        </ScrollReveal>
      </section>

      <section id="pricing" className="section-shell section-spacing mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionIntro
            eyebrow="Pricing"
            title="Harga dibuat sederhana agar pasangan cepat mengambil keputusan."
            description="Struktur paket menekankan kejelasan: mulai gratis untuk mencoba, lalu upgrade saat siap mengirim undangan dengan alur yang lebih lengkap."
            align="center"
          />
        </ScrollReveal>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {PRICING_PLANS.map((plan, index) => (
            <ScrollReveal
              key={plan.name}
              className={`rounded-[2.3rem] p-6 ${
                plan.featured
                  ? "border border-[rgba(38,72,77,0.2)] bg-[linear-gradient(160deg,#fffefb,#e7e1d8_60%,#cfadc0_135%)] shadow-[var(--shadow-float)]"
                  : "surface-card"
              }`}
              delay={index * 90}
            >
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-secondary)]">
                {plan.name}
              </p>
              <div className="mt-4">
                <p className="font-serif-display text-5xl leading-none text-[var(--color-text-primary)]">
                  {plan.priceLabel}
                </p>
                <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">
                  {plan.caption}
                </p>
              </div>

              <div className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <p
                    key={feature}
                    className="rounded-[1.25rem] bg-white/68 px-4 py-3 text-sm text-[var(--color-text-primary)]"
                  >
                    {feature}
                  </p>
                ))}
              </div>

              <Link
                href={plan.href}
                className={`mt-8 inline-flex w-full justify-center rounded-full px-5 py-3 text-sm font-semibold ${
                  plan.featured ? "button-primary" : "button-secondary"
                }`}
              >
                {plan.cta}
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section id="cta" className="section-shell section-spacing mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="surface-panel rounded-[var(--radius-panel)] px-6 py-10 sm:px-8 lg:px-14 lg:py-14">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-secondary)]">
              Siap Diluncurkan
            </p>
            <h2 className="mt-4 font-serif-display text-balance text-4xl leading-none text-[var(--color-text-primary)] sm:text-5xl">
              Buat undangan pertama yang tidak sekadar indah, tetapi juga terasa personal untuk
              tamu yang menerimanya.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[var(--color-text-secondary)]">
              Mulai dari draft gratis, pilih template, isi detail acara, lalu kirim link tamu
              unik saat semuanya sudah siap.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="button-primary inline-flex rounded-full px-6 py-3.5 text-sm font-semibold"
              >
                Mulai Rancang Undangan
              </Link>
              <Link
                href="/login"
                className="button-secondary inline-flex rounded-full px-6 py-3.5 text-sm font-semibold"
              >
                Saya Sudah Punya Akun
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <footer className="border-t border-[var(--color-border)] bg-white/56">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8">
          <div>
            <AtelierAmoraLogo className="w-fit" />
            <p className="mt-3 max-w-md text-sm leading-7 text-[var(--color-text-secondary)]">
              Tool undangan digital personal untuk pasangan yang ingin pengalaman tamu terasa
              lebih hangat, rapi, dan premium sejak link pertama dibuka.
            </p>
          </div>

          <div className="grid gap-3 text-sm text-[var(--color-text-secondary)] sm:grid-cols-2 lg:text-right">
            {footerLinks.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-[var(--color-text-primary)]">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="border-t border-[var(--color-border)] px-4 py-4 text-center text-xs uppercase tracking-[0.24em] text-[var(--color-text-secondary)] sm:px-6 lg:px-8">
          Dibuat untuk momen yang intim, dibuka dengan nyaman di ponsel.
        </div>
      </footer>
    </main>
  );
}
