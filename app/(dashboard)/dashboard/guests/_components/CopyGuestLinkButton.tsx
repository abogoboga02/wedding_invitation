"use client";

import { useState } from "react";

type CopyGuestLinkButtonProps = {
  path: string;
};

async function copyText(value: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export function CopyGuestLinkButton({ path }: CopyGuestLinkButtonProps) {
  const [label, setLabel] = useState("Copy Link");

  async function handleCopy() {
    try {
      const absoluteUrl =
        typeof window !== "undefined" ? `${window.location.origin}${path}` : path;

      await copyText(absoluteUrl);
      setLabel("Tersalin");
      window.setTimeout(() => setLabel("Copy Link"), 1800);
    } catch {
      setLabel("Gagal Copy");
      window.setTimeout(() => setLabel("Copy Link"), 1800);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)]"
    >
      {label}
    </button>
  );
}
