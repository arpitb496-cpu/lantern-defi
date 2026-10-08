"use client";

import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useTranslation } from "@/i18n/LanguageContext";
import { ShieldAlert, AlertTriangle, ExternalLink } from "lucide-react";

export function DevnetBadge() {
  const { t } = useTranslation();

  return (
    <div
      id="devnet-status-badge"
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wide shadow-sm backdrop-blur-sm"
      title="Connected strictly to Solana Devnet. Mainnet funds are safe."
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
      </span>
      <span>{t("common.devnetBadge")}</span>
    </div>
  );
}

export function DevnetGuard({ children }: { children: React.ReactNode }) {
  const { connected, wallet } = useWallet();
  const { t } = useTranslation();
  const [isMainnetBlocked, setIsMainnetBlocked] = useState(false);

  useEffect(() => {
    if (!connected || !wallet) {
      setIsMainnetBlocked(false);
      return;
    }

    // Inspect wallet adapter properties or standard wallet features for cluster/network indicators
    try {
      // Check if standard solana object exposes cluster/network
      const solanaWindow = typeof window !== "undefined" ? (window as unknown as { solana?: { isPhantom?: boolean; network?: string } }) : null;
      if (solanaWindow?.solana?.network === "mainnet-beta") {
        setIsMainnetBlocked(true);
      } else {
        setIsMainnetBlocked(false);
      }
    } catch {
      setIsMainnetBlocked(false);
    }
  }, [connected, wallet]);

  return (
    <>
      {isMainnetBlocked && (
        <div
          id="mainnet-guard-modal"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="bg-slate-900 border-2 border-red-500/60 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center mx-auto text-red-400">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-bold text-white">
              {t("devnetGuard.modalTitle")}
            </h2>

            <p className="text-slate-300 text-sm leading-relaxed">
              {t("devnetGuard.modalDesc")}
            </p>

            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-left text-xs text-slate-300 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span>How to switch to Devnet:</span>
              </div>
              <p>{t("devnetGuard.actionInstruction")}</p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => setIsMainnetBlocked(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors"
              >
                I switched my wallet to Devnet
              </button>
              <a
                href="https://faucet.solana.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 text-xs text-indigo-400 hover:underline"
              >
                <span>Need Devnet SOL? Open Solana Faucet</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
      {children}
    </>
  );
}
