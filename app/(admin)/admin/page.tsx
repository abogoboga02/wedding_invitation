import Link from "next/link";
import { connection } from "next/server";

import { getAdminOverviewData } from "@/features/admin/admin.service";
import { formatAdminDateTime } from "@/lib/utils/date";

import { AdminSectionCard } from "./_components/AdminSectionCard";

function formatIdr(value: number) {
  return `Rp${value.toLocaleString("id-ID")}`;
}

type AdminMetricCardProps = {
  label: string;
  value: string | number;
  helper: string;
};

function AdminMetricCard({ label, value, helper }: AdminMetricCardProps) {
  return (
    <article className="surface-panel rounded-[1.75rem] px-5 py-5">
      <p className="text-sm font-medium text-[var(--color-text-secondary)]">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-[var(--color-text-primary)]">{value}</p>
      <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">{helper}</p>
    </article>
  );
}

type StatusTone = "pending" | "success" | "danger" | "neutral";

function AdminStatusPill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: StatusTone;
}) {
  const classes =
    tone === "success"
      ? "bg-[rgba(79,123,98,0.12)] text-[var(--color-success)]"
      : tone === "pending"
        ? "bg-[rgba(192,138,92,0.12)] text-[color:#8a5a2c]"
        : tone === "danger"
          ? "bg-[rgba(181,87,99,0.12)] text-[var(--color-error)]"
          : "bg-[rgba(70,70,70,0.08)] text-[var(--color-text-secondary)]";

  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${classes}`}>{label}</span>;
}

function getOrderTone(status: "PENDING" | "PAID" | "FAILED" | "REFUNDED"): StatusTone {
  if (status === "PAID") {
    return "success";
  }

  if (status === "PENDING") {
    return "pending";
  }

  if (status === "FAILED") {
    return "danger";
  }

  return "neutral";
}

export default async function AdminPage() {
  await connection();

  const overview = await getAdminOverviewData();
  const metricCards = [
    {
      label: "Total client",
      value: overview.clients,
      helper: `${overview.users} total akun terdaftar, termasuk ${overview.admins} admin.`,
    },
    {
      label: "Client aktif",
      value: overview.activeClients,
      helper: "Client yang sudah punya undangan draft atau published.",
    },
    {
      label: "Undangan published",
      value: overview.published,
      helper: `${overview.recentPublishes.length} publish terbaru sudah siap dibuka tamu.`,
    },
    {
      label: "Undangan draft",
      value: overview.drafts,
      helper: "Masih dalam proses input data atau menunggu publish.",
    },
    {
      label: "Setup belum lengkap",
      value: overview.needsSetup,
      helper: "Perlu follow up untuk data acara, lokasi, media, atau guest list.",
    },
    {
      label: "Template terpakai",
      value: overview.templateSummary.mostUsed?.templateName ?? "Belum ada",
      helper: overview.templateSummary.mostUsed
        ? `Paling sering dipakai di ${overview.templateSummary.mostUsed.usageCount} undangan.`
        : "Belum ada template yang dipakai oleh client.",
    },
    {
      label: "Pendapatan masuk",
      value: formatIdr(overview.revenueSummary.paidRevenue),
      helper: `${overview.revenueSummary.paidOrders} order sudah lunas.`,
    },
    {
      label: "Estimasi order",
      value: formatIdr(overview.revenueSummary.pendingRevenue),
      helper: `${overview.revenueSummary.pendingOrders} order masih menunggu pembayaran.`,
    },
  ];

  return (
    <section className="space-y-6">
      <div className="surface-panel rounded-[2rem] px-5 py-6 sm:px-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-text-secondary)]">
              Dashboard Admin
            </p>
            <h1 className="mt-3 font-serif-display text-4xl text-[var(--color-text-primary)]">
              Ringkasan operasional lintas client
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-text-secondary)]">
              Area ini difokuskan untuk memantau client, status publish, template terpakai,
              pembayaran, dan follow up yang masih perlu tindakan cepat dari admin.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/users"
              className="button-primary inline-flex rounded-full px-5 py-3 text-sm font-semibold"
            >
              Tambah Client
            </Link>
            <Link
              href="/admin/templates"
              className="button-secondary inline-flex rounded-full px-5 py-3 text-sm font-semibold"
            >
              Kelola Template
            </Link>
            <Link
              href="/admin/payments"
              className="button-secondary inline-flex rounded-full px-5 py-3 text-sm font-semibold"
            >
              Cek Pembayaran
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <AdminMetricCard
            key={card.label}
            label={card.label}
            value={card.value}
            helper={card.helper}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <AdminSectionCard
          title="Client perlu tindakan"
          description="Gunakan daftar ini untuk follow up client yang belum lengkap setup, belum upload media, atau masih menunggu pembayaran."
        >
          <div className="space-y-3">
            {overview.actionRequiredClients.length > 0 ? (
              overview.actionRequiredClients.map((client) => (
                <article
                  key={client.id}
                  className="rounded-[1.5rem] bg-[var(--color-surface-alt)] px-4 py-4"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="font-medium text-[var(--color-text-primary)]">
                        {client.userName ?? client.userEmail}
                      </p>
                      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                        /{client.coupleSlug} • {client.userEmail}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {client.issues.map((issue) => (
                          <AdminStatusPill key={issue} label={issue} tone="pending" />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <AdminStatusPill
                        label={client.status === "PUBLISHED" ? "Published" : "Draft"}
                        tone={client.status === "PUBLISHED" ? "success" : "neutral"}
                      />
                      <Link
                        href="/admin/users"
                        className="text-sm font-semibold text-[var(--color-secondary)]"
                      >
                        Buka client
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p className="rounded-[1.5rem] bg-[var(--color-surface-alt)] px-4 py-5 text-sm leading-7 text-[var(--color-text-secondary)]">
                Semua client utama saat ini sudah berada di kondisi yang cukup rapi. Daftar ini akan
                otomatis terisi ketika ada setup yang belum lengkap atau order yang masih pending.
              </p>
            )}
          </div>
        </AdminSectionCard>

        <AdminSectionCard
          title="Order terbaru"
          description="Menampilkan client baru yang membuat order beserta tanggal order, status pembayaran, paket, dan template yang dipilih."
        >
          <div className="space-y-3">
            {overview.latestOrders.length > 0 ? (
              overview.latestOrders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-[1.5rem] bg-[var(--color-surface-alt)] px-4 py-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium text-[var(--color-text-primary)]">
                        {order.userName ?? order.userEmail}
                      </p>
                      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                        {order.templateName ?? "Template belum terhubung"} • Paket{" "}
                        {order.selectedPackage ?? "-"}
                      </p>
                      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                        {formatAdminDateTime(order.createdAt)}
                      </p>
                    </div>

                    <div className="text-sm sm:text-right">
                      <AdminStatusPill label={order.status} tone={getOrderTone(order.status)} />
                      <p className="mt-2 font-medium text-[var(--color-text-primary)]">
                        {formatIdr(order.amountInIdr)}
                      </p>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p className="rounded-[1.5rem] bg-[var(--color-surface-alt)] px-4 py-5 text-sm leading-7 text-[var(--color-text-secondary)]">
                Belum ada order pembayaran yang tercatat.
              </p>
            )}
          </div>
        </AdminSectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <AdminSectionCard
          title="Jumlah template"
          description="Ringkasan katalog template aktif, draft, premium, dan nonaktif sesuai data yang sudah ada di sistem."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "Total template", value: overview.templateSummary.total },
              { label: "Template aktif", value: overview.templateSummary.active },
              { label: "Template draft", value: overview.templateSummary.draft },
              { label: "Template nonaktif", value: overview.templateSummary.inactive },
              { label: "Template premium", value: overview.templateSummary.premium },
              { label: "Template reguler", value: overview.templateSummary.regular },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[1.4rem] bg-[var(--color-surface-alt)] px-4 py-4"
              >
                <p className="text-sm text-[var(--color-text-secondary)]">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">
            Status draft saat ini belum dipakai sebagai status terpisah di model template, jadi
            nilainya mengikuti data katalog yang tersedia.
          </p>
        </AdminSectionCard>

        <AdminSectionCard
          title="Statistik RSVP global"
          description="Gabungan seluruh tamu dan respons yang sudah masuk agar admin cepat membaca performa undangan secara menyeluruh."
        >
          <div className="grid gap-3">
            {[
              {
                label: "Total tamu",
                value: overview.globalRsvpStats.totalGuests,
                helper: `${overview.globalRsvpStats.totalRsvps} RSVP sudah masuk.`,
              },
              {
                label: "Rata-rata respons",
                value: `${overview.globalRsvpStats.responseRate}%`,
                helper: "Perbandingan RSVP masuk terhadap seluruh tamu.",
              },
              {
                label: "Breakdown RSVP",
                value: `${overview.globalRsvpStats.attending}/${overview.globalRsvpStats.maybe}/${overview.globalRsvpStats.declined}`,
                helper: "Urutan hadir, ragu, lalu tidak hadir.",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[1.4rem] bg-[var(--color-surface-alt)] px-4 py-4"
              >
                <p className="text-sm text-[var(--color-text-secondary)]">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">
                  {item.value}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                  {item.helper}
                </p>
              </div>
            ))}
          </div>
        </AdminSectionCard>

        <AdminSectionCard
          title="Publish terbaru"
          description="Undangan yang baru saja berhasil dipublish dan siap dibagikan ke tamu."
        >
          <div className="space-y-3">
            {overview.recentPublishes.length > 0 ? (
              overview.recentPublishes.map((invitation) => (
                <article
                  key={invitation.id}
                  className="rounded-[1.5rem] bg-[var(--color-surface-alt)] px-4 py-4"
                >
                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="font-medium text-[var(--color-text-primary)]">
                        {invitation.partnerOneName} & {invitation.partnerTwoName}
                      </p>
                      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                        /{invitation.coupleSlug} • {invitation.ownerEmail}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-sm text-[var(--color-text-secondary)]">
                      <AdminStatusPill label="Published" tone="success" />
                      <span>{formatAdminDateTime(invitation.publishedAt)}</span>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p className="rounded-[1.5rem] bg-[var(--color-surface-alt)] px-4 py-5 text-sm leading-7 text-[var(--color-text-secondary)]">
                Belum ada undangan yang dipublish.
              </p>
            )}
          </div>
        </AdminSectionCard>
      </div>

      <AdminSectionCard
        title="Manajemen cepat"
        description="Shortcut untuk tindakan admin yang paling sering dipakai saat menangani client dan operasional undangan."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              href: "/admin/users",
              title: "Tambah client",
              body: "Buat akun baru dan tentukan template awal client.",
            },
            {
              href: "/admin/templates",
              title: "Tambah template",
              body: "Pantau template terpakai dan sinkronkan katalog plan/template.",
            },
            {
              href: "/admin/payments",
              title: "Cek pembayaran",
              body: "Review order pending, nominal, dan status pembayaran terbaru.",
            },
            {
              href: "/admin/invitations",
              title: "Buka daftar client",
              body: "Masuk ke daftar undangan untuk audit publish dan data client.",
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-[1.6rem] bg-[var(--color-surface-alt)] px-5 py-5 transition hover:bg-white"
            >
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-[var(--color-text-secondary)]">
                {item.body}
              </p>
            </Link>
          ))}
        </div>
      </AdminSectionCard>
    </section>
  );
}
