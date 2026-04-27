import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";

import { getSiteMetadataBase, getSiteUrl } from "@/lib/utils/site-url";

import "./globals.css";

const siteUrl = getSiteUrl();
const siteMetadataBase = getSiteMetadataBase();

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
  metadataBase: siteMetadataBase,
  title: {
    default: "Atelier Amora",
    template: "%s | Atelier Amora",
  },
  description:
    "MVP web app undangan digital dengan link tamu yang rapi, dashboard pengantin, dan template premium.",
  applicationName: "Atelier Amora",
  keywords: [
    "undangan digital",
    "wedding invitation",
    "link tamu",
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
    title: "Atelier Amora",
    description:
      "Undangan digital dengan link tamu yang rapi, dashboard ringan, dan template premium.",
    siteName: "Atelier Amora",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Atelier Amora",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Atelier Amora",
    description:
      "Undangan digital dengan link tamu yang rapi, dashboard ringan, dan template premium.",
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
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
