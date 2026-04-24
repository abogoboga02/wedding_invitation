"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "#template", label: "Template" },
  { href: "#why-us", label: "Keunggulan" },
  { href: "#flow", label: "Cara Kerja" },
  { href: "#pricing", label: "Harga" },
  { href: "/login", label: "Masuk" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative md:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--color-border)] bg-white/80 text-[var(--color-text-primary)] shadow-[var(--shadow-soft)]"
        aria-expanded={open}
        aria-label="Buka navigasi"
      >
        <span className="relative block h-4 w-4">
          <span
            className={`absolute left-0 top-0.5 h-[1.5px] w-4 rounded-full bg-current transition-transform duration-200 ${
              open ? "translate-y-[6px] rotate-45" : ""
            }`}
          />
          <span
            className={`absolute left-0 top-[7px] h-[1.5px] w-4 rounded-full bg-current transition-opacity duration-200 ${
              open ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`absolute left-0 top-[13px] h-[1.5px] w-4 rounded-full bg-current transition-transform duration-200 ${
              open ? "-translate-y-[6px] -rotate-45" : ""
            }`}
          />
        </span>
      </button>

      {open ? (
        <div className="absolute right-0 top-14 z-30 w-[min(19rem,calc(100vw-2rem))] rounded-[2rem] border border-[var(--color-border)] bg-white/95 p-5 backdrop-blur shadow-[var(--shadow-float)]">
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-alt)]"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="rounded-full bg-[var(--color-primary-strong)] px-5 py-3 text-center text-sm font-semibold text-white shadow-[var(--shadow-button)]"
            >
              Mulai Rancang Undangan
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
