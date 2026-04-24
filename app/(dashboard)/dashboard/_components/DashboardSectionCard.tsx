type DashboardSectionCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function DashboardSectionCard({
  title,
  description,
  children,
}: DashboardSectionCardProps) {
  return (
    <section className="surface-card rounded-[2rem] p-6">
      <div className="mb-5 space-y-1">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{title}</h2>
        {description ? (
          <p className="text-sm leading-7 text-[var(--color-text-secondary)]">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
