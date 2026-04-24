import Link from "next/link";

import { logoutAction } from "@/app/(auth)/_actions/auth-actions";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { requireAdminUser } from "@/lib/auth/guards";

import { AdminSidebar } from "./_components/AdminSidebar";
import { adminNavigation } from "./_config/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdminUser();

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff9f5,#ffffff)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="surface-panel mb-6 rounded-[2rem] px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-serif-display text-3xl uppercase tracking-[0.16em] text-[var(--color-rose-dark)]">
                Admin Atelier
              </p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                Halo, {user.name ?? user.email ?? "Admin"}. Area ini khusus akun admin.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/dashboard"
                className="button-secondary inline-flex justify-center rounded-full px-5 py-3 text-sm font-semibold"
              >
                Lihat Dashboard Client
              </Link>
              <form action={logoutAction}>
                <SubmitButton className="rounded-full bg-[var(--color-text-primary)] px-5 py-3 text-sm font-semibold text-white">
                  Keluar
                </SubmitButton>
              </form>
            </div>
          </div>

          <nav className="-mx-1 mt-5 flex gap-2 overflow-x-auto px-1 pb-1 xl:hidden">
            {adminNavigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 rounded-full border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--color-text-secondary)]"
              >
                {item.shortLabel}
              </Link>
            ))}
          </nav>
        </header>

        <div className="grid gap-6 xl:grid-cols-[17rem_minmax(0,1fr)]">
          <AdminSidebar />
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </main>
  );
}
