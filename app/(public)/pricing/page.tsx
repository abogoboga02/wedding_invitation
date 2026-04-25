import type { Metadata } from "next";

import { PRICING_FAQ } from "@/lib/constants/pricing";
import { getTemplatePricingCatalog } from "@/features/pricing/pricing.service";

import { PricingTemplateConfigurator } from "./_components/PricingTemplateConfigurator";

export const metadata: Metadata = {
  title: "Harga | Atelier Amora",
  description:
    "Bandingkan paket Starter, Signature, dan Studio untuk undangan digital personal dengan dashboard ringan, RSVP, dan link tamu unik.",
};

export default async function PricingPage() {
  const templates = await getTemplatePricingCatalog();

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

        <PricingTemplateConfigurator templates={templates} />
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
