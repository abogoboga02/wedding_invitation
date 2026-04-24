type DashboardPageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
};

export function DashboardPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: DashboardPageHeaderProps) {
  return (
    <section className="surface-panel rounded-[2.25rem] px-6 py-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-secondary)]">
            {eyebrow}
          </p>
          <h1 className="font-serif-display text-3xl leading-none text-[var(--color-text-primary)] sm:text-4xl">
            {title}
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-[var(--color-text-secondary)]">
            {description}
          </p>
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </section>
  );
}
