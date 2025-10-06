import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap', // Improve font loading performance
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#2563eb",
};

export const metadata: Metadata = {
  title: {
    default: "Shipsy - Modern Shipment Management",
    template: "%s | Shipsy",
  },
  description: "A comprehensive shipment management system built with Next.js 15, TypeScript, and PostgreSQL. Track shipments, manage customers, and analyze delivery statistics.",
  keywords: ["shipment tracking", "logistics", "shipping", "management system", "delivery tracking"],
  authors: [{ name: "Shipsy Team" }],
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "any", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/icon.png",
      },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://shipsy.vercel.app",
    siteName: "Shipsy",
    title: "Shipsy - Modern Shipment Management",
    description: "A comprehensive shipment management system built with Next.js 15, TypeScript, and PostgreSQL. Track shipments, manage customers, and analyze delivery statistics.",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "Shipsy Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Shipsy - Modern Shipment Management",
    description: "A comprehensive shipment management system for tracking shipments and managing deliveries.",
    images: ["/icon-512.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
