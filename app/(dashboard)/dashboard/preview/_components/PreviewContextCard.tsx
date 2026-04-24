type PreviewContextCardProps = {
  templateLabel: string;
  previewGuestName: string;
  previewPath: string;
  isUsingSampleGuest: boolean;
  placeholderNotes: string[];
  templateConfigSummary: Array<{
    id: string;
    label: string;
    value: string;
  }>;
};

export function PreviewContextCard({
  templateLabel,
  previewGuestName,
  previewPath,
  isUsingSampleGuest,
  placeholderNotes,
  templateConfigSummary,
}: PreviewContextCardProps) {
  return (
    <section className="surface-card rounded-[2rem] p-6">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-rose-dark)]">
          Draft Preview
        </p>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Tinjau hasil undangan sebelum publish
        </h2>
        <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
          Preview ini memakai renderer yang sama dengan route publik, jadi tampilan draft dan
          tampilan live akan tetap konsisten.
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[1.4rem] bg-[var(--color-surface-alt)] px-4 py-4 text-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
            Template Aktif
          </p>
          <p className="mt-2 font-medium text-[var(--color-text-primary)]">{templateLabel}</p>
        </div>
        <div className="rounded-[1.4rem] bg-[var(--color-surface-alt)] px-4 py-4 text-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
            Guest Preview
          </p>
          <p className="mt-2 font-medium text-[var(--color-text-primary)]">{previewGuestName}</p>
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
            {isUsingSampleGuest ? "Sample guest internal" : "Guest pertama dari daftar tamu"}
          </p>
        </div>
        <div className="rounded-[1.4rem] bg-[var(--color-surface-alt)] px-4 py-4 text-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
            Sample Route
          </p>
          <p className="mt-2 break-all font-medium text-[var(--color-text-primary)]">
            {previewPath}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
          Active Template Config
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {templateConfigSummary.map((item) => (
            <div
              key={item.id}
              className="rounded-[1.4rem] bg-[var(--color-surface-alt)] px-4 py-4 text-sm"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
                {item.label}
              </p>
              <p className="mt-2 font-medium text-[var(--color-text-primary)]">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {placeholderNotes.length > 0 ? (
        <div className="mt-5 rounded-[1.5rem] border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
          <p className="font-semibold">Beberapa bagian masih memakai placeholder draft.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {placeholderNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
