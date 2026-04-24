type DashboardStatCardProps = {
  label: string;
  value: string | number;
  helper?: string;
};

export function DashboardStatCard({ label, value, helper }: DashboardStatCardProps) {
  return (
    <article className="surface-card rounded-[1.75rem] p-5">
      <p className="text-sm text-[var(--color-text-secondary)]">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-[var(--color-text-primary)]">{value}</p>
      {helper ? <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{helper}</p> : null}
    </article>
  );
}
