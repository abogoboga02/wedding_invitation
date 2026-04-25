"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { dashboardNavigation } from "../_config/navigation";

export function DashboardSidebar() {
  const pathname = usePathname();
  const navigationGroups = useMemo(() => dashboardNavigation, []);

  return (
    <aside className="hidden xl:block">
      <div className="surface-panel sticky top-6 rounded-[2rem] px-5 py-6">
        <div className="space-y-6">
          {navigationGroups.map((group) => (
            <div key={group.title} className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-secondary)]">
                {group.title}
              </p>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <DashboardSidebarItem
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    isActive={pathname === item.href}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

type DashboardSidebarItemProps = {
  href: string;
  label: string;
  isActive: boolean;
};

const DashboardSidebarItem = memo(function DashboardSidebarItem({
  href,
  label,
  isActive,
}: DashboardSidebarItemProps) {
  return (
    <Link
      href={href}
      className={`flex rounded-[1.25rem] px-4 py-3 text-sm font-medium ${
        isActive
          ? "bg-[rgba(240,196,203,0.35)] text-[var(--color-text-primary)]"
          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text-primary)]"
      }`}
    >
      {label}
    </Link>
  );
});
