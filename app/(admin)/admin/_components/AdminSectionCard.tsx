type AdminSectionCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function AdminSectionCard({ title, description, children }: AdminSectionCardProps) {
  return (
    <section className="surface-panel rounded-[2rem] px-5 py-6 sm:px-6">
      <div className="max-w-3xl">
        <h2 className="text-2xl font-semibold text-[var(--color-text-primary)]">{title}</h2>
        {description ? (
          <p className="mt-2 text-sm leading-7 text-[var(--color-text-secondary)]">
            {description}
          </p>
        ) : null}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}
