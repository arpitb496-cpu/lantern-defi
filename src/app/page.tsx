"use client";

import { HowLanternChecks } from "@/components/education/HowLanternChecks";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import { useTranslation } from "@/i18n/LanguageContext";
import { AirdropButton } from "@/components/wallet/AirdropButton";
import {
  fetchWalletPortfolio,
  WalletPortfolio,
} from "@/lib/solana/walletTokens";
import { getExplorerAddressUrl } from "@/lib/constants";
import {
  Search,
  KeyRound,
  FileCheck2,
  FlaskConical,
  Globe2,
  Copy,
  Check,
  ExternalLink,
  Coins,
  ArrowRight,
  ShieldAlert,
  RefreshCw,
  AlertTriangle,
  Lock,
  Flame,
} from "lucide-react";

const WalletMultiButton = dynamic(
  async () =>
    (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  { ssr: false }
);

export default function DashboardPage() {
  const router = useRouter();
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const { t, language } = useTranslation();

  const [portfolio, setPortfolio] = useState<WalletPortfolio | null>(null);
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(false);
  const [quickScanMint, setQuickScanMint] = useState("");
  const [copied, setCopied] = useState(false);

  const loadPortfolio = useCallback(async () => {
    if (!publicKey) {
      setPortfolio(null);
      return;
    }
    setIsLoadingPortfolio(true);
    try {
      const data = await fetchWalletPortfolio(connection, publicKey);
      setPortfolio(data);
    } catch (err) {
      console.error("Error loading portfolio:", err);
    } finally {
      setIsLoadingPortfolio(false);
    }
  }, [connection, publicKey]);

  useEffect(() => {
    if (connected && publicKey) {
      loadPortfolio();
    } else {
      setPortfolio(null);
    }
  }, [connected, publicKey, loadPortfolio]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuickScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickScanMint.trim()) {
      router.push(`/scanner?mint=${encodeURIComponent(quickScanMint.trim())}`);
    }
  };

  const riskyDelegatesCount =
    portfolio?.tokens.filter((t) => t.delegate !== null && t.delegatedAmount > 0)
      .length ?? 0;

  const toolCards = [
    {
      num: "01",
      title: t("nav.scanner"),
      desc: t("scanner.subtitle"),
      href: "/scanner",
      icon: Search,
    },
    {
      num: "02",
      title: t("nav.approvals"),
      desc: t("approvals.subtitle"),
      href: "/approvals",
      icon: KeyRound,
    },
    {
      num: "03",
      title: t("nav.txPreview"),
      desc: t("preview.subtitle"),
      href: "/preview",
      icon: FileCheck2,
    },
    {
      num: "04",
      title: t("nav.scamLab"),
      desc: t("scamLab.subtitle"),
      href: "/scam-lab",
      icon: FlaskConical,
    },
    {
      num: "05",
      title: t("nav.domainCheck"),
      desc: t("domainCheck.subtitle"),
      href: "/domain-check",
      icon: Globe2,
    },
  ];

  return (
    <div className="space-y-16 animate-fade-in-up">
      {/* Hero Section */}
      <section className="pt-4 sm:pt-10 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-xs text-[var(--muted)]">
              <span className="w-1.5 h-1.5 rounded-full bg-white/70" />
              <span className="font-mono text-[11px] tracking-wider uppercase text-[var(--text)]">
                {language === "hi" ? "सोलाना सुरक्षा संतरी" : "Solana Devnet Shield"}
              </span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl lg:text-[68px] leading-[1.05] tracking-tight text-white">
              {language === "hi" ? (
                <>
                  हस्ताक्षर करने से पहले <br />
                  <span className="italic font-normal text-chrome">जांचें</span> अपना वॉलेट.
                </>
              ) : (
                <>
                  Inspect before you <br />
                  <span className="italic font-normal text-chrome">sign</span> anything.
                </>
              )}
            </h1>

            <p className="text-[var(--muted)] text-base sm:text-lg max-w-xl font-normal leading-relaxed">
              {t("common.subtagline")}
            </p>

            {/* Quick Token Scan Field — Minimal underlined / thin border pill */}
            <form onSubmit={handleQuickScan} className="pt-2 max-w-lg">
              <div className="relative flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)] p-1.5 transition-all focus-within:border-white/30 focus-within:shadow-[0_0_20px_rgba(255,255,255,0.06)]">
                <Search className="w-4 h-4 text-[var(--muted)] ml-3 shrink-0" />
                <input
                  id="quick-scan-input"
                  type="text"
                  value={quickScanMint}
                  onChange={(e) => setQuickScanMint(e.target.value)}
                  placeholder={t("dashboard.scanPlaceholder")}
                  className="w-full bg-transparent px-3 py-1.5 text-sm text-white placeholder-[var(--muted)] focus:outline-none font-mono text-xs sm:text-sm"
                />
                <button
                  id="quick-scan-submit-btn"
                  type="submit"
                  className="btn-chrome text-xs py-2 px-4 shrink-0 flex items-center gap-1.5 font-medium"
                >
                  <span>{t("dashboard.scanButton")}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>

          {/* Hero Right: Floating Sample Red Risk Card Demonstration */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-sm rounded-[20px] border border-[rgba(248,113,113,0.25)] bg-[var(--surface)] p-6 shadow-2xl relative overflow-hidden transition-transform hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(ellipse_at_top_right,rgba(248,113,113,0.12),transparent_70%)] pointer-events-none" />

              <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#f87171] animate-pulse" />
                  <span className="font-mono text-[11px] text-[var(--muted)] uppercase tracking-wider">
                    Live Demo Audit
                  </span>
                </div>
                <span className="tag-chip font-mono text-[10px] text-[#f87171] border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.05)]">
                  HIGH RISK 85/100
                </span>
              </div>

              <div className="py-4 space-y-2">
                <div className="font-serif text-2xl text-white">
                  {language === "hi" ? "अत्यधिक खतरनाक टोकन" : "Malicious Trapdoor Mint"}
                </div>
                <p className="text-xs text-[var(--muted)] font-mono truncate">
                  Mint: 7xKX...honeypot
                </p>
              </div>

              <div className="space-y-2 pt-1 pb-4">
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                  <div className="flex items-center gap-2 text-[var(--text)]">
                    <Lock className="w-3.5 h-3.5 text-[#f87171]" />
                    <span>Freeze Authority Active</span>
                  </div>
                  <span className="text-[10px] text-[#f87171] font-mono">DANGER</span>
                </div>
                <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                  <div className="flex items-center gap-2 text-[var(--text)]">
                    <Flame className="w-3.5 h-3.5 text-[#f87171]" />
                    <span>Infinite Minting</span>
                  </div>
                  <span className="text-[10px] text-[#f87171] font-mono">DANGER</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between">
                <span className="text-[11px] text-[var(--muted)]">
                  {language === "hi" ? "सिफारिश: साइन न करें" : "Verdict: Do Not Sign"}
                </span>
                <Link
                  href="/scanner"
                  className="text-xs text-white hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Test Real Mint</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wallet State Card */}
      <section className="card-chrome p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-center text-white">
              <Coins className="w-4 h-4 text-white/80" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="font-serif text-2xl text-white font-normal">
                {t("dashboard.walletOverview")}
              </h2>
              <p className="text-xs text-[var(--muted)]">
                {connected
                  ? `${portfolio?.tokens.length ?? 0} ${t("dashboard.tokensHeld")}`
                  : "Connect your Phantom or Solflare wallet for devnet diagnostics."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {connected && (
              <button
                onClick={loadPortfolio}
                disabled={isLoadingPortfolio}
                className="w-10 h-10 rounded-full border border-[var(--border)] bg-[var(--surface-2)] hover:border-white/20 text-[var(--muted)] hover:text-white transition-all flex items-center justify-center"
                title={t("common.refresh")}
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isLoadingPortfolio ? "animate-spin text-white" : ""}`}
                />
              </button>
            )}
            {!connected ? (
              <div className="wallet-button-container">
                <WalletMultiButton />
              </div>
            ) : (
              <AirdropButton onSuccess={loadPortfolio} />
            )}
          </div>
        </div>

        {/* Connected Wallet State */}
        {connected && publicKey ? (
          <div className="pt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Address */}
              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                <span className="text-[11px] text-[var(--muted)] font-mono uppercase tracking-wider">
                  Devnet Address
                </span>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-white truncate">
                    {publicKey.toBase58().slice(0, 6)}...{publicKey.toBase58().slice(-6)}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(publicKey.toBase58())}
                      className="p-1 text-[var(--muted)] hover:text-white transition-colors"
                      title={t("common.copyAddress")}
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-[#34d399]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <a
                      href={getExplorerAddressUrl(publicKey.toBase58())}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 text-[var(--muted)] hover:text-white transition-colors"
                      title={t("common.viewExplorer")}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Balance */}
              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] space-y-1">
                <span className="text-[11px] text-[var(--muted)] font-mono uppercase tracking-wider">
                  {t("dashboard.balance")} (SOL)
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-xl font-medium text-white">
                    {isLoadingPortfolio ? "..." : (portfolio?.solBalance ?? 0).toFixed(4)}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--muted)]">DEVNET</span>
                </div>
              </div>

              {/* Active Approvals */}
              <div
                className={`p-4 rounded-xl border space-y-1 ${
                  riskyDelegatesCount > 0
                    ? "bg-[rgba(251,191,36,0.04)] border-[rgba(251,191,36,0.25)]"
                    : "bg-[var(--surface-2)] border-[var(--border)]"
                }`}
              >
                <span className="text-[11px] text-[var(--muted)] font-mono uppercase tracking-wider">
                  {t("dashboard.activeDelegates")}
                </span>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {riskyDelegatesCount > 0 ? (
                      <AlertTriangle className="w-4 h-4 text-[#fbbf24]" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-[#34d399]" />
                    )}
                    <span
                      className={`font-mono text-xl font-medium ${
                        riskyDelegatesCount > 0 ? "text-[#fbbf24]" : "text-white"
                      }`}
                    >
                      {riskyDelegatesCount}
                    </span>
                  </div>
                  {riskyDelegatesCount > 0 && (
                    <Link
                      href="/approvals"
                      className="text-xs text-[#fbbf24] hover:underline flex items-center gap-1 font-medium"
                    >
                      <span>Revoke</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Token Portfolio List (Fixed Bug: Single clean dashed card on empty) */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-mono text-[var(--muted)] uppercase tracking-wider">
                {t("dashboard.tokensHeld")} (SPL & Token-2022)
              </h3>

              {isLoadingPortfolio ? (
                <div className="p-8 text-center text-[var(--muted)] text-xs font-mono animate-pulse">
                  {t("common.loading")}
                </div>
              ) : portfolio?.tokens && portfolio.tokens.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {portfolio.tokens.map((token) => (
                    <div
                      key={token.pubkey}
                      className="p-3.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-between gap-3 hover:border-white/20 transition-all"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="tag-chip text-[10px] py-0 px-1.5 font-mono">
                            {token.programType}
                          </span>
                          <span className="font-mono text-xs text-[var(--muted)] truncate">
                            {token.mint.slice(0, 6)}...{token.mint.slice(-4)}
                          </span>
                        </div>
                        <div className="text-sm font-mono font-medium text-white pt-1">
                          {token.balance}
                        </div>
                      </div>

                      <Link
                        href={`/scanner?mint=${encodeURIComponent(token.mint)}`}
                        className="btn-chrome text-xs py-1.5 px-3"
                      >
                        <Search className="w-3 h-3 mr-1" />
                        <span>{t("dashboard.scanThisToken")}</span>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                /* SINGLE CLEAN DASHED CARD ON EMPTY */
                <div className="p-8 rounded-xl border border-dashed border-[var(--border)] text-center space-y-2 bg-[var(--surface-2)]/40">
                  <p className="text-xs text-[var(--muted)]">
                    {t("dashboard.noTokens")}
                  </p>
                  <Link
                    href="/scam-lab"
                    className="inline-flex items-center gap-1.5 text-xs text-white hover:underline font-medium pt-1"
                  >
                    <FlaskConical className="w-3.5 h-3.5" />
                    <span>Mint test tokens in Scam Lab</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="pt-6 text-center">
            <p className="text-xs text-[var(--muted)] max-w-md mx-auto">
              {language === "hi"
                ? "सुरक्षा जांच और अनुमतियों का विश्लेषण करने के लिए अपना वॉलेट कनेक्ट करें।"
                : "Connect your Solana wallet to run live safety diagnostics on Devnet. Never signs on Mainnet."}
            </p>
          </div>
        )}
      </section>

      {/* 5 Numbered Tool Cards (01 / 02 / 03...) */}
      <section className="space-y-6">
        <div className="flex items-baseline justify-between border-b border-[var(--border)] pb-3">
          <h2 className="font-serif text-3xl text-white font-normal">
            {t("dashboard.quickActions")}
          </h2>
          <span className="font-mono text-xs text-[var(--muted)]">
            5 MODULES
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {toolCards.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="group card-chrome p-6 flex flex-col justify-between space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-semibold text-chrome">
                    {tool.num}
                  </span>
                  <div className="w-8 h-8 rounded-full border border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-center text-[var(--muted)] group-hover:text-white group-hover:border-white/30 transition-all">
                    <Icon className="w-4 h-4" strokeWidth={1.75} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-serif text-2xl text-white font-normal group-hover:text-chrome transition-colors flex items-center justify-between">
                    <span>{tool.title}</span>
                    <ArrowRight className="w-4 h-4 text-[var(--muted)] group-hover:text-white transition-all transform group-hover:translate-x-1" />
                  </h3>
                  <p className="text-xs text-[var(--muted)] leading-relaxed font-normal">
                    {tool.desc}
                  </p>
                </div>
              </Link>
            );
          })}

          {/* 06 Security Principles Guide */}
          <div className="card-chrome p-6 flex flex-col justify-between space-y-4 bg-gradient-to-br from-[var(--surface)] to-[var(--surface-2)]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm font-semibold text-chrome">
                06
              </span>
              <div className="w-8 h-8 rounded-full border border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-center text-white/80">
                <ShieldAlert className="w-4 h-4" strokeWidth={1.75} />
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-serif text-2xl text-white font-normal">
                {t("education.securityPrinciples")}
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed font-normal">
                {t("education.simulation")}
              </p>
            </div>
          </div>
        </div>
      </section>
      <HowLanternChecks />
    </div>
  );
}
