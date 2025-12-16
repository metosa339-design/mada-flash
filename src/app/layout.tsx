import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mada-Flash.mg - Le Portail de l'Actualité Malgache",
  description: "Mada-Flash.mg rassemble, synthétise et présente l'actualité de Madagascar en temps réel. Sources multiples : 24h Mada, Orange Actu, Midi Madagascar, TVM, et plus encore.",
  keywords: ["actualité", "Madagascar", "news", "Mada-Flash", "information", "politique", "économie", "sport", "culture"],
  authors: [{ name: "Mada-Flash Team" }],
  creator: "Mada-Flash.mg",
  publisher: "Mada-Flash.mg",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Mada-Flash.mg - Le Portail de l'Actualité Malgache",
    description: "L'actualité de Madagascar en temps réel. Toutes les sources, toute l'info.",
    url: "https://mada-flash.mg",
    siteName: "Mada-Flash.mg",
    locale: "fr_MG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mada-Flash.mg - Le Portail de l'Actualité Malgache",
    description: "L'actualité de Madagascar en temps réel",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#ff6b35",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
