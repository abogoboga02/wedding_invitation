"use client";

import type {
  InvitationFormFieldDefinition,
  TemplateConfigFieldValue,
} from "@/features/invitation/form/config";

type InvitationFormFieldRendererProps = {
  field: InvitationFormFieldDefinition;
  value: TemplateConfigFieldValue;
  error?: string;
  onValueChange: (fieldName: string, value: TemplateConfigFieldValue) => void;
};

function inputClass(hasError: boolean) {
  return `w-full rounded-[1.3rem] border bg-white px-4 py-3 text-sm outline-none ${
    hasError
      ? "border-[var(--color-error)]"
      : "border-[var(--color-border)] focus:border-[var(--color-primary-strong)]"
  }`;
}

export function InvitationFormFieldRenderer({
  field,
  value,
  error,
  onValueChange,
}: InvitationFormFieldRendererProps) {
  const isFullWidth =
    field.fullWidth ??
    (field.type === "textarea" || field.name === "coupleSlug" || field.name === "address");

  if (field.type === "checkbox") {
    return (
      <label
        className={`flex items-start gap-3 rounded-[1.35rem] border px-4 py-4 ${
          error
            ? "border-[var(--color-error)] bg-[rgba(181,87,99,0.04)]"
            : "border-[var(--color-border)] bg-white"
        } ${isFullWidth ? "lg:col-span-2" : ""}`}
      >
        <input
          name={field.name}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onValueChange(field.name, event.currentTarget.checked)}
          className="mt-1 h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary-strong)]"
        />
        <span className="space-y-1">
          <span className="block text-sm font-medium text-[var(--color-text-primary)]">
            {field.label}
          </span>
          {field.description ? (
            <span className="block text-xs leading-6 text-[var(--color-text-secondary)]">
              {field.description}
            </span>
          ) : null}
          {error ? <span className="block text-sm text-[var(--color-error)]">{error}</span> : null}
        </span>
      </label>
    );
  }

  return (
    <label className={`space-y-2 ${isFullWidth ? "lg:col-span-2" : ""}`}>
      <span className="text-sm font-medium text-[var(--color-text-primary)]">{field.label}</span>
      {field.type === "textarea" ? (
        <textarea
          name={field.name}
          rows={field.rows ?? 4}
          value={String(value ?? "")}
          onChange={(event) => onValueChange(field.name, event.currentTarget.value)}
          placeholder={field.placeholder}
          className={inputClass(Boolean(error))}
        />
      ) : field.type === "select" ? (
        <select
          name={field.name}
          value={String(value ?? "")}
          onChange={(event) => onValueChange(field.name, event.currentTarget.value)}
          className={inputClass(Boolean(error))}
        >
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          name={field.name}
          type={field.type}
          value={String(value ?? "")}
          onChange={(event) => onValueChange(field.name, event.currentTarget.value)}
          placeholder={field.placeholder}
          className={inputClass(Boolean(error))}
        />
      )}
      {field.description ? (
        <p className="text-xs leading-6 text-[var(--color-text-secondary)]">{field.description}</p>
      ) : null}
      {error ? <p className="text-sm text-[var(--color-error)]">{error}</p> : null}
    </label>
  );
}
