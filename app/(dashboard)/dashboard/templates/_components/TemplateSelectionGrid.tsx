"use client";

import { memo, useActionState, useCallback, useMemo, useState } from "react";

import { SubmitButton } from "@/components/ui/SubmitButton";
import { TEMPLATE_OPTIONS } from "@/lib/constants/invitation";

import type { DashboardActionState } from "../../_actions/dashboard-actions";
import { saveTemplateSelectionAction } from "../../_actions/dashboard-actions";

type TemplateSelectionGridProps = {
  activeTemplate: "ELEGANT_LUXURY" | "KOREAN_SOFT" | "MODERN_MINIMAL";
};

const initialState: DashboardActionState = {};

const templateBadges = {
  ELEGANT_LUXURY: ["Bold", "Evening", "Formal"],
  KOREAN_SOFT: ["Soft", "Romantic", "Airy"],
  MODERN_MINIMAL: ["Clean", "Contemporary", "Editorial"],
} as const;

export function TemplateSelectionGrid({ activeTemplate }: TemplateSelectionGridProps) {
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const [state, formAction] = useActionState(saveTemplateSelectionAction, initialState);
  const previewTemplateLabel = useMemo(
    () => TEMPLATE_OPTIONS.find((item) => item.id === previewTemplate)?.label,
    [previewTemplate],
  );
  const handlePreviewOpen = useCallback((templateId: string) => setPreviewTemplate(templateId), []);
  const handlePreviewClose = useCallback(() => setPreviewTemplate(null), []);

  return (
    <div className="space-y-6">
      {state.error ? (
        <p className="rounded-[1.4rem] border border-[rgba(181,87,99,0.22)] bg-[rgba(181,87,99,0.08)] px-4 py-3 text-sm text-[var(--color-error)]">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="rounded-[1.4rem] border border-[rgba(79,123,98,0.18)] bg-[rgba(79,123,98,0.08)] px-4 py-3 text-sm text-[var(--color-success)]">
          {state.success}
        </p>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-3">
        {TEMPLATE_OPTIONS.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isSelected={activeTemplate === template.id}
            formAction={formAction}
            onOpenPreview={handlePreviewOpen}
          />
        ))}
      </div>

      {previewTemplate ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(35,31,32,0.36)] p-4 backdrop-blur-sm">
          <div className="surface-panel w-full max-w-2xl rounded-[2rem] p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-secondary)]">
                  Template Preview
                </p>
                <h3 className="mt-2 font-serif-display text-3xl text-[var(--color-text-primary)]">
                  {previewTemplateLabel}
                </h3>
              </div>
              <button
                type="button"
                onClick={handlePreviewClose}
                className="rounded-full border border-[var(--color-border)] px-3 py-1 text-sm text-[var(--color-text-secondary)]"
              >
                Tutup
              </button>
            </div>
            <div className="mt-6 rounded-[1.8rem] bg-[linear-gradient(160deg,#fffefb,#fbead6_55%,#f0c4cb)] p-6 text-center">
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-secondary)]">
                Ilustrasi Layout
              </p>
              <p className="mt-5 font-serif-display text-5xl text-[var(--color-text-primary)]">
                Alya & Raka
              </p>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[var(--color-text-secondary)]">
                Preview ringan ini memberi gambaran ritme visual template sebelum Anda
                mengaktifkannya untuk invitation.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

type TemplateCardProps = {
  template: (typeof TEMPLATE_OPTIONS)[number];
  isSelected: boolean;
  formAction: (payload: FormData) => void;
  onOpenPreview: (templateId: string) => void;
};

const TemplateCard = memo(function TemplateCard({
  template,
  isSelected,
  formAction,
  onOpenPreview,
}: TemplateCardProps) {
  return (
    <article
      className={`surface-card rounded-[2.2rem] p-5 ${
        isSelected ? "ring-2 ring-[rgba(200,125,135,0.45)]" : ""
      }`}
    >
      <div
        className={`rounded-[1.8rem] p-5 ${
          template.id === "ELEGANT_LUXURY"
            ? "bg-[linear-gradient(160deg,#181315,#2b2324_55%,#5a4231)] text-[#f7e4c9]"
            : template.id === "KOREAN_SOFT"
              ? "bg-[linear-gradient(160deg,#fffaf7,#fbead6_55%,#f0c4cb)] text-[#6d5358]"
              : "bg-[linear-gradient(160deg,#ffffff,#f8f2ee_58%,#e5bca9)] text-[#2a2425]"
        }`}
      >
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.28em] opacity-75">
          <span>{template.label}</span>
          <span>{isSelected ? "Aktif" : "Preview"}</span>
        </div>
        <div className="pb-12 pt-16 text-center">
          <p className="font-serif-display text-4xl">A & R</p>
          <p className="mt-3 text-sm opacity-80">Untuk: Tamu Tercinta</p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-secondary)]">
            {template.tagline}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">
            {template.label}
          </h2>
          <p className="mt-2 text-sm leading-7 text-[var(--color-text-secondary)]">
            {template.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {templateBadges[template.id].map((badge) => (
            <span
              key={badge}
              className="rounded-full bg-[var(--color-surface-alt)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)]"
            >
              {badge}
            </span>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => onOpenPreview(template.id)}
            className="button-secondary rounded-full px-4 py-3 text-sm font-semibold"
          >
            Preview
          </button>
          <form action={formAction}>
            <input type="hidden" name="template" value={template.id} />
            <SubmitButton
              pendingLabel="Menyimpan..."
              className={`w-full rounded-full px-4 py-3 text-sm font-semibold ${
                isSelected ? "button-secondary" : "button-primary"
              }`}
            >
              {isSelected ? "Template Aktif" : "Pilih Template"}
            </SubmitButton>
          </form>
        </div>
      </div>
    </article>
  );
});
