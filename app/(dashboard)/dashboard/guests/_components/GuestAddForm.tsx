"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/ui/SubmitButton";

import { addGuestAction, type DashboardActionState } from "../../_actions/dashboard-actions";

const initialState: DashboardActionState = {};

export function GuestAddForm() {
  const [state, formAction] = useActionState(addGuestAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-[0_24px_70px_rgba(0,0,0,0.06)]">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-stone-900">Tambah Tamu Manual</h2>
        <p className="text-sm text-stone-600">
          Tambah tamu satu per satu jika belum siap import CSV. Guest slug akan dibuat otomatis
          dari nama yang kamu input.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <input
          name="name"
          placeholder="Nama tamu"
          className="rounded-2xl border border-stone-300 px-4 py-3 text-sm"
        />
        <input
          name="phone"
          placeholder="Nomor WhatsApp"
          className="rounded-2xl border border-stone-300 px-4 py-3 text-sm"
        />
        <input
          name="email"
          placeholder="Email (opsional)"
          className="rounded-2xl border border-stone-300 px-4 py-3 text-sm"
        />
      </div>

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
        pendingLabel="Menambahkan..."
        className="rounded-full bg-[var(--color-olive)] px-5 py-3 text-sm font-semibold text-white"
      >
        Tambah Tamu
      </SubmitButton>
    </form>
  );
}
