"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/ui/SubmitButton";
import { RSVP_STATUS_OPTIONS } from "@/lib/constants/invitation";

import { submitRsvpAction, type PublicActionState } from "@/app/[coupleSlug]/_actions/rsvp-actions";
import type { InvitationRenderModel } from "@/features/invitation/invitation.types";

const initialState: PublicActionState = {};

type RsvpFormProps = {
  invitation: InvitationRenderModel;
};

export function RsvpForm({ invitation }: RsvpFormProps) {
  const [state, formAction] = useActionState(submitRsvpAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="guestId" value={invitation.guestId} />
      <input type="hidden" name="coupleSlug" value={invitation.coupleSlug} />
      <input type="hidden" name="guestSlug" value={invitation.guestSlug} />

      <label className="block space-y-2">
        <span className="text-sm font-medium text-current/80">Nama Konfirmasi</span>
        <input
          name="respondentName"
          maxLength={100}
          defaultValue={invitation.currentRsvp?.respondentName ?? invitation.guestName}
          className="w-full rounded-2xl border border-current/15 bg-transparent px-4 py-3 text-sm"
          placeholder="Nama tamu / perwakilan keluarga"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-current/80">Konfirmasi Kehadiran</span>
        <select
          name="status"
          defaultValue={invitation.currentRsvp?.status ?? "ATTENDING"}
          className="w-full rounded-2xl border border-current/15 bg-transparent px-4 py-3 text-sm"
        >
          {RSVP_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-current/80">Jumlah Kehadiran</span>
        <input
          type="number"
          min={1}
          max={10}
          name="attendees"
          defaultValue={invitation.currentRsvp?.attendees ?? 1}
          className="w-full rounded-2xl border border-current/15 bg-transparent px-4 py-3 text-sm"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-current/80">Pesan Singkat</span>
        <textarea
          name="note"
          rows={3}
          maxLength={250}
          defaultValue={invitation.currentRsvp?.note ?? ""}
          className="w-full rounded-2xl border border-current/15 bg-transparent px-4 py-3 text-sm"
          placeholder="Contoh: hadir bersama pasangan / mohon doa dari jauh."
        />
      </label>

      {invitation.isWishEnabled ? (
        <label className="block space-y-2">
          <span className="text-sm font-medium text-current/80">Ucapan & Doa</span>
          <textarea
            name="wishMessage"
            rows={4}
            maxLength={500}
            defaultValue={invitation.currentWish?.message ?? ""}
            className="w-full rounded-2xl border border-current/15 bg-transparent px-4 py-3 text-sm"
            placeholder="Tuliskan ucapan singkat untuk kedua mempelai."
          />
        </label>
      ) : null}

      {state.error ? (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </p>
      ) : null}

      {state.success ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {state.success}
        </p>
      ) : null}

      <SubmitButton
        pendingLabel="Mengirim RSVP..."
        className="rounded-full bg-current px-5 py-3 text-sm font-semibold text-white"
      >
        Kirim RSVP
      </SubmitButton>
    </form>
  );
}
