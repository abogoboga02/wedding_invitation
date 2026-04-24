import Link from "next/link";

import { SubmitButton } from "@/components/ui/SubmitButton";
import { requireClientUser } from "@/lib/auth/guards";

import { logoutAction } from "@/app/(auth)/_actions/auth-actions";

import { DashboardSidebar } from "./_components/DashboardSidebar";
import { dashboardNavigation } from "./_config/navigation";

const quickLinks = dashboardNavigation.flatMap((group) => group.items);

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireClientUser();

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f3efea,#ffffff)]">
      <div className="mx-auto max-w-[92rem] px-4 py-6 sm:px-6 lg:px-8">
        <header className="surface-panel mb-5 rounded-[2.25rem] px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="font-serif-display text-3xl uppercase tracking-[0.16em] text-[var(--color-rose-dark)]">
                Atelier Amora
              </p>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                Halo, {user.name ?? "Pengantin"}. Semua alur penting undangan Anda ada di sini.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/dashboard/preview"
                className="button-secondary inline-flex justify-center rounded-full px-5 py-3 text-sm font-semibold"
              >
                Preview Publik
              </Link>
              <form action={logoutAction}>
                <SubmitButton className="rounded-full bg-[var(--color-text-primary)] px-5 py-3 text-sm font-semibold text-white">
                  Keluar
                </SubmitButton>
              </form>
            </div>
          </div>

          <nav className="-mx-1 mt-5 flex gap-2 overflow-x-auto px-1 pb-1 xl:hidden">
            {quickLinks.map((item) => (
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

        <div className="grid gap-6 xl:grid-cols-[18rem_minmax(0,1fr)]">
          <DashboardSidebar />
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </main>
  );
}
