import type { Metadata } from "next";
import Link from "next/link";

import { PRICING_FAQ, PRICING_PLANS } from "@/lib/constants/pricing";

export const metadata: Metadata = {
  title: "Harga | Atelier Amora",
  description:
    "Bandingkan paket Starter, Signature, dan Studio untuk undangan digital personal dengan dashboard ringan, RSVP, dan link tamu unik.",
};

export default function PricingPage() {
  return (
    <main className="editorial-shell flex-1">
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-24 lg:pt-16">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-[var(--color-secondary)]">
            Pricing
          </p>
          <h1 className="mt-5 font-serif-display text-balance text-5xl leading-none text-[var(--color-text-primary)] sm:text-6xl">
            Paket yang sederhana untuk keputusan yang cepat.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[var(--color-text-secondary)]">
            Mulai dengan draft gratis, lalu naik ke paket yang sesuai saat undangan siap
            dipublikasikan dan dibagikan ke tamu.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <article
              key={plan.tier}
              className={`rounded-[2.4rem] p-6 ${
                plan.featured
                  ? "border border-[rgba(38,72,77,0.2)] bg-[linear-gradient(160deg,#fffefb,#e7e1d8_56%,#cfadc0_135%)] shadow-[var(--shadow-float)]"
                  : "surface-card"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-secondary)]">
                  {plan.name}
                </p>
                {plan.featured ? (
                  <span className="rounded-full bg-[rgba(38,72,77,0.1)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-secondary)]">
                    Recommended
                  </span>
                ) : null}
              </div>

              <p className="mt-6 font-serif-display text-5xl leading-none text-[var(--color-text-primary)]">
                {plan.priceLabel}
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">
                {plan.caption}
              </p>

              <div className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <p
                    key={feature}
                    className="rounded-[1.3rem] bg-white/72 px-4 py-3 text-sm leading-7 text-[var(--color-text-primary)]"
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
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
        <div className="surface-panel rounded-[2.5rem] px-6 py-8 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-secondary)]">FAQ</p>
            <h2 className="mt-4 font-serif-display text-4xl text-[var(--color-text-primary)]">
              Pertanyaan yang sering muncul sebelum publish pertama.
            </h2>
          </div>

          <div className="mt-8 space-y-4">
            {PRICING_FAQ.map((item) => (
              <article key={item.question} className="surface-card rounded-[1.9rem] px-5 py-5">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                  {item.question}
                </h3>
                <p className="mt-2 text-sm leading-7 text-[var(--color-text-secondary)]">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
