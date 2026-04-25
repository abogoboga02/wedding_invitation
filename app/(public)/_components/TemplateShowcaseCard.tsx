import { ScrollReveal } from "./ScrollReveal";

type TemplateShowcaseCardProps = {
  template: {
    id: string;
    label: string;
    tagline: string;
    description: string;
  };
  index: number;
};

export function TemplateShowcaseCard({ template, index }: TemplateShowcaseCardProps) {
  return (
    <ScrollReveal
      className="surface-card overflow-hidden rounded-[2.3rem] p-5 sm:p-6"
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
          <span>Editorial</span>
        </div>
        <div className="pb-12 pt-14 text-center">
          <p className="font-serif-display text-4xl sm:text-5xl">A & R</p>
          <p className="mt-3 text-sm opacity-80">Untuk: Tamu Tercinta</p>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-secondary)]">{template.tagline}</p>
        <h3 className="mt-3 font-serif-display text-3xl text-[var(--color-text-primary)]">{template.label}</h3>
        <p className="mt-3 text-sm leading-7 text-[var(--color-text-secondary)]">{template.description}</p>
      </div>
    </ScrollReveal>
  );
}
