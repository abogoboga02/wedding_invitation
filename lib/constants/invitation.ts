import type { InvitationTemplate, RsvpStatus } from "@/lib/domain/types";

export const RESERVED_SLUGS = new Set([
  "login",
  "register",
  "forgot-password",
  "reset-password",
  "dashboard",
  "admin",
  "api",
  "preview",
  "pricing",
  "templates",
]);

export const TEMPLATE_OPTIONS: Array<{
  id: InvitationTemplate;
  label: string;
  slug: string;
  category: "CLASSIC" | "ROMANTIC" | "MODERN";
  previewImage: string;
  priceInIdr: number;
  isPremium: boolean;
  tagline: string;
  description: string;
}> = [
  {
    id: "ELEGANT_LUXURY",
    label: "Elegant Luxury",
    slug: "elegant-luxury",
    category: "CLASSIC",
    previewImage: "/templates/elegant-luxury-preview.jpg",
    priceInIdr: 249000,
    isPremium: true,
    tagline: "Hitam, gold, dan serif berkelas.",
    description:
      "Untuk pasangan yang ingin kesan mewah, tegas, dan terasa eksklusif sejak pembuka.",
  },
  {
    id: "KOREAN_SOFT",
    label: "Korean Soft",
    slug: "korean-soft",
    category: "ROMANTIC",
    previewImage: "/templates/korean-soft-preview.jpg",
    priceInIdr: 149000,
    isPremium: false,
    tagline: "Pastel lembut, modern, dan romantis.",
    description:
      "Nuansa ringan dengan sentuhan feminin yang bersih dan nyaman dibaca di layar ponsel.",
  },
  {
    id: "MODERN_MINIMAL",
    label: "Modern Minimal",
    slug: "modern-minimal",
    category: "MODERN",
    previewImage: "/templates/modern-minimal-preview.jpg",
    priceInIdr: 179000,
    isPremium: false,
    tagline: "Monokrom sederhana yang tetap classy.",
    description:
      "Pendekatan minimal dengan ritme visual rapi untuk pasangan yang suka gaya kontemporer.",
  },
];

export const RSVP_STATUS_OPTIONS: Array<{
  value: RsvpStatus;
  label: string;
}> = [
  { value: "ATTENDING", label: "Hadir" },
  { value: "MAYBE", label: "Masih menyesuaikan" },
  { value: "DECLINED", label: "Belum bisa hadir" },
];

export const RSVP_STATUS_LABELS: Record<RsvpStatus, string> = Object.fromEntries(
  RSVP_STATUS_OPTIONS.map((option) => [option.value, option.label]),
) as Record<RsvpStatus, string>;

export const DEFAULT_COPY = {
  headline: "The Wedding of",
  subheadline: "Sebuah undangan digital yang terasa personal untuk setiap tamu tercinta.",
  story:
    "Dengan penuh syukur, kami mengundang Anda untuk turut merayakan hari bahagia kami. Kehadiran dan doa restu Anda akan menjadi hadiah terindah dalam langkah baru kami.",
  closingNote:
    "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.",
};
