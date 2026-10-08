"use client";

import React, { useState } from "react";
import { useTranslation } from "@/i18n/LanguageContext";
import {
  checkDomainSafety,
  DomainCheckResult,
} from "@/lib/security/domainChecker";
import {
  Globe2,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  Search,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export default function DomainCheckPage() {
  const { t, language } = useTranslation();

  const [inputUrl, setInputUrl] = useState("");
  const [result, setResult] = useState<DomainCheckResult | null>(null);

  const handleCheck = (domainToCheck?: string) => {
    const val = domainToCheck ?? inputUrl;
    if (!val.trim()) return;
    const res = checkDomainSafety(val.trim());
    setResult(res);
  };

  const exampleLinks = [
    { label: "phantom.app", type: "safe" },
    { label: "phant0m.app", type: "suspicious" },
    { label: "phantom-airdrop.xyz", type: "blocked" },
    { label: "jup.ag", type: "safe" },
    { label: "jupiter-airdrop-claim.com", type: "blocked" },
    { label: "solflare.com", type: "safe" },
  ];

  const getVerdictDetails = (verdict: DomainCheckResult["verdict"]) => {
    switch (verdict) {
      case "safe":
        return {
          color: "#34d399",
          border: "border-[rgba(52,211,153,0.3)]",
          bg: "bg-[rgba(52,211,153,0.04)]",
          icon: ShieldCheck,
          title: t("domainCheck.resultSafe"),
        };
      case "suspicious":
        return {
          color: "#fbbf24",
          border: "border-[rgba(251,191,36,0.3)]",
          bg: "bg-[rgba(251,191,36,0.04)]",
          icon: AlertTriangle,
          title: t("domainCheck.resultSuspicious"),
        };
      case "blocked":
        return {
          color: "#f87171",
          border: "border-[rgba(248,113,113,0.3)]",
          bg: "bg-[rgba(248,113,113,0.04)]",
          icon: ShieldAlert,
          title: t("domainCheck.resultBlocked"),
        };
    }
  };

  return (
    <div className="space-y-12 animate-fade-in-up">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-xs text-[var(--muted)]">
          <span className="font-mono text-[11px] tracking-wider uppercase text-[var(--text)]">
            MODULE 05 / LINK AUDIT
          </span>
        </div>
        <h1 className="font-serif text-4xl sm:text-6xl text-white font-normal tracking-tight">
          Domain & Link <span className="italic font-normal text-chrome">Checker</span>
        </h1>
        <p className="text-[var(--muted)] text-sm sm:text-base max-w-2xl font-normal leading-relaxed">
          {t("domainCheck.subtitle")}
        </p>
      </div>

      {/* Input Section */}
      <section className="card-chrome p-6 sm:p-8 space-y-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCheck();
          }}
          className="space-y-3"
        >
          <label className="text-xs font-mono text-[var(--muted)] uppercase tracking-wider block">
            {t("domainCheck.inputLabel")}
          </label>
          <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center rounded-2xl sm:rounded-full border border-[var(--border)] bg-[var(--surface-2)] p-1.5 transition-all focus-within:border-white/30">
            <div className="flex items-center flex-1 px-3 py-2">
              <Search className="w-4 h-4 text-[var(--muted)] mr-2 shrink-0" />
              <input
                id="domain-input"
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder={t("domainCheck.inputPlaceholder")}
                className="w-full bg-transparent text-sm text-white placeholder-[var(--muted)] focus:outline-none font-mono text-xs sm:text-sm"
              />
            </div>
            <button
              id="domain-submit-btn"
              type="submit"
              disabled={!inputUrl.trim()}
              className="btn-chrome text-xs py-2.5 px-6 shrink-0 disabled:opacity-50"
            >
              <span>{t("domainCheck.checkBtn")}</span>
            </button>
          </div>
        </form>

        {/* Quick Example Chips */}
        <div className="pt-2 border-t border-[var(--border)] space-y-2">
          <span className="text-xs text-[var(--muted)] font-mono block">
            {t("domainCheck.exampleLinks")}
          </span>
          <div className="flex flex-wrap gap-2">
            {exampleLinks.map((ex) => (
              <button
                key={ex.label}
                onClick={() => {
                  setInputUrl(ex.label);
                  handleCheck(ex.label);
                }}
                className={`tag-chip text-xs hover:border-white/30 ${
                  ex.type === "blocked"
                    ? "text-[#f87171] border-[rgba(248,113,113,0.2)]"
                    : ex.type === "suspicious"
                    ? "text-[#fbbf24] border-[rgba(251,191,36,0.2)]"
                    : "text-[#34d399] border-[rgba(52,211,153,0.2)]"
                }`}
              >
                <span className="font-mono">{ex.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Result Card */}
      {result && (
        <section className="space-y-6 animate-fade-in-up">
          {(() => {
            const v = getVerdictDetails(result.verdict);
            const Icon = v.icon;
            return (
              <div className={`card-chrome p-6 sm:p-8 ${v.border} ${v.bg} space-y-4`}>
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
                        Domain Safety Analysis
                      </span>
                      <h2 className="font-serif text-3xl sm:text-4xl text-white font-normal">
                        {v.title}
                      </h2>
                    </div>
                  </div>

                  <span className="tag-chip font-mono text-xs text-white uppercase self-start sm:self-auto">
                    {result.verdict.toUpperCase()}
                  </span>
                </div>

                <div className="pt-2 border-t border-[var(--border)] space-y-2">
                  <div className="flex items-center gap-2 font-mono text-xs text-[var(--muted)]">
                    <span>Analyzed Host:</span>
                    <span className="text-white font-medium">{result.domain}</span>
                  </div>

                  <p className="text-xs text-[var(--text)] leading-relaxed">
                    {language === "hi" ? result.reasonHi : result.reasonEn}
                  </p>

                  {result.matchedOfficialDomain && (
                    <div className="pt-2 flex items-center gap-2 text-xs font-mono text-[var(--muted)]">
                      <span>Official Reference:</span>
                      <span className="tag-chip text-white font-mono py-0 px-2">
                        {result.matchedOfficialDomain}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </section>
      )}
    </div>
  );
}
