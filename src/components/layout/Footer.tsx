"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "@/i18n/LanguageContext";
import { Shield, ExternalLink, Terminal } from "lucide-react";

export function Footer() {
  const { t, language } = useTranslation();

  return (
    <footer className="border-t border-[var(--border)] bg-[#07080a] text-[var(--muted)] text-xs py-10 transition-colors">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full border border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-center text-white">
              <Shield className="w-3 h-3 text-white/80" strokeWidth={1.75} />
            </div>
            <span className="font-serif text-base text-white font-normal">
              Lantern
            </span>
            <span className="text-[var(--border)]">/</span>
            <span className="text-xs text-[var(--muted)]">
              {language === "hi"
                ? "सोलाना डेवनेट सुरक्षा संतरी"
                : "Solana Devnet Security Shield"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs text-[var(--muted)]">
            <a
              href="https://faucet.solana.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:text-white transition-colors"
            >
              <span>Devnet Faucet</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://solana.com/docs"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:text-white transition-colors"
            >
              <span>Solana Docs</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <Link
              href="/scam-lab"
              className="inline-flex items-center gap-1 hover:text-white transition-colors"
            >
              <Terminal className="w-3 h-3" />
              <span>Scam Lab</span>
            </Link>
          </div>
        </div>

        {/* Mandatory Hard-Constraint Disclaimer */}
        <div className="py-2.5 px-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center text-center">
          <p className="text-[11px] text-[var(--muted)] font-normal">
            {t("common.devnetDisclaimer")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#555a64] gap-2 pt-2">
          <p>© 2026 Lantern — Open-source educational safety.</p>
          <p className="font-mono text-[10px]">CLUSTER: DEVNET</p>
        </div>
      </div>
    </footer>
  );
}
