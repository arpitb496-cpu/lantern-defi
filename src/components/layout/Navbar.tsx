"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { useTranslation } from "@/i18n/LanguageContext";
import {
  Shield,
  Search,
  KeyRound,
  FileCheck2,
  FlaskConical,
  Globe2,
  Languages,
  Menu,
  X,
  LayoutDashboard,
} from "lucide-react";

const WalletMultiButton = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export function Navbar() {
  const pathname = usePathname();
  const { t, language, toggleLanguage } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: t("nav.dashboard"), icon: LayoutDashboard },
    { href: "/scanner", label: t("nav.scanner"), icon: Search },
    { href: "/approvals", label: t("nav.approvals"), icon: KeyRound },
    { href: "/preview", label: t("nav.txPreview"), icon: FileCheck2 },
    { href: "/scam-lab", label: t("nav.scamLab"), icon: FlaskConical },
    { href: "/domain-check", label: t("nav.domainCheck"), icon: Globe2 },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[#07080a]/80 backdrop-blur-md transition-all">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Left: Brand Logo & Devnet Badge */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-8 h-8 rounded-full border border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-center transition-all group-hover:border-white/30">
                <Shield className="w-4 h-4 text-white/90" strokeWidth={1.75} />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif text-xl tracking-tight text-white font-normal">
                  SolKavach
                </span>
                <span className="hidden sm:inline text-[11px] font-mono text-[var(--muted)]">
                  [devnet]
                </span>
              </div>
            </Link>

            {/* Devnet Badge (Minimalist) */}
            <div
              id="devnet-status-badge"
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-[rgba(251,191,36,0.25)] bg-[rgba(251,191,36,0.05)] text-[#fbbf24] text-[11px] font-medium tracking-wide shrink-0"
              title="Connected strictly to Solana Devnet."
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#fbbf24] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#fbbf24]"></span>
              </span>
              <span>DEVNET</span>
            </div>
          </div>

          {/* Center: Minimalist Text Links (No pill background, chrome underline on active) */}
          <nav className="hidden md:flex items-center gap-6 shrink-0">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative py-1 text-[13px] font-normal transition-colors whitespace-nowrap ${
                    isActive
                      ? "text-white font-medium"
                      : "text-[var(--muted)] hover:text-white"
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/80 to-transparent rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Language Switcher */}
            <button
              id="language-toggle-btn"
              onClick={toggleLanguage}
              aria-label="Toggle language between English and Hindi"
              className="h-9 px-2 sm:px-3 rounded-full border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--muted)] hover:text-white text-xs font-medium transition-all flex items-center justify-center gap-1 shrink-0"
            >
              <Languages className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap font-medium hidden sm:inline">
                {language === "en" ? "हिन्दी" : "English"}
              </span>
              <span className="whitespace-nowrap font-medium sm:hidden">
                {language === "en" ? "HI" : "EN"}
              </span>
            </button>

            {/* Wallet Button */}
            <div className="wallet-button-container shrink-0">
              <WalletMultiButton />
            </div>

            {/* Hamburger Button (< 768px) */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden h-9 w-9 flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-white hover:border-white/20 transition-all shrink-0"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu (< 768px) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[#07080a]/95 backdrop-blur-xl px-4 py-4 space-y-1.5 animate-fade-in-up">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                  isActive
                    ? "bg-[var(--surface-2)] text-white font-medium"
                    : "text-[var(--muted)] hover:text-white hover:bg-[var(--surface)]"
                }`}
              >
                <Icon className="w-4 h-4 text-[var(--muted)]" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
