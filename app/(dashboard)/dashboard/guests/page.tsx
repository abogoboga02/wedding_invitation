import { getDashboardInvitationGuestsView } from "@/features/invitation/invitation.service";
import { requireClientUser } from "@/lib/auth/guards";

import { DashboardPageHeader } from "../_components/DashboardPageHeader";
import { DashboardStatCard } from "../_components/DashboardStatCard";
import { CsvImporter } from "./_components/CsvImporter";
import { GuestAddForm } from "./_components/GuestAddForm";
import { GuestList } from "./_components/GuestList";

export default async function DashboardGuestsPage() {
  const user = await requireClientUser();
  const invitation = await getDashboardInvitationGuestsView(user.id);

  if (!invitation) {
    return null;
  }

  const totalGuests = invitation.guests.length;
  const contactReadyGuests = invitation.guests.filter((guest) => guest.phone || guest.email).length;
  const csvGuests = invitation.guests.filter((guest) => guest.source === "CSV").length;
  const rsvpGuests = invitation.totalRsvpCount;

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Guest Management"
        title="Kelola tamu dan link undangan"
        description="Tambah guest manual, edit data yang sudah ada, lalu bagikan link tamu yang otomatis menyapa penerima."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard label="Total tamu" value={totalGuests} />
        <DashboardStatCard
          label="Siap dihubungi"
          value={contactReadyGuests}
          helper="Guest dengan nomor HP atau email."
        />
        <DashboardStatCard
          label="Import CSV"
          value={csvGuests}
          helper="Guest yang masuk dari bulk import."
        />
        <DashboardStatCard
          label="RSVP masuk"
          value={rsvpGuests}
          helper={`${Math.max(totalGuests - rsvpGuests, 0)} guest belum merespons.`}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <GuestAddForm />
          <CsvImporter />
        </div>

        <GuestList coupleSlug={invitation.coupleSlug} guests={invitation.guests} />
      </div>
    </div>
  );
}
