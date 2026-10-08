"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useTranslation } from "@/i18n/LanguageContext";
import { scanTokenMint } from "@/lib/solana/scanner";
import { TokenScanResult, RiskFlag } from "@/lib/solana/riskScorer";
import { fetchWalletPortfolio } from "@/lib/solana/walletTokens";
import { getExplorerAddressUrl } from "@/lib/constants";
import {
  Search,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
  Lock,
  Flame,
  CheckCircle2,
  Wallet,
} from "lucide-react";

function ScannerContent() {
  const searchParams = useSearchParams();
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const { t, language } = useTranslation();

  const [inputMint, setInputMint] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<TokenScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [userTokens, setUserTokens] = useState<{ mint: string; symbol?: string; balance: number }[]>([]);
  const [expandedFlagId, setExpandedFlagId] = useState<string | null>(null);

  const performScan = useCallback(async (mintStr: string) => {
    if (!mintStr.trim()) return;
    setIsScanning(true);
    setErrorMsg(null);
    setScanResult(null);

    try {
      const result = await scanTokenMint(connection, mintStr.trim());
      setScanResult(result);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setIsScanning(false);
    }
  }, [connection]);

  useEffect(() => {
    const mintParam = searchParams.get("mint");
    if (mintParam) {
      setInputMint(mintParam);
      performScan(mintParam);
    }
  }, [searchParams, performScan]);

  useEffect(() => {
    if (connected && publicKey) {
      fetchWalletPortfolio(connection, publicKey).then((port) => {
        setUserTokens(
          port.tokens.map((t) => ({ mint: t.mint, balance: t.balance }))
        );
      });
    }
  }, [connected, publicKey, connection]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performScan(inputMint);
  };

  const toggleFlag = (id: string) => {
    setExpandedFlagId(expandedFlagId === id ? null : id);
  };

  const getVerdictStyle = (verdict: TokenScanResult["verdict"]) => {
    switch (verdict) {
      case "safe":
        return {
          color: "#34d399",
          border: "border-[rgba(52,211,153,0.3)]",
          bg: "bg-[rgba(52,211,153,0.04)]",
          icon: ShieldCheck,
          label: language === "hi" ? "सुरक्षित और कम जोखिम" : "Clean & Low Risk",
        };
      case "caution":
        return {
          color: "#fbbf24",
          border: "border-[rgba(251,191,36,0.3)]",
          bg: "bg-[rgba(251,191,36,0.04)]",
          icon: AlertTriangle,
          label: language === "hi" ? "सावधानी बरतें" : "Moderate Risk — Exercise Caution",
        };
      case "danger":
        return {
          color: "#f87171",
          border: "border-[rgba(248,113,113,0.3)]",
          bg: "bg-[rgba(248,113,113,0.04)]",
          icon: ShieldAlert,
          label: language === "hi" ? "अत्यधिक खतरनाक / संभावित स्कैम" : "High Danger / Potential Scam",
        };
    }
  };

  return (
    <div className="space-y-12 animate-fade-in-up">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-xs text-[var(--muted)]">
          <span className="font-mono text-[11px] tracking-wider uppercase text-[var(--text)]">
            MODULE 01 / TOKEN AUDIT
          </span>
        </div>
        <h1 className="font-serif text-4xl sm:text-6xl text-white font-normal tracking-tight">
          Token Risk <span className="italic font-normal text-chrome">Scanner</span>
        </h1>
        <p className="text-[var(--muted)] text-sm sm:text-base max-w-2xl font-normal leading-relaxed">
          {t("scanner.subtitle")}
        </p>
      </div>

      {/* Input Section */}
      <section className="card-chrome p-6 sm:p-8 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="text-xs font-mono text-[var(--muted)] uppercase tracking-wider block">
            {t("scanner.inputLabel")}
          </label>
          <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center rounded-2xl sm:rounded-full border border-[var(--border)] bg-[var(--surface-2)] p-1.5 transition-all focus-within:border-white/30">
            <div className="flex items-center flex-1 px-3 py-2">
              <Search className="w-4 h-4 text-[var(--muted)] mr-2 shrink-0" />
              <input
                id="scanner-mint-input"
                type="text"
                value={inputMint}
                onChange={(e) => setInputMint(e.target.value)}
                placeholder={t("scanner.inputPlaceholder")}
                className="w-full bg-transparent text-sm text-white placeholder-[var(--muted)] focus:outline-none font-mono text-xs sm:text-sm"
              />
            </div>
            <button
              id="scanner-submit-btn"
              type="submit"
              disabled={isScanning || !inputMint.trim()}
              className="btn-chrome text-xs py-2.5 px-6 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{t("scanner.scanning")}</span>
                </>
              ) : (
                <span>{t("scanner.scanBtn")}</span>
              )}
            </button>
          </div>
        </form>

        {/* Quick select from user wallet */}
        {userTokens.length > 0 && (
          <div className="pt-2 border-t border-[var(--border)] flex flex-wrap items-center gap-2">
            <span className="text-xs text-[var(--muted)] font-mono flex items-center gap-1.5 mr-1">
              <Wallet className="w-3.5 h-3.5" />
              <span>Wallet Tokens:</span>
            </span>
            {userTokens.map((t) => (
              <button
                key={t.mint}
                onClick={() => {
                  setInputMint(t.mint);
                  performScan(t.mint);
                }}
                className="tag-chip text-xs hover:border-white/30"
              >
                <span className="font-mono">{t.mint.slice(0, 4)}...{t.mint.slice(-4)}</span>
                <span className="text-[var(--text)]">({t.balance})</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Error Message */}
      {errorMsg && (
        <div className="p-4 rounded-2xl border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.05)] text-[#f87171] text-xs flex items-center gap-3 animate-fade-in-up">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <p>{errorMsg}</p>
        </div>
      )}

      {/* Results View */}
      {scanResult && (
        <section className="space-y-6 animate-fade-in-up">
          {/* Verdict Banner Card */}
          {(() => {
            const v = getVerdictStyle(scanResult.verdict);
            const Icon = v.icon;
            return (
              <div
                className={`card-chrome p-6 sm:p-8 ${v.border} ${v.bg} space-y-4`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-12 h-12 rounded-full border flex items-center justify-center shrink-0"
                      style={{ borderColor: v.color, color: v.color }}
                    >
                      <Icon className="w-6 h-6" strokeWidth={1.75} />
                    </div>
                    <div>
                      <span className="font-mono text-xs uppercase tracking-wider text-[var(--muted)]">
                        Audit Verdict
                      </span>
                      <h2 className="font-serif text-3xl sm:text-4xl text-white font-normal">
                        {v.label}
                      </h2>
                    </div>
                  </div>

                  {/* Score Dial */}
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] shrink-0 self-start sm:self-auto">
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-[var(--muted)] uppercase tracking-wider block">
                        Risk Score
                      </span>
                      <span
                        className="font-mono text-2xl font-bold"
                        style={{ color: v.color }}
                      >
                        {scanResult.score}
                        <span className="text-xs text-[var(--muted)] font-normal">/100</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mint Info Chips */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-[var(--border)]">
                  <div className="tag-chip font-mono">
                    <span className="text-[var(--muted)]">Type:</span> {scanResult.programType}
                  </div>
                  <div className="tag-chip font-mono">
                    <span className="text-[var(--muted)]">Supply:</span> {scanResult.supply}
                  </div>
                  <div className="tag-chip font-mono">
                    <span className="text-[var(--muted)]">Decimals:</span> {scanResult.decimals}
                  </div>
                  <a
                    href={getExplorerAddressUrl(scanResult.mint)}
                    target="_blank"
                    rel="noreferrer"
                    className="tag-chip font-mono text-white hover:border-white/30 ml-auto"
                  >
                    <span>Explorer</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </div>
            );
          })()}

          {/* Detected Risk Flags List */}
          <div className="space-y-4">
            <h3 className="font-serif text-2xl text-white font-normal flex items-center justify-between">
              <span>{t("scanner.flagsTitle")}</span>
              <span className="font-mono text-xs text-[var(--muted)]">
                {scanResult.flags.length} DETECTED
              </span>
            </h3>

            {scanResult.flags.length > 0 ? (
              <div className="space-y-3">
                {scanResult.flags.map((flag: RiskFlag) => {
                  const isExpanded = expandedFlagId === flag.id;
                  const isHigh = flag.severity === "high";
                  return (
                    <div
                      key={flag.id}
                      className={`card-chrome p-5 transition-all ${
                        isHigh
                          ? "border-[rgba(248,113,113,0.3)]"
                          : "border-[rgba(251,191,36,0.3)]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                              isHigh
                                ? "border-[#f87171] text-[#f87171]"
                                : "border-[#fbbf24] text-[#fbbf24]"
                            }`}
                          >
                            {isHigh ? (
                              <Flame className="w-3.5 h-3.5" />
                            ) : (
                              <Lock className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-medium text-sm text-white">
                                {language === "hi" ? flag.titleHi : flag.titleEn}
                              </h4>
                              <span
                                className={`tag-chip font-mono text-[10px] py-0 px-2 uppercase ${
                                  isHigh
                                    ? "text-[#f87171] border-[rgba(248,113,113,0.3)]"
                                    : "text-[#fbbf24] border-[rgba(251,191,36,0.3)]"
                                }`}
                              >
                                {flag.severity} risk (+{flag.points})
                              </span>
                            </div>
                            <p className="text-xs text-[var(--muted)]">
                              {language === "hi" ? flag.summaryHi : flag.summaryEn}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleFlag(flag.id)}
                          className="btn-chrome text-xs py-1 px-3 shrink-0 flex items-center gap-1 text-[var(--muted)] hover:text-white"
                        >
                          <span>{t("common.whatDoesThisMean")}</span>
                          {isExpanded ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      </div>

                      {/* Expandable Explanation */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-[var(--border)] text-xs text-[var(--text)] leading-relaxed bg-[var(--surface-2)] p-4 rounded-xl space-y-2 animate-fade-in-up">
                          <p className="font-normal">
                            {language === "hi"
                              ? flag.explanationHi
                              : flag.explanationEn}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-2xl card-chrome text-center space-y-2">
                <CheckCircle2 className="w-6 h-6 text-[#34d399] mx-auto" />
                <p className="text-sm text-white font-medium">
                  {t("scanner.noFlags")}
                </p>
                <p className="text-xs text-[var(--muted)]">
                  Authorities revoked and supply is strictly controlled.
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default function ScannerPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs font-mono text-[var(--muted)]">Loading scanner...</div>}>
      <ScannerContent />
    </Suspense>
  );
}
