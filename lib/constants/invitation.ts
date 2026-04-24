import type { InvitationTemplate, RsvpStatus } from "@prisma/client";

export const RESERVED_SLUGS = new Set([
  "login",
  "register",
  "dashboard",
  "api",
  "preview",
]);

export const TEMPLATE_OPTIONS: Array<{
  id: InvitationTemplate;
  label: string;
  tagline: string;
  description: string;
}> = [
  {
    id: "ELEGANT_LUXURY",
    label: "Elegant Luxury",
    tagline: "Hitam, gold, dan serif berkelas.",
    description:
      "Untuk pasangan yang ingin kesan mewah, tegas, dan terasa eksklusif sejak pembuka.",
  },
  {
    id: "KOREAN_SOFT",
    label: "Korean Soft",
    tagline: "Pastel lembut, modern, dan romantis.",
    description:
      "Nuansa ringan dengan sentuhan feminin yang bersih dan nyaman dibaca di layar ponsel.",
  },
  {
    id: "MODERN_MINIMAL",
    label: "Modern Minimal",
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
