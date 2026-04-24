import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";

const siteUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Atelier Mempelai",
    template: "%s | Atelier Mempelai",
  },
  description:
    "MVP web app undangan digital personal dengan link tamu unik, dashboard pengantin, dan template premium.",
  applicationName: "Atelier Mempelai",
  keywords: [
    "undangan digital",
    "wedding invitation",
    "personal link tamu",
    "dashboard undangan",
    "RSVP online",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: siteUrl,
    title: "Atelier Mempelai",
    description:
      "Undangan digital personal dengan link tamu unik, dashboard ringan, dan template premium.",
    siteName: "Atelier Mempelai",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Atelier Mempelai",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Atelier Mempelai",
    description:
      "Undangan digital personal dengan link tamu unik, dashboard ringan, dan template premium.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      data-scroll-behavior="smooth"
      className={`${plusJakartaSans.variable} ${cormorantGaramond.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
