import Link from "next/link";
import { connection } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { formatAdminDateTime } from "@/lib/utils/date";

const statCards = [
  {
    key: "users",
    label: "Total akun",
    description: "Semua akun yang terdaftar di aplikasi.",
  },
  {
    key: "admins",
    label: "Akun admin",
    description: "Akun dengan akses penuh ke panel admin.",
  },
  {
    key: "invitations",
    label: "Total invitation",
    description: "Seluruh invitation yang sudah dibuat client.",
  },
  {
    key: "published",
    label: "Invitation published",
    description: "Invitation yang sudah aktif dan bisa dibuka tamu.",
  },
  {
    key: "guests",
    label: "Total tamu",
    description: "Akumulasi guest list dari semua invitation.",
  },
  {
    key: "rsvps",
    label: "Total RSVP",
    description: "Respons tamu yang sudah masuk ke sistem.",
  },
] as const;

export default async function AdminPage() {
  await connection();

  const [users, admins, invitations, published, guests, rsvps, recentUsers, recentInvitations] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { role: "ADMIN" },
      }),
      prisma.invitation.count(),
      prisma.invitation.count({
        where: { status: "PUBLISHED" },
      }),
      prisma.guest.count(),
      prisma.rsvp.count(),
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      }),
      prisma.invitation.findMany({
        select: {
          id: true,
          coupleSlug: true,
          partnerOneName: true,
          partnerTwoName: true,
          status: true,
          updatedAt: true,
          owner: {
            select: {
              email: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 5,
      }),
    ]);

  const values = {
    users,
    admins,
    invitations,
    published,
    guests,
    rsvps,
  };

  return (
    <section className="space-y-6">
      <div className="surface-panel rounded-[2rem] px-5 py-6 sm:px-6">
        <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-text-secondary)]">
          Overview
        </p>
        <h1 className="mt-3 font-serif-display text-4xl text-[var(--color-text-primary)]">
          Ringkasan admin MVP
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-text-secondary)]">
          Area ini dipisahkan dari dashboard client untuk membantu admin memantau akun,
          invitation, tamu, RSVP, dan template tanpa mencampur flow pengantin.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card) => (
          <article key={card.key} className="surface-panel rounded-[1.75rem] px-5 py-5">
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-[var(--color-text-primary)]">
              {values[card.key]}
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--color-text-secondary)]">
              {card.description}
            </p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="surface-panel rounded-[2rem] px-5 py-6 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-text-secondary)]">
                User terbaru
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">
                Pantau akun yang baru masuk
              </h2>
            </div>
            <Link
              href="/admin/users"
              className="button-secondary inline-flex rounded-full px-4 py-2.5 text-sm font-semibold"
            >
              Lihat semua user
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {recentUsers.map((user) => (
              <article
                key={user.id}
                className="rounded-[1.5rem] bg-[var(--color-surface-alt)] px-4 py-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-[var(--color-text-primary)]">
                      {user.name ?? "Tanpa nama"}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{user.email}</p>
                  </div>
                  <div className="text-sm text-[var(--color-text-secondary)] sm:text-right">
                    <p>{user.role}</p>
                    <p className="mt-1">{formatAdminDateTime(user.createdAt)}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="surface-panel rounded-[2rem] px-5 py-6 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-text-secondary)]">
                Invitation terbaru
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text-primary)]">
                Review invitation yang paling aktif
              </h2>
            </div>
            <Link
              href="/admin/invitations"
              className="button-secondary inline-flex rounded-full px-4 py-2.5 text-sm font-semibold"
            >
              Lihat semua invitation
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {recentInvitations.map((invitation) => (
              <article
                key={invitation.id}
                className="rounded-[1.5rem] bg-[var(--color-surface-alt)] px-4 py-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-[var(--color-text-primary)]">
                      {invitation.partnerOneName} & {invitation.partnerTwoName}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                      /{invitation.coupleSlug} | {invitation.owner.email}
                    </p>
                  </div>
                  <div className="text-sm text-[var(--color-text-secondary)] sm:text-right">
                    <p>{invitation.status}</p>
                    <p className="mt-1">{formatAdminDateTime(invitation.updatedAt)}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
