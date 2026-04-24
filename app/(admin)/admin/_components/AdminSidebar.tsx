"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { adminNavigation } from "../_config/navigation";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="surface-panel hidden rounded-[2rem] p-4 xl:block">
      <p className="px-3 pt-2 text-xs uppercase tracking-[0.28em] text-[var(--color-text-secondary)]">
        Admin Panel
      </p>
      <nav className="mt-4 space-y-2">
        {adminNavigation.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-[1.35rem] px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-[rgba(240,196,203,0.46)] text-[var(--color-text-primary)] shadow-[0_12px_24px_rgba(141,85,96,0.08)]"
                  : "text-[var(--color-text-secondary)] hover:bg-white hover:text-[var(--color-text-primary)]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
