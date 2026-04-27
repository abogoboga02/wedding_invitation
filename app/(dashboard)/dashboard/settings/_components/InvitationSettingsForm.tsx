"use client";

import { useActionState } from "react";

import type { DashboardInvitationSettingsView } from "@/features/invitation/invitation.service";
import { SEND_CHANNEL_LABELS } from "@/lib/constants/pricing";
import { SubmitButton } from "@/components/ui/SubmitButton";

import {
  saveInvitationSettingsAction,
  type DashboardActionState,
} from "../../_actions/dashboard-actions";

const initialState: DashboardActionState = {};

type InvitationSettingsFormProps = {
  invitation: DashboardInvitationSettingsView;
};

const localeOptions = ["id-ID", "en-US"];
const timezoneOptions = ["Asia/Jakarta", "Asia/Bangkok", "Asia/Singapore"];

export function InvitationSettingsForm({ invitation }: InvitationSettingsFormProps) {
  const [state, formAction] = useActionState(saveInvitationSettingsAction, initialState);
  const settings = invitation.setting;

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">Locale</span>
          <select
            name="locale"
            defaultValue={settings?.locale ?? "id-ID"}
            className="w-full rounded-[1.25rem] border border-[var(--color-border)] bg-white px-4 py-3 text-sm"
          >
            {localeOptions.map((locale) => (
              <option key={locale} value={locale}>
                {locale}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--color-text-primary)]">Timezone</span>
          <select
            name="timezone"
            defaultValue={settings?.timezone ?? "Asia/Jakarta"}
            className="w-full rounded-[1.25rem] border border-[var(--color-border)] bg-white px-4 py-3 text-sm"
          >
            {timezoneOptions.map((timezone) => (
              <option key={timezone} value={timezone}>
                {timezone}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-[var(--color-text-primary)]">
          Channel distribusi default
        </span>
        <select
          name="preferredSendChannel"
          defaultValue={settings?.preferredSendChannel ?? "MANUAL"}
          className="w-full rounded-[1.25rem] border border-[var(--color-border)] bg-white px-4 py-3 text-sm"
        >
          {Object.entries(SEND_CHANNEL_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            name: "isRsvpEnabled",
            label: "RSVP aktif",
            defaultChecked: settings?.isRsvpEnabled ?? true,
          },
          {
            name: "isWishEnabled",
            label: "Ucapan tamu aktif",
            defaultChecked: settings?.isWishEnabled ?? true,
          },
          {
            name: "autoPlayMusic",
            label: "Autoplay musik",
            defaultChecked: settings?.autoPlayMusic ?? true,
          },
        ].map((item) => (
          <label
            key={item.name}
            className="flex items-center gap-3 rounded-[1.5rem] bg-[var(--color-surface-alt)] px-4 py-4 text-sm text-[var(--color-text-primary)]"
          >
            <input
              type="checkbox"
              name={item.name}
              defaultChecked={item.defaultChecked}
              className="h-4 w-4 rounded border-[var(--color-border)]"
            />
            <span>{item.label}</span>
          </label>
        ))}
      </div>

      {state.error ? (
        <p className="rounded-[1.25rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="rounded-[1.25rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {state.success}
        </p>
      ) : null}

      <SubmitButton
        pendingLabel="Menyimpan..."
        className="rounded-full bg-[var(--color-text-primary)] px-5 py-3 text-sm font-semibold text-white"
      >
        Simpan Pengaturan
      </SubmitButton>
    </form>
  );
}
