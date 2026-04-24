import type { CSSProperties } from "react";

import Link from "next/link";

import { TEMPLATE_OPTIONS } from "@/lib/constants/invitation";
import { PRICING_PLANS } from "@/lib/constants/pricing";
import { createClient as createSupabaseClient } from "@/utils/supabase/server";

import { MobileMenu } from "./_components/MobileMenu";
import { ScrollReveal } from "./_components/ScrollReveal";
import { SectionIntro } from "./_components/SectionIntro";
import { AtelierAmoraLogo } from "./_components/AtelierAmoraLogo";

const navigationLeft = [
  { href: "#template", label: "Template" },
  { href: "#why-us", label: "Keunggulan" },
];

const navigationRight = [
  { href: "#flow", label: "Cara Kerja" },
  { href: "#pricing", label: "Harga" },
];

const whyChooseUs = [
  {
    title: "Personal link yang terasa intim",
    description:
      "Setiap tamu menerima halaman dengan sapaan yang relevan, sehingga undangan terasa lebih personal sejak pertama dibuka.",
  },
  {
    title: "Dashboard ringan untuk pasangan sibuk",
    description:
      "Isi data inti, unggah foto, atur lagu, lalu preview dalam alur yang pendek dan jelas tanpa panel yang berlebihan.",
  },
  {
    title: "Preview dan halaman publik selalu sinkron",
    description:
      "Renderer yang sama dipakai di dashboard dan link tamu agar yang Anda lihat saat preview sama dengan yang diterima tamu.",
  },
];

const flowSteps = [
  {
    step: "01",
    title: "Pilih visual yang paling mewakili suasana hari Anda",
    description:
      "Mulai dari tiga template yang siap dipakai, lalu ganti kapan saja tanpa kehilangan data undangan.",
  },
  {
    step: "02",
    title: "Isi detail acara, unggah foto, dan atur musik pembuka",
    description:
      "Sistem menjaga form tetap ringkas agar pasangan bisa fokus pada konten yang benar-benar penting.",
  },
  {
    step: "03",
    title: "Import daftar tamu lalu hasilkan link personal otomatis",
    description:
      "Setiap tamu mendapat URL unik dengan slug sendiri untuk pengalaman undangan yang lebih hangat dan relevan.",
  },
  {
    step: "04",
    title: "Kirim dan pantau RSVP, open rate, dan interaksi tamu",
    description:
      "Begitu undangan dipublikasikan, Anda bisa melihat respons tamu dan performa undangan dari satu dashboard.",
  },
];

const footerLinks = [
  { href: "#template", label: "Template" },
  { href: "#why-us", label: "Keunggulan" },
  { href: "#flow", label: "Cara Kerja" },
  { href: "#pricing", label: "Harga" },
  { href: "/login", label: "Masuk" },
];

const heroPetals = [
  { left: "8%", delay: "0s", duration: "15s", size: "14px", drift: "24px", sway: "3.5s" },
  { left: "24%", delay: "2s", duration: "13s", size: "16px", drift: "-18px", sway: "4.2s" },
  { left: "41%", delay: "0.8s", duration: "14.2s", size: "15px", drift: "-14px", sway: "3.7s" },
  { left: "58%", delay: "1.5s", duration: "14.5s", size: "12px", drift: "22px", sway: "3.2s" },
  { left: "78%", delay: "4s", duration: "16s", size: "18px", drift: "-22px", sway: "4.8s" },
  { left: "91%", delay: "3s", duration: "12.8s", size: "13px", drift: "16px", sway: "3.8s" },
];

export default async function MarketingPage() {
  const supabase = await createSupabaseClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  return (
    <main className="editorial-shell flex-1">
      <section className="relative isolate overflow-hidden">
        <div className="hero-soft-layer -z-10" />
        <div className="absolute inset-x-0 top-0 -z-10 h-80 bg-[radial-gradient(circle_at_top,rgba(156,109,130,0.38),transparent_62%)]" />
        <div className="hero-orb right-[-5rem] top-24 -z-10 h-52 w-52 bg-[rgba(198,142,90,0.17)] blur-3xl" />
        <div className="hero-orb left-[-4rem] top-52 -z-10 h-44 w-44 bg-[rgba(156,109,130,0.16)] blur-3xl" />
        <div className="hero-orb left-[18%] top-[7rem] -z-10 h-36 w-36 bg-[rgba(231,225,216,0.55)]" />
        <div className="hero-orb right-[12%] top-[12rem] -z-10 h-28 w-28 bg-[rgba(38,72,77,0.12)]" />
        <div className="petal-field" aria-hidden="true">
          {heroPetals.map((petal, index) => (
            <span
              key={`${petal.left}-${index}`}
              className="petal"
              style={
                {
                  "--petal-left": petal.left,
                  "--petal-delay": petal.delay,
                  "--petal-duration": petal.duration,
                  "--petal-size": petal.size,
                  "--petal-drift": petal.drift,
                  "--petal-sway": petal.sway,
                } as CSSProperties
              }
            />
          ))}
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-14 pt-5 sm:px-6 sm:pb-[4.5rem] lg:px-8 lg:pb-24">
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

              <div className="md:hidden" />
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
                  Lihat Tiga Template
                </Link>
              </div>

              <p className="mt-4 text-xs uppercase tracking-[0.24em] text-[var(--color-secondary)]/80 sm:text-sm">
                Mulai gratis, simpan draft, lalu publish saat semuanya siap.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-[var(--color-text-secondary)]">
                <span>Personal link per tamu</span>
                <span className="hidden h-1 w-1 rounded-full bg-[var(--color-accent)] sm:inline-block" />
                <span>Preview sinkron dengan halaman publik</span>
                <span className="hidden h-1 w-1 rounded-full bg-[var(--color-accent)] sm:inline-block" />
                <span>Ringan untuk HP low-end</span>
              </div>
            </ScrollReveal>

            <div className="mt-12 grid gap-5 lg:mt-16 lg:grid-cols-[1.62fr_1fr]">
              <ScrollReveal className="surface-panel overflow-hidden rounded-[var(--radius-panel)] p-5 sm:p-7" delay={80}>
                <div className="rounded-[2rem] bg-[linear-gradient(160deg,#f8f3ee,#e7e1d8_52%,#cfadc0_114%)] p-5 sm:p-7">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-[var(--color-secondary)]">
                    <span>Preview Halaman Tamu</span>
                    <span>Live Personal Route</span>
                  </div>
                  <div className="mt-7 grid gap-5 lg:grid-cols-[1.18fr_0.82fr]">
                    <div className="overflow-hidden rounded-[2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,248,244,0.82))] p-6 shadow-[0_16px_50px_rgba(141,85,96,0.08)]">
                      <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-secondary)]">
                        The Wedding Of
                      </p>
                      <h2 className="mt-4 font-serif-display text-5xl leading-none text-[var(--color-text-primary)] sm:text-6xl">
                        Alya
                        <span className="mx-2 text-[var(--color-primary-strong)]">&</span>
                        Raka
                      </h2>
                      <p className="mt-5 max-w-md text-sm leading-7 text-[var(--color-text-secondary)]">
                        Undangan tampil lembut, lapang, dan tetap personal dengan nama tamu
                        langsung di bagian pembuka.
                      </p>

                      <div className="mt-8 rounded-[1.75rem] border border-white/60 bg-white/72 px-5 py-4">
                        <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-secondary)]">
                          Untuk
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">
                          Ibu Rina & Keluarga
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <div className="surface-card rounded-[2rem] p-5">
                        <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-secondary)]">
                          Contoh URL
                        </p>
                        <p className="mt-4 rounded-[1.4rem] bg-[var(--color-text-primary)] px-4 py-4 text-sm text-white">
                          /alya-dan-raka/ibu-rina
                        </p>
                        <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">
                          Link ini otomatis dibuat begitu tamu ditambahkan ke daftar guest.
                        </p>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                        <div className="surface-card rounded-[2rem] p-5">
                          <p className="text-3xl font-semibold text-[var(--color-primary-strong)]">
                            3
                          </p>
                          <p className="mt-2 text-sm leading-7 text-[var(--color-text-secondary)]">
                            template live untuk awal launch MVP.
                          </p>
                        </div>
                        <div className="surface-card rounded-[2rem] p-5">
                          <p className="text-3xl font-semibold text-[var(--color-secondary)]">
                            RSVP
                          </p>
                          <p className="mt-2 text-sm leading-7 text-[var(--color-text-secondary)]">
                            masuk langsung ke dashboard tanpa alur yang rumit.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              <aside className="grid gap-5">
                <ScrollReveal className="surface-card rounded-[var(--radius-card)] p-6" delay={140}>
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-secondary)]">
                    Untuk Pengantin Sibuk
                  </p>
                  <h2 className="mt-4 font-serif-display text-3xl leading-tight text-[var(--color-text-primary)]">
                    Dari draft hingga link tamu dalam satu alur yang tenang.
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">
                    Tidak perlu membuka terlalu banyak menu. Template, data acara, tamu, preview,
                    dan performa undangan semuanya terasa menyatu.
                  </p>
                </ScrollReveal>

                <ScrollReveal
                  className="rounded-[var(--radius-card)] border border-[rgba(38,72,77,0.2)] bg-[rgba(38,72,77,0.08)] p-6"
                  delay={220}
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-secondary)]">
                    Ringan & Siap Dibuka
                  </p>
                  <p className="mt-4 text-base leading-8 text-[var(--color-text-primary)]">
                    Animasi dibatasi pada transisi opacity dan translate ringan agar tetap terasa
                    halus, tetapi aman untuk perangkat kelas menengah ke bawah.
                  </p>
                </ScrollReveal>
              </aside>
            </div>
          </section>
        </div>
      </section>

      <section id="template" className="section-shell section-spacing mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionIntro
            eyebrow="Template Showcase"
            title="Tiga gaya visual yang siap dijual sejak landing page pertama."
            description="Setiap template dirancang untuk tetap terasa premium di layar ponsel, sambil memakai data undangan yang sama agar pasangan bebas ganti suasana kapan saja."
            align="center"
          />
        </ScrollReveal>

        <div className="mt-10 grid gap-5 lg:grid-cols-[1.18fr_0.82fr_0.82fr]">
          {TEMPLATE_OPTIONS.map((template, index) => (
            <ScrollReveal
              key={template.id}
              className={`surface-card overflow-hidden rounded-[2.3rem] p-5 sm:p-6 ${
                index === 0 ? "lg:row-span-2" : ""
              }`}
              delay={index * 80}
            >
              <div
                className={`rounded-[1.9rem] p-6 ${
                  template.id === "ELEGANT_LUXURY"
                    ? "bg-[linear-gradient(160deg,#1b131c,#2f1e2e_55%,#6b3f63)] text-[#f2e6d8]"
                    : template.id === "KOREAN_SOFT"
                      ? "bg-[linear-gradient(160deg,#f8f5f1,#e7e1d8_55%,#cfadc0)] text-[#5d4453]"
                      : "bg-[linear-gradient(160deg,#ffffff,#f3ede7_58%,#d3af8c)] text-[#2a2425]"
                }`}
              >
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.28em] opacity-75">
                  <span>{template.label}</span>
                  <span>{index === 0 ? "Featured" : "Editorial"}</span>
                </div>
                <div className={`${index === 0 ? "pb-20 pt-[4.5rem] sm:pt-24" : "pb-12 pt-14"} text-center`}>
                  <p className="font-serif-display text-4xl sm:text-5xl">A & R</p>
                  <p className="mt-3 text-sm opacity-80">Untuk: Tamu Tercinta</p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-secondary)]">
                  {template.tagline}
                </p>
                <h3 className="mt-3 font-serif-display text-3xl text-[var(--color-text-primary)]">
                  {template.label}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">
                  {template.description}
                </p>
              </div>
            </ScrollReveal>
          ))}

          <ScrollReveal
            className="rounded-[2.3rem] border border-dashed border-[var(--color-border)] bg-white/40 p-6 lg:col-span-2"
            delay={220}
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
        </div>
      </section>

      <section id="why-us" className="section-shell section-spacing mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="surface-panel rounded-[var(--radius-panel)] px-6 py-8 sm:px-8 lg:px-12 lg:py-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.38fr] lg:items-start">
            <SectionIntro
              eyebrow="Why Choose Us"
              title="Bukan sekadar landing page cantik, tetapi sistem undangan yang terasa matang sejak awal."
              description="Produk ini dirancang untuk menjual rasa personal sekaligus menjaga flow operasional tetap ringan bagi pasangan yang tidak ingin tenggelam di dashboard."
            />

            <div className="grid gap-4">
              {whyChooseUs.map((item, index) => (
                <ScrollReveal
                  key={item.title}
                  className="surface-card rounded-[1.8rem] px-5 py-5 sm:px-6"
                  delay={index * 90}
                >
                  <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--color-text-secondary)]">
                    {item.description}
                  </p>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section id="flow" className="section-shell section-spacing mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <SectionIntro
            eyebrow="Cara Kerja"
            title="Alur yang terasa singkat di mata user, tapi cukup kuat untuk dibangun sebagai MVP."
            description="Journey dibuat untuk mengurangi beban keputusan: pilih, isi, preview, import, kirim, lalu pantau hasilnya."
            align="center"
          />
        </ScrollReveal>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {flowSteps.map((item, index) => (
            <ScrollReveal
              key={item.step}
              className="surface-card rounded-[2rem] p-5 sm:p-6"
              delay={index * 80}
            >
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[rgba(240,196,203,0.58)] text-sm font-semibold text-[var(--color-primary-strong)]">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold leading-7 text-[var(--color-text-primary)]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--color-text-secondary)]">
                    {item.description}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
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

      <section className="section-shell section-spacing mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
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
