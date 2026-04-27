import { SubmitButton } from "@/components/ui/SubmitButton";
import { getPublicInvitationPath } from "@/features/invitation/public-invitation.service";

import { deleteGuestAction, updateGuestAction } from "../../_actions/dashboard-actions";
import { CopyGuestLinkButton } from "./CopyGuestLinkButton";

type GuestListProps = {
  coupleSlug: string;
  guests: Array<{
    id: string;
    name: string;
    guestSlug: string;
    phone: string | null;
    email: string | null;
    source: "MANUAL" | "CSV";
  }>;
};

function sourceLabel(source: GuestListProps["guests"][number]["source"]) {
  return source === "CSV" ? "CSV" : "Manual";
}

export function GuestList({ coupleSlug, guests }: GuestListProps) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.06)]">
      <div className="border-b border-stone-200 px-6 py-5">
        <h2 className="text-lg font-semibold text-stone-900">Daftar Tamu</h2>
        <p className="mt-1 text-sm text-stone-600">
          Setiap tamu punya link undangan sendiri dengan sapaan yang bisa langsung dibagikan.
        </p>
      </div>

      <div className="divide-y divide-stone-100">
        {guests.length > 0 ? (
          guests.map((guest) => {
            const publicPath = getPublicInvitationPath(coupleSlug, {
              guestSlug: guest.guestSlug,
              guestName: guest.name,
            });

            return (
              <article key={guest.id} className="space-y-4 px-6 py-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-stone-900">{guest.name}</h3>
                      <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600">
                        {sourceLabel(guest.source)}
                      </span>
                    </div>

                    <div className="rounded-[1.35rem] bg-stone-50 px-4 py-3 text-xs text-stone-500">
                      {publicPath}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-stone-600">
                      <span>{guest.phone ?? "Tanpa nomor HP"}</span>
                      <span>{guest.email ?? "Tanpa email"}</span>
                    </div>
                  </div>

                  <CopyGuestLinkButton path={publicPath} />
                </div>

                <form
                  action={updateGuestAction}
                  className="grid gap-4 lg:grid-cols-[1.1fr_1fr_1fr_auto] lg:items-center"
                >
                  <input type="hidden" name="guestId" value={guest.id} />
                  <input
                    name="name"
                    defaultValue={guest.name}
                    placeholder="Nama tamu"
                    className="rounded-2xl border border-stone-300 px-4 py-3 text-sm"
                  />
                  <input
                    name="phone"
                    defaultValue={guest.phone ?? ""}
                    placeholder="Nomor WhatsApp"
                    className="rounded-2xl border border-stone-300 px-4 py-3 text-sm"
                  />
                  <input
                    name="email"
                    defaultValue={guest.email ?? ""}
                    placeholder="Email"
                    className="rounded-2xl border border-stone-300 px-4 py-3 text-sm"
                  />
                  <SubmitButton
                    pendingLabel="Menyimpan..."
                    className="rounded-full border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700"
                  >
                    Simpan
                  </SubmitButton>
                </form>

                <form action={deleteGuestAction}>
                  <input type="hidden" name="guestId" value={guest.id} />
                  <SubmitButton
                    pendingLabel="Menghapus..."
                    className="rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white"
                  >
                    Hapus
                  </SubmitButton>
                </form>
              </article>
            );
          })
        ) : (
          <div className="px-6 py-10 text-sm leading-7 text-stone-600">
            Belum ada tamu. Tambah manual atau import CSV agar link undangan mulai terbentuk.
          </div>
        )}
      </div>
    </section>
  );
}
