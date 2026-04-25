"use client";

import { useActionState, useMemo, useState } from "react";

import { SubmitButton } from "@/components/ui/SubmitButton";
import { PRICING_PLANS } from "@/lib/constants/pricing";

import type { TemplatePricingCatalogItem } from "@/features/pricing/pricing.service";

import type { PricingOrderActionState } from "../_actions/pricing-actions";
import { submitTemplatePricingOrderAction } from "../_actions/pricing-actions";

type PricingTemplateConfiguratorProps = {
  templates: TemplatePricingCatalogItem[];
};

const initialState: PricingOrderActionState = {};

function formatIdr(value: number) {
  return `Rp${value.toLocaleString("id-ID")}`;
}

export function PricingTemplateConfigurator({ templates }: PricingTemplateConfiguratorProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [state, formAction] = useActionState(submitTemplatePricingOrderAction, initialState);
  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) ?? null,
    [selectedTemplateId, templates],
  );

  return (
    <section className="mt-12 space-y-6 rounded-[2.5rem] border border-[var(--color-border)] bg-white/70 p-6 sm:p-8">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-secondary)]">
          Pilih Template
        </p>
        <h2 className="font-serif-display text-3xl text-[var(--color-text-primary)]">
          Harga utama mengikuti template yang dipilih
        </h2>
        <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
          Paket tetap tersedia sebagai pembeda fitur, tetapi nominal order akan memakai harga dari
          template.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {templates.map((template) => {
          const isSelected = template.id === selectedTemplateId;

          return (
            <button
              key={template.id}
              type="button"
              onClick={() => setSelectedTemplateId(template.id)}
              className={`rounded-[1.8rem] border p-5 text-left transition ${
                isSelected
                  ? "border-[var(--color-primary-strong)] bg-[rgba(200,125,135,0.08)]"
                  : "border-[var(--color-border)] bg-white"
              }`}
            >
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-secondary)]">
                {template.category}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-[var(--color-text-primary)]">
                {template.name}
              </h3>
              <p className="mt-2 text-sm font-medium text-[var(--color-text-primary)]">
                {formatIdr(template.priceInIdr)}
              </p>
              <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                {template.isPremium ? "Template premium" : "Template reguler"}
              </p>
            </button>
          );
        })}
      </div>

      <div className="rounded-[1.8rem] border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-5 py-4">
        {selectedTemplate ? (
          <>
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-secondary)]">
              Harga utama saat ini
            </p>
            <p className="mt-2 font-serif-display text-4xl leading-none text-[var(--color-text-primary)]">
              {formatIdr(selectedTemplate.priceInIdr)}
            </p>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
              Berdasarkan template <span className="font-semibold">{selectedTemplate.name}</span>.
            </p>
          </>
        ) : (
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">
            Pilih template untuk melihat harga
          </p>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {PRICING_PLANS.map((plan) => (
          <form
            key={plan.tier}
            action={formAction}
            className={`rounded-[2.1rem] p-6 ${
              plan.featured
                ? "border border-[rgba(38,72,77,0.2)] bg-[linear-gradient(160deg,#fffefb,#e7e1d8_56%,#cfadc0_135%)] shadow-[var(--shadow-float)]"
                : "surface-card"
            }`}
          >
            <input type="hidden" name="templateId" value={selectedTemplateId} />
            <input type="hidden" name="selectedPackage" value={plan.tier} />
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-secondary)]">
              {plan.name}
            </p>
            <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">{plan.caption}</p>
            <div className="mt-4 space-y-2">
              {plan.features.map((feature) => (
                <p
                  key={feature}
                  className="rounded-[1.1rem] bg-white/80 px-3 py-2 text-xs text-[var(--color-text-primary)]"
                >
                  {feature}
                </p>
              ))}
            </div>
            <SubmitButton
              pendingLabel="Memproses..."
              className={`mt-6 inline-flex w-full justify-center rounded-full px-5 py-3 text-sm font-semibold ${
                plan.featured ? "button-primary" : "button-secondary"
              }`}
            >
              Pilih {plan.name}
            </SubmitButton>
          </form>
        ))}
      </div>

      {state.error ? (
        <p className="rounded-[1.3rem] border border-[rgba(181,87,99,0.22)] bg-[rgba(181,87,99,0.08)] px-4 py-3 text-sm text-[var(--color-error)]">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-[1.3rem] border border-[rgba(79,123,98,0.18)] bg-[rgba(79,123,98,0.08)] px-4 py-3 text-sm text-[var(--color-success)]">
          {state.success}
        </p>
      ) : null}
    </section>
  );
}
