"use client";

import Link from "next/link";
import { useActionState } from "react";

import { SubmitButton } from "@/components/ui/SubmitButton";
import { formatAdminDateTime } from "@/lib/utils/date";

import type { DashboardActionState } from "../_actions/dashboard-actions";
import { publishInvitationAction } from "../_actions/dashboard-actions";

import { InvitationStatusBadge } from "./InvitationStatusBadge";

const initialState: DashboardActionState = {};

type PublishInvitationPanelProps = {
  status: "DRAFT" | "PUBLISHED";
  publishedAt?: string | Date | null;
  validationErrors: string[];
  checklist: Array<{
    id: string;
    label: string;
    isComplete: boolean;
    helper: string;
  }>;
  editHref?: string;
  className?: string;
};

export function PublishInvitationPanel({
  status,
  publishedAt,
  validationErrors,
  checklist,
  editHref = "/dashboard/setup",
  className,
}: PublishInvitationPanelProps) {
  const [state, formAction] = useActionState(publishInvitationAction, initialState);
  const isPublishable = validationErrors.length === 0;

  return (
    <section
      className={`rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_24px_70px_rgba(0,0,0,0.06)] ${className ?? ""}`.trim()}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-rose-dark)]">
              Publish Flow
            </p>
            <InvitationStatusBadge status={status} />
          </div>

          <div className="space-y-2 text-sm leading-7 text-stone-600">
            <p>
              {status === "PUBLISHED"
                ? "Public invitation route sudah aktif dan bisa dibuka lewat personal link tamu."
                : "Invitation masih berstatus draft, jadi route publik belum bisa diakses tamu."}
            </p>
            {publishedAt ? (
              <p className="text-xs uppercase tracking-[0.16em] text-stone-500">
                Published at {formatAdminDateTime(publishedAt)}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href={editHref}
            className="button-secondary inline-flex justify-center rounded-full px-5 py-3 text-sm font-semibold"
          >
            Kembali Edit
          </Link>
          <form action={formAction}>
            <SubmitButton
              pendingLabel="Mempublish..."
              disabled={!isPublishable}
              className="button-primary w-full rounded-full px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "PUBLISHED" ? "Publish Ulang" : "Publish Invitation"}
            </SubmitButton>
          </form>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {checklist.map((item) => (
          <div
            key={item.id}
            className="rounded-[1.35rem] bg-[var(--color-surface-alt)] px-4 py-4 text-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium text-[var(--color-text-primary)]">{item.label}</p>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  item.isComplete
                    ? "bg-[rgba(79,123,98,0.12)] text-[var(--color-success)]"
                    : "bg-[rgba(181,87,99,0.12)] text-[var(--color-error)]"
                }`}
              >
                {item.isComplete ? "Siap" : "Belum"}
              </span>
            </div>
            <p className="mt-2 leading-6 text-[var(--color-text-secondary)]">{item.helper}</p>
          </div>
        ))}
      </div>

      {validationErrors.length > 0 ? (
        <div className="mt-5 rounded-[1.5rem] border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
          <p className="font-semibold">Invitation belum bisa dipublish.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {validationErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {state.error ? (
        <div className="mt-5 rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
          {state.error}
        </div>
      ) : null}

      {state.success ? (
        <div className="mt-5 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
          {state.success}
        </div>
      ) : null}
    </section>
  );
}
