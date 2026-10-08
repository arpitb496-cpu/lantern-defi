import type { Metadata, Viewport } from "next";
import {
  Instrument_Serif,
  Inter,
  JetBrains_Mono,
  Noto_Serif_Devanagari,
  Noto_Sans_Devanagari,
} from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { WalletContextProvider } from "@/components/wallet/WalletContextProvider";
import { DevnetGuard } from "@/components/layout/DevnetGuard";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const notoSerifDevanagari = Noto_Serif_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "700"],
  variable: "--font-hindi-serif",
  display: "swap",
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600"],
  variable: "--font-hindi-sans",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#07080a",
};

export const metadata: Metadata = {
  title: "Lantern (लालटेन) — Solana Security Shield",
  description:
    "Spot scams, dangerous permissions, and token traps in your Solana wallet before you sign. Minimalist devnet security audit tool.",
  keywords: [
    "Solana",
    "Security",
    "Lantern",
    "Token Scanner",
    "Solana Approvals",
    "Token-2022",
    "Devnet",
    "Crypto Safety",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${inter.variable} ${jetbrainsMono.variable} ${notoSerifDevanagari.variable} ${notoSansDevanagari.variable} dark`}
    >
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col font-sans selection:bg-white/20 selection:text-white antialiased overflow-x-hidden">
        <LanguageProvider>
          <WalletContextProvider>
            <DevnetGuard>
              <Navbar />
              <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {children}
              </main>
              <Footer />
            </DevnetGuard>
          </WalletContextProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
