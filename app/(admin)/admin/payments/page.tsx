import { connection } from "next/server";

import { getAdminPaymentsData } from "@/features/admin/admin.service";

import { AdminSectionCard } from "../_components/AdminSectionCard";

export default async function AdminPaymentsPage() {
  await connection();
  const { plans, payments, subscriptions } = await getAdminPaymentsData();

  return (
    <div className="space-y-6">
      <AdminSectionCard
        title="Payment & Plan Summary"
        description="Halaman ini disiapkan untuk package pricing, subscription ringan, dan order pembayaran sederhana."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.id} className="rounded-[1.7rem] bg-[var(--color-surface-alt)] p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-secondary)]">
                {plan.tier}
              </p>
              <h3 className="mt-3 text-xl font-semibold text-[var(--color-text-primary)]">
                {plan.name}
              </h3>
              <p className="mt-2 text-sm leading-7 text-[var(--color-text-secondary)]">
                {plan.description}
              </p>
              <p className="mt-4 text-sm font-medium text-[var(--color-text-primary)]">
                {plan.priceInIdr === 0
                  ? "Custom / Free"
                  : `Rp${plan.priceInIdr.toLocaleString("id-ID")}`}
              </p>
            </article>
          ))}
        </div>
      </AdminSectionCard>

      <AdminSectionCard
        title="Subscription terbaru"
        description="Ringkasan ini berguna untuk memvalidasi siapa yang berada di plan tertentu."
      >
        <div className="space-y-3">
          {subscriptions.length > 0 ? (
            subscriptions.map((subscription) => (
              <div
                key={subscription.id}
                className="rounded-[1.5rem] bg-[var(--color-surface-alt)] px-4 py-4 text-sm text-[var(--color-text-secondary)]"
              >
                <p className="font-medium text-[var(--color-text-primary)]">
                  {subscription.userName ?? subscription.userEmail}
                </p>
                <p className="mt-1">
                  {subscription.planName} â€¢ {subscription.status}
                </p>
              </div>
            ))
          ) : (
            <p className="rounded-[1.5rem] bg-[var(--color-surface-alt)] px-4 py-5 text-sm leading-7 text-[var(--color-text-secondary)]">
              Belum ada subscription yang tersimpan. Catalog plan sudah siap, tinggal dihubungkan ke
              flow checkout saat fase berikutnya.
            </p>
          )}
        </div>
      </AdminSectionCard>

      <AdminSectionCard
        title="Payment order terbaru"
        description="Tempat memantau transaksi sederhana sebelum workflow payment gateway penuh ditambahkan."
      >
        <div className="space-y-3">
          {payments.length > 0 ? (
            payments.map((payment) => (
              <div
                key={payment.id}
                className="rounded-[1.5rem] bg-[var(--color-surface-alt)] px-4 py-4 text-sm text-[var(--color-text-secondary)]"
              >
                <p className="font-medium text-[var(--color-text-primary)]">
                  {payment.userName ?? payment.userEmail}
                </p>
                <p className="mt-1">
                  {payment.status} â€¢ Rp{payment.amountInIdr.toLocaleString("id-ID")}
                </p>
                <p className="mt-1">
                  Template: {payment.templateName ?? "-"} â€¢ Paket: {payment.selectedPackage ?? "-"}
                </p>
              </div>
            ))
          ) : (
            <p className="rounded-[1.5rem] bg-[var(--color-surface-alt)] px-4 py-5 text-sm leading-7 text-[var(--color-text-secondary)]">
              Belum ada payment order yang tercatat.
            </p>
          )}
        </div>
      </AdminSectionCard>
    </div>
  );
}
