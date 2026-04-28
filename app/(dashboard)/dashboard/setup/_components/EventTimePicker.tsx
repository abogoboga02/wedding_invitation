"use client";

import { memo } from "react";

type EventTimePickerProps = {
  name: string;
  label: string;
  value: string;
  error?: string;
  onValueChange: (fieldName: string, value: string) => void;
};

function inputClass(hasError: boolean) {
  return `w-full rounded-[1.3rem] border bg-white px-4 py-3 text-sm outline-none transition ${
    hasError
      ? "border-[var(--color-error)]"
      : "border-[var(--color-border)] focus:border-[var(--color-primary-strong)]"
  }`;
}

export const EventTimePicker = memo(function EventTimePicker({
  name,
  label,
  value,
  error,
  onValueChange,
}: EventTimePickerProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <span className="text-sm font-medium text-[var(--color-text-primary)]">{label}</span>
        <input
          type="text"
          name={name}
          value={value}
          onChange={(event) => onValueChange(name, event.currentTarget.value)}
          placeholder="Contoh: 10.00 WIB atau Kedatangan tamu bebas"
          className={inputClass(Boolean(error))}
        />
      </div>

      <p className="text-xs leading-6 text-[var(--color-text-secondary)]">
        Isi jam dengan format yang paling pas untuk acara ini. Bisa jam pasti seperti 10.00 WIB,
        atau keterangan bebas seperti kedatangan tamu bebas.
      </p>
      {error ? <p className="text-sm text-[var(--color-error)]">{error}</p> : null}
    </div>
  );
});
