type SectionIntroProps = {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
};

export function SectionIntro({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionIntroProps) {
  const alignment = align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-2xl";

  return (
    <div className={`space-y-3 ${alignment}`}>
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-[var(--color-secondary)]">
        {eyebrow}
      </p>
      <h2 className="font-serif-display text-balance text-4xl leading-none text-[var(--color-text-primary)] sm:text-5xl">
        {title}
      </h2>
      <p className="text-base leading-8 text-[var(--color-text-secondary)]">{description}</p>
    </div>
  );
}
