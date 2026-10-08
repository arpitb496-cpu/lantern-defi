"use client";

import React, { useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { useTranslation } from "@/i18n/LanguageContext";
import { simulateRawTransaction, SimulationResult } from "@/lib/solana/simulator";
import {
  FileCheck2,
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  Loader2,
  Terminal,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function PreviewPage() {
  const { connection } = useConnection();
  const { t, language } = useTranslation();

  const [txInput, setTxInput] = useState("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showLogs, setShowLogs] = useState(false);

  const handleSimulate = async (payloadToSimulate?: string) => {
    const raw = payloadToSimulate ?? txInput;
    if (!raw.trim()) return;

    setIsSimulating(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const sim = await simulateRawTransaction(connection, raw.trim());
      setResult(sim);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSimulating(false);
    }
  };

  const getVerdictStyle = (verdict: SimulationResult["verdict"]) => {
    switch (verdict) {
      case "safe":
        return {
          color: "#34d399",
          border: "border-[rgba(52,211,153,0.3)]",
          bg: "bg-[rgba(52,211,153,0.04)]",
          icon: ShieldCheck,
          label: t("preview.verdictSafe"),
        };
      case "caution":
        return {
          color: "#fbbf24",
          border: "border-[rgba(251,191,36,0.3)]",
          bg: "bg-[rgba(251,191,36,0.04)]",
          icon: AlertTriangle,
          label: t("preview.verdictCaution"),
        };
      case "danger":
        return {
          color: "#f87171",
          border: "border-[rgba(248,113,113,0.3)]",
          bg: "bg-[rgba(248,113,113,0.04)]",
          icon: ShieldAlert,
          label: t("preview.verdictDanger"),
        };
    }
  };

  return (
    <div className="space-y-12 animate-fade-in-up">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-xs text-[var(--muted)]">
          <span className="font-mono text-[11px] tracking-wider uppercase text-[var(--text)]">
            MODULE 03 / PRE-SIGN SIMULATION
          </span>
        </div>
        <h1 className="font-serif text-4xl sm:text-6xl text-white font-normal tracking-tight">
          Transaction <span className="italic font-normal text-chrome">Preview</span>
        </h1>
        <p className="text-[var(--muted)] text-sm sm:text-base max-w-2xl font-normal leading-relaxed">
          {t("preview.subtitle")}
        </p>
      </div>

      {/* Input Section */}
      <section className="card-chrome p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono text-[var(--muted)] uppercase tracking-wider">
            {t("preview.inputLabel")}
          </label>
        </div>

        <textarea
          id="tx-payload-input"
          value={txInput}
          onChange={(e) => setTxInput(e.target.value)}
          placeholder={t("preview.inputPlaceholder")}
          rows={5}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-xs font-mono text-white placeholder-[var(--muted)] focus:outline-none focus:border-white/30 transition-all resize-y"
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            onClick={() => handleSimulate()}
            disabled={isSimulating || !txInput.trim()}
            className="btn-chrome text-xs py-2.5 px-6 shrink-0 w-full sm:w-auto disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSimulating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{t("preview.simulating")}</span>
              </>
            ) : (
              <>
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>{t("preview.simulateBtn")}</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Error View */}
      {errorMsg && (
        <div className="p-4 rounded-2xl border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.04)] text-[#f87171] text-xs flex items-center gap-2.5 animate-fade-in-up">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <p>{errorMsg}</p>
        </div>
      )}

      {/* Simulation Result */}
      {result && (
        <section className="space-y-6 animate-fade-in-up">
          {/* Verdict Banner */}
          {(() => {
            const v = getVerdictStyle(result.verdict);
            const Icon = v.icon;
            return (
              <div className={`card-chrome p-6 sm:p-8 ${v.border} ${v.bg} space-y-3`}>
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-12 h-12 rounded-full border flex items-center justify-center shrink-0"
                    style={{ borderColor: v.color, color: v.color }}
                  >
                    <Icon className="w-6 h-6" strokeWidth={1.75} />
                  </div>
                  <div>
                    <span className="font-mono text-xs uppercase tracking-wider text-[var(--muted)]">
                      Pre-Sign Safety Verdict
                    </span>
                    <h2 className="font-serif text-3xl sm:text-4xl text-white font-normal">
                      {v.label}
                    </h2>
                    <p className="mt-2 text-xs text-[var(--muted)]">{t("education.verdictNote")}</p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Dangerous Instructions Flagged */}
          <div className="space-y-4">
            <h3 className="font-serif text-2xl text-white font-normal">
              {t("preview.dangerousInstructions")}
            </h3>

            {result.dangerousInstructions.length > 0 ? (
              <div className="space-y-3">
                {result.dangerousInstructions.map((d, i) => {
                  const isDanger = d.severity === "danger";
                  return (
                    <div
                      key={i}
                      className={`card-chrome p-4 flex items-start gap-3 ${
                        isDanger
                          ? "border-[rgba(248,113,113,0.3)]"
                          : "border-[rgba(251,191,36,0.3)]"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          isDanger
                            ? "border-[#f87171] text-[#f87171]"
                            : "border-[#fbbf24] text-[#fbbf24]"
                        }`}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-xs text-white">
                            {language === "hi" ? d.descriptionHi : d.descriptionEn}
                          </span>
                          <span
                            className={`tag-chip font-mono text-[10px] py-0 px-2 uppercase ${
                              isDanger ? "text-[#f87171]" : "text-[#fbbf24]"
                            }`}
                          >
                            {d.severity}
                          </span>
                        </div>
                        <p className="font-mono text-[11px] text-[var(--muted)]">
                          Program: {d.programId}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="card-chrome p-6 text-center text-xs text-[var(--muted)] flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#34d399]" />
                <span>{t("education.noWarnings")}</span>
              </div>
            )}
          </div>

          {/* Simulation Logs */}
          <div className="card-chrome p-6 space-y-3">
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="flex items-center justify-between w-full text-xs font-mono text-[var(--muted)] hover:text-white"
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5" />
                <span>{t("preview.logs")} ({result.logs.length} entries)</span>
              </div>
              {showLogs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showLogs && (
              <div className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] font-mono text-[11px] text-[var(--muted)] space-y-1 max-h-60 overflow-y-auto">
                {result.logs.length > 0 ? (
                  result.logs.map((log, idx) => (
                    <div key={idx} className="leading-relaxed whitespace-pre-wrap">
                      {log}
                    </div>
                  ))
                ) : (
                  <div>No simulation logs returned.</div>
                )}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
