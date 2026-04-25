import type { PlanTier, SendChannel } from "@/lib/domain/types";

export type PricingPlanDefinition = {
  tier: PlanTier;
  name: string;
  priceLabel: string;
  priceInIdr: number;
  caption: string;
  features: string[];
  cta: string;
  href: string;
  featured?: boolean;
};

export const PRICING_PLANS: PricingPlanDefinition[] = [
  {
    tier: "STARTER",
    name: "Starter",
    priceLabel: "Rp0",
    priceInIdr: 0,
    caption: "untuk mencoba flow, menyusun draft awal, dan memahami dashboard.",
    features: [
      "1 invitation draft aktif",
      "3 template live",
      "Preview internal",
      "Input tamu manual",
    ],
    cta: "Mulai Gratis",
    href: "/register",
  },
  {
    tier: "SIGNATURE",
    name: "Signature",
    priceLabel: "Rp149rb",
    priceInIdr: 149000,
    caption: "sekali bayar untuk satu momen yang ingin terasa personal dan siap dibagikan.",
    features: [
      "Publish invitation",
      "Import CSV dan link tamu personal",
      "RSVP dan analytics dasar",
      "Galeri, cover, dan musik pembuka",
    ],
    cta: "Pilih Paket Signature",
    href: "/register",
    featured: true,
  },
  {
    tier: "STUDIO",
    name: "Studio",
    priceLabel: "Custom",
    priceInIdr: 0,
    caption: "untuk wedding organizer, multi brand, atau kebutuhan volume lebih besar.",
    features: [
      "Multi invitation workflow",
      "Prioritas support",
      "Ruang untuk auto send lanjutan",
      "Opsional setup dan branding",
    ],
    cta: "Diskusikan Kebutuhan",
    href: "/register",
  },
];

export const PRICING_FAQ = [
  {
    question: "Apakah paket Starter bisa dipakai untuk publish?",
    answer:
      "Starter dirancang untuk mencoba alur dan menyusun draft. Publish penuh dan distribusi tamu idealnya menggunakan Signature atau paket di atasnya.",
  },
  {
    question: "Apakah satu akun bisa upgrade setelah draft selesai?",
    answer:
      "Bisa. Draft tetap aman, lalu fitur publish, RSVP, dan distribusi akan mengikuti paket aktif berikutnya.",
  },
  {
    question: "Apakah Studio wajib untuk wedding organizer?",
    answer:
      "Tidak selalu, tetapi Studio paling cocok jika Anda mengelola banyak invitation, butuh support prioritas, atau ingin workflow operasional yang lebih luas.",
  },
];

export const SEND_CHANNEL_LABELS: Record<SendChannel, string> = {
  MANUAL: "Manual",
  WHATSAPP: "WhatsApp",
  EMAIL: "Email",
};
