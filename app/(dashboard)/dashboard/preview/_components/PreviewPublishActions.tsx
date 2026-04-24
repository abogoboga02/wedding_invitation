"use client";

import Link from "next/link";
import { useActionState } from "react";

import { SubmitButton } from "@/components/ui/SubmitButton";
import { formatAdminDateTime } from "@/lib/utils/date";

import type { DashboardActionState } from "../../_actions/dashboard-actions";
import { publishInvitationAction } from "../../_actions/dashboard-actions";

const initialState: DashboardActionState = {};

type PreviewPublishActionsProps = {
  status: "DRAFT" | "PUBLISHED";
  publishedAt?: string | Date | null;
  validationErrors: string[];
  editHref?: string;
};

export function PreviewPublishActions({
  status,
  publishedAt,
  validationErrors,
  editHref = "/dashboard/setup",
}: PreviewPublishActionsProps) {
  const [state, formAction] = useActionState(publishInvitationAction, initialState);
  const isPublishable = validationErrors.length === 0;

  return (
    <div className="flex flex-col gap-3 xl:items-end">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
        {publishedAt ? `Dipublish ${formatAdminDateTime(publishedAt)}` : "Masih tersimpan sebagai draft"}
      </p>

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
            {status === "PUBLISHED" ? "Publish Ulang" : "Publish"}
          </SubmitButton>
        </form>
      </div>

      {state.error ? (
        <p className="text-sm text-[var(--color-error)] xl:text-right">{state.error}</p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-[var(--color-success)] xl:text-right">{state.success}</p>
      ) : null}
    </div>
  );
}
