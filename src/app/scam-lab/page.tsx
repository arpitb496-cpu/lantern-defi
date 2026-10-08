"use client";

import { ToolGuide } from "@/components/education/ToolGuide";

import React, { useState } from "react";
import Link from "next/navigation";
import { useRouter } from "next/navigation";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useTranslation } from "@/i18n/LanguageContext";
import {
  createScamTestToken,
  createSafeTestToken,
  MintTestTokenResult,
} from "@/lib/solana/scamLabTokens";
import { getExplorerTxUrl } from "@/lib/constants";
import {
  FlaskConical,
  Flame,
  ShieldCheck,
  Loader2,
  ExternalLink,
  ArrowRight,
  AlertTriangle,
  Lock,
  BookOpen,
  KeyRound,
} from "lucide-react";

export default function ScamLabPage() {
  const router = useRouter();
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction } = useWallet();
  const { t, language } = useTranslation();

  const [isCreatingScam, setIsCreatingScam] = useState(false);
  const [isCreatingSafe, setIsCreatingSafe] = useState(false);
  const [lastCreatedToken, setLastCreatedToken] = useState<MintTestTokenResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleMintScam = async () => {
    if (!publicKey) return;
    setIsCreatingScam(true);
    setErrorMsg(null);
    setLastCreatedToken(null);

    try {
      const res = await createScamTestToken(connection, publicKey, sendTransaction);
      setLastCreatedToken(res);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setIsCreatingScam(false);
    }
  };

  const handleMintSafe = async () => {
    if (!publicKey) return;
    setIsCreatingSafe(true);
    setErrorMsg(null);
    setLastCreatedToken(null);

    try {
      const res = await createSafeTestToken(connection, publicKey, sendTransaction);
      setLastCreatedToken(res);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setIsCreatingSafe(false);
    }
  };

  return (
    <div className="space-y-12 animate-fade-in-up">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-xs text-[var(--muted)]">
          <span className="font-mono text-[11px] tracking-wider uppercase text-[var(--text)]">
            MODULE 04 / TEST LAB
          </span>
        </div>
        <h1 className="font-serif text-4xl sm:text-6xl text-white font-normal tracking-tight">
          {t("scamLab.title")}
        </h1>
        <p className="text-[var(--muted)] text-sm sm:text-base max-w-2xl font-normal leading-relaxed">
          {t("scamLab.subtitle")}
        </p>
      </div>

      <ToolGuide tool="scamLab" />

      {/* Wallet Guard Prompt */}
      {!connected && (
        <div className="card-chrome p-8 text-center space-y-2">
          <FlaskConical className="w-8 h-8 text-[var(--muted)] mx-auto stroke-[1.5]" />
          <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
            {language === "hi"
              ? "डेवनेट पर सुरक्षित रूप से टेस्ट टोकन बनाने के लिए कृपया अपना वॉलेट कनेक्ट करें।"
              : "Connect your Solana wallet to mint test tokens directly onto Solana Devnet."}
          </p>
        </div>
      )}

      {/* Error View */}
      {errorMsg && (
        <div className="p-4 rounded-2xl border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.04)] text-[#f87171] text-xs flex items-center gap-2.5 animate-fade-in-up">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <p>{errorMsg}</p>
        </div>
      )}

      {/* Token Creation Result Card */}
      {lastCreatedToken && (
        <div className="card-chrome p-6 border-white/20 bg-[var(--surface-2)] space-y-4 animate-fade-in-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="tag-chip font-mono text-[10px] uppercase">
                {t(lastCreatedToken.type === "scam" ? "scamLab.riggedCreated" : "scamLab.comparisonCreated")}
              </span>
              <h3 className="font-serif text-2xl text-white font-normal">
                {t("scamLab.mintSuccess")}
              </h3>
              <p className="font-mono text-xs text-[var(--muted)] truncate max-w-md">
                Mint: {lastCreatedToken.mintAddress}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={getExplorerTxUrl(lastCreatedToken.signature)}
                target="_blank"
                rel="noreferrer"
                className="btn-chrome text-xs py-2 px-3"
              >
                <span>Explorer</span>
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>

              <button
                onClick={() =>
                  router.push(`/scanner?mint=${encodeURIComponent(lastCreatedToken.mintAddress)}`)
                }
                className="btn-chrome text-xs py-2 px-4 text-white flex items-center gap-1.5"
              >
                <span>{t("scamLab.scanNow")}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generator Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Scam Token Generator Card */}
        <div className="card-chrome p-6 sm:p-8 space-y-5 border-[rgba(248,113,113,0.25)] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="tag-chip font-mono text-[10px] text-[#f87171] border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.05)]">
                {t("scamLab.riskyPermissions")}
              </span>
              <div className="w-8 h-8 rounded-full border border-[rgba(248,113,113,0.3)] bg-[var(--surface-2)] flex items-center justify-center text-[#f87171]">
                <Flame className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1.5">
              <h2 className="font-serif text-3xl text-white font-normal">
                {t("scamLab.createScamTitle")}
              </h2>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                {t("scamLab.createScamDesc")}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-[var(--border)] text-xs text-[var(--muted)]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f87171]" />
                <span>{t("scanner.freezeAuthorityActive")}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f87171]" />
                <span>{t("scanner.mintAuthorityActive")}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f87171]" />
                <span>{t("scanner.permanentDelegateActive")}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleMintScam}
            disabled={!connected || isCreatingScam || isCreatingSafe}
            className="btn-chrome text-xs py-2.5 px-6 w-full justify-center disabled:opacity-50 mt-4 flex items-center gap-2"
          >
            {isCreatingScam ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{t("scamLab.creating")}</span>
              </>
            ) : (
              <span>{t("scamLab.createScamBtn")}</span>
            )}
          </button>
        </div>

        {/* 2. Safe Token Generator Card */}
        <div className="card-chrome p-6 sm:p-8 space-y-5 border-[rgba(52,211,153,0.25)] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="tag-chip font-mono text-[10px] text-[#34d399] border-[rgba(52,211,153,0.3)] bg-[rgba(52,211,153,0.05)]">
                {t("scamLab.revokedAuthorities")}
              </span>
              <div className="w-8 h-8 rounded-full border border-[rgba(52,211,153,0.3)] bg-[var(--surface-2)] flex items-center justify-center text-[#34d399]">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1.5">
              <h2 className="font-serif text-3xl text-white font-normal">
                {t("scamLab.createSafeTitle")}
              </h2>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                {t("scamLab.createSafeDesc")}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-[var(--border)] text-xs text-[var(--muted)]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]" />
                <span>{t("scanner.freezeAuthorityClean")}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]" />
                <span>{t("scanner.mintAuthorityClean")}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]" />
                <span>{t("scamLab.noPermanentDelegate")}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleMintSafe}
            disabled={!connected || isCreatingScam || isCreatingSafe}
            className="btn-chrome text-xs py-2.5 px-6 w-full justify-center disabled:opacity-50 mt-4 flex items-center gap-2"
          >
            {isCreatingSafe ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{t("scamLab.creating")}</span>
              </>
            ) : (
              <span>{t("scamLab.createSafeBtn")}</span>
            )}
          </button>
        </div>
      </section>

      {/* Guided Learn Center (Educational Accordion) */}
      <section className="space-y-6 pt-4">
        <div className="flex items-center gap-3 border-b border-[var(--border)] pb-3">
          <BookOpen className="w-4 h-4 text-white/80" />
          <h2 className="font-serif text-2xl text-white font-normal">
            {t("scamLab.learnTitle")}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card-chrome p-5 space-y-3">
            <div className="flex items-center gap-2 text-white">
              <Lock className="w-4 h-4 text-[#f87171]" />
              <h3 className="font-medium text-sm">
                {t("scamLab.learnFreeze")}
              </h3>
            </div>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              {t("scamLab.learnFreezeDesc")}
            </p>
          </div>

          <div className="card-chrome p-5 space-y-3">
            <div className="flex items-center gap-2 text-white">
              <Flame className="w-4 h-4 text-[#f87171]" />
              <h3 className="font-medium text-sm">
                {t("scamLab.learnMint")}
              </h3>
            </div>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              {t("scamLab.learnMintDesc")}
            </p>
          </div>

          <div className="card-chrome p-5 space-y-3">
            <div className="flex items-center gap-2 text-white">
              <KeyRound className="w-4 h-4 text-[#f87171]" />
              <h3 className="font-medium text-sm">
                {t("scamLab.learnDelegate")}
              </h3>
            </div>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              {t("scamLab.learnDelegateDesc")}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
