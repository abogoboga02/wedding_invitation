import { connection } from "next/server";

import { getAdminGuests } from "@/features/admin/admin.service";
import { formatAdminDateTime } from "@/lib/utils/date";

import { AdminSectionCard } from "../_components/AdminSectionCard";

export default async function AdminGuestsPage() {
  await connection();
  const guests = await getAdminGuests();

  return (
    <div className="space-y-6">
      <AdminSectionCard
        title="Guest List"
        description="Admin dapat melihat tamu terbaru dari seluruh invitation, lengkap dengan asal data, status RSVP, dan pasangan pemilik invitation."
      >
        <div className="space-y-4">
          {guests.length > 0 ? (
            guests.map((guest) => (
              <article
                key={guest.id}
                className="rounded-[1.7rem] bg-[var(--color-surface-alt)] px-4 py-4"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-medium text-[var(--color-text-primary)]">{guest.name}</p>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                      /{guest.invitation.coupleSlug}/{guest.guestSlug}
                    </p>
                    <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                      {guest.invitation.partnerOneName} & {guest.invitation.partnerTwoName} |{" "}
                      {guest.invitation.ownerEmail}
                    </p>
                  </div>

                  <div className="text-sm text-[var(--color-text-secondary)] lg:text-right">
                    <p>
                      {guest.source} | {guest.rsvp?.status ?? "BELUM RSVP"}
                    </p>
                    <p className="mt-1">
                      {guest.phone ?? guest.email ?? "Kontak belum diisi"} |{" "}
                      {formatAdminDateTime(guest.createdAt)}
                    </p>
                    {guest.rsvp ? <p className="mt-1">Jumlah hadir: {guest.rsvp.attendees}</p> : null}
                  </div>
                </div>
              </article>
            ))
          ) : (
            <p className="rounded-[1.7rem] bg-[var(--color-surface-alt)] px-4 py-5 text-sm leading-7 text-[var(--color-text-secondary)]">
              Belum ada guest list yang tersimpan.
            </p>
          )}
        </div>
      </AdminSectionCard>
    </div>
  );
}
