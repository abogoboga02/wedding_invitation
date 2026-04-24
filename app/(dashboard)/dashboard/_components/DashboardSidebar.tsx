"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { dashboardNavigation } from "../_config/navigation";

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden xl:block">
      <div className="surface-panel sticky top-6 rounded-[2rem] px-5 py-6">
        <div className="space-y-6">
          {dashboardNavigation.map((group) => (
            <div key={group.title} className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-secondary)]">
                {group.title}
              </p>
              <div className="space-y-2">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex rounded-[1.25rem] px-4 py-3 text-sm font-medium ${
                        isActive
                          ? "bg-[rgba(240,196,203,0.35)] text-[var(--color-text-primary)]"
                          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text-primary)]"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
