import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IASN - Crée ton site internet en 1 minute",
  description: "Simple • Rapide • Sans effort. Créez votre site internet professionnel en quelques clics.",
  keywords: ["site web", "création site", "Sénégal", "Afrique", "simple", "rapide"],
  authors: [{ name: "IASN" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "IASN - Crée ton site internet",
    description: "Simple • Rapide • Sans effort",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
