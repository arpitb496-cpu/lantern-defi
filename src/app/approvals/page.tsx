"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useTranslation } from "@/i18n/LanguageContext";
import {
  fetchWalletApprovals,
  buildRevokeTransaction,
  ApprovalItem,
} from "@/lib/solana/approvals";
import { getExplorerTxUrl, getExplorerAddressUrl } from "@/lib/constants";
import {
  KeyRound,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  Info,
} from "lucide-react";

export default function ApprovalsPage() {
  const { connection } = useConnection();
  const { publicKey, connected, sendTransaction } = useWallet();
  const { t, language } = useTranslation();

  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [revokingAccount, setRevokingAccount] = useState<string | null>(null);
  const [revokeSuccessTx, setRevokeSuccessTx] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const loadApprovals = useCallback(async () => {
    if (!publicKey) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const items = await fetchWalletApprovals(connection, publicKey);
      setApprovals(items);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [connection, publicKey]);

  useEffect(() => {
    if (connected && publicKey) {
      loadApprovals();
    } else {
      setApprovals([]);
    }
  }, [connected, publicKey, loadApprovals]);

  const handleRevoke = async (item: ApprovalItem) => {
    if (!publicKey) return;
    setRevokingAccount(item.tokenAccount);
    setRevokeSuccessTx(null);
    setErrorMessage(null);

    try {
      const tx = buildRevokeTransaction({
        tokenAccountPubkey: new PublicKey(item.tokenAccount),
        ownerPubkey: publicKey,
        programType: item.programType,
      });

      const signature = await sendTransaction(tx, connection);
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      });

      setRevokeSuccessTx(signature);
      await loadApprovals();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to revoke authorization."
      );
    } finally {
      setRevokingAccount(null);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddress(text);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  return (
    <div className="space-y-12 animate-fade-in-up">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full border border-[var(--border)] bg-[var(--surface-2)] text-xs text-[var(--muted)]">
          <span className="font-mono text-[11px] tracking-wider uppercase text-[var(--text)]">
            MODULE 02 / PERMISSIONS
          </span>
        </div>
        <h1 className="font-serif text-4xl sm:text-6xl text-white font-normal tracking-tight">
          Approvals & <span className="italic font-normal text-chrome">Revoke</span>
        </h1>
        <p className="text-[var(--muted)] text-sm sm:text-base max-w-2xl font-normal leading-relaxed">
          {t("approvals.subtitle")}
        </p>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <h2 className="font-serif text-2xl text-white font-normal">
            {t("approvals.activeApprovals")}
          </h2>
          <span className="tag-chip font-mono text-[10px]">
            {approvals.length} ACTIVE
          </span>
        </div>

        {connected && (
          <button
            onClick={loadApprovals}
            disabled={isLoading}
            className="w-9 h-9 rounded-full border border-[var(--border)] bg-[var(--surface-2)] hover:border-white/30 text-[var(--muted)] hover:text-white transition-all flex items-center justify-center"
            title={t("common.refresh")}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-white" : ""}`} />
          </button>
        )}
      </div>

      {/* Success Notification */}
      {revokeSuccessTx && (
        <div className="p-4 rounded-2xl border border-[rgba(52,211,153,0.3)] bg-[rgba(52,211,153,0.04)] text-[#34d399] text-xs flex items-center justify-between gap-3 animate-fade-in-up">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{t("approvals.revokeSuccess")}</span>
          </div>
          <a
            href={getExplorerTxUrl(revokeSuccessTx)}
            target="_blank"
            rel="noreferrer"
            className="tag-chip text-white font-mono hover:border-white/30"
          >
            <span>View Tx</span>
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-4 rounded-2xl border border-[rgba(248,113,113,0.3)] bg-[rgba(248,113,113,0.04)] text-[#f87171] text-xs flex items-center gap-2.5 animate-fade-in-up">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Content Body */}
      {!connected ? (
        <div className="card-chrome p-12 text-center space-y-4">
          <KeyRound className="w-8 h-8 text-[var(--muted)] mx-auto stroke-[1.5]" />
          <p className="text-sm text-[var(--muted)] max-w-sm mx-auto">
            {language === "hi"
              ? "सक्रिय अनुमतियों को खोजने और रद्द करने के लिए अपना वॉलेट कनेक्ट करें।"
              : "Connect your wallet to inspect tokens that have active spending delegates."}
          </p>
        </div>
      ) : isLoading ? (
        <div className="card-chrome p-12 text-center text-xs font-mono text-[var(--muted)] animate-pulse">
          {t("common.loading")}
        </div>
      ) : approvals.length > 0 ? (
        <div className="space-y-4">
          {approvals.map((item) => {
            const isRevoking = revokingAccount === item.tokenAccount;
            const isHigh = item.severity === "high";
            return (
              <div
                key={item.tokenAccount}
                className={`card-chrome p-6 space-y-4 ${
                  isHigh ? "border-[rgba(251,191,36,0.25)]" : "border-[var(--border)]"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="tag-chip font-mono text-[10px]">
                        {item.programType}
                      </span>
                      <span className="font-mono text-xs text-[var(--muted)]">
                        Account: {item.tokenAccount.slice(0, 6)}...{item.tokenAccount.slice(-4)}
                      </span>
                    </div>
                    <div className="font-serif text-2xl text-white font-normal">
                      Allowance: <span className="font-mono text-xl">{item.delegatedAmount}</span>
                      <span className="text-xs font-mono text-[var(--muted)] ml-2 font-normal">
                        (Balance: {item.balance})
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRevoke(item)}
                    disabled={isRevoking}
                    className="btn-chrome text-xs py-2 px-5 shrink-0 self-start sm:self-auto disabled:opacity-50"
                  >
                    {isRevoking ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                        <span>{t("approvals.revoking")}</span>
                      </>
                    ) : (
                      <span>{t("approvals.revokeBtn")}</span>
                    )}
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono gap-2">
                  <div className="flex items-center gap-2 text-[var(--muted)] truncate">
                    <span>Approved Delegate:</span>
                    <span className="text-white truncate">{item.delegate}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleCopy(item.delegate)}
                      className="p-1 text-[var(--muted)] hover:text-white"
                      title={t("common.copyAddress")}
                    >
                      {copiedAddress === item.delegate ? (
                        <Check className="w-3.5 h-3.5 text-[#34d399]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <a
                      href={getExplorerAddressUrl(item.delegate)}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 text-[var(--muted)] hover:text-white"
                      title={t("common.viewExplorer")}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* SINGLE CLEAN DASHED CARD ON EMPTY */
        <div className="p-12 rounded-2xl border border-dashed border-[var(--border)] text-center space-y-2.5 bg-[var(--surface-2)]/30">
          <ShieldCheck className="w-8 h-8 text-[#34d399] mx-auto stroke-[1.5]" />
          <h3 className="font-serif text-2xl text-white font-normal">
            {language === "hi" ? "कोई सक्रिय अनुमति नहीं" : "Zero Active Approvals"}
          </h3>
          <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
            {t("approvals.noApprovals")}
          </p>
        </div>
      )}

      {/* Educational Accordion Card */}
      <section className="card-chrome p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-2.5 text-white">
          <Info className="w-4 h-4 text-white/80" />
          <h3 className="font-serif text-xl font-normal">
            {t("approvals.whyRevokeTitle")}
          </h3>
        </div>
        <p className="text-xs text-[var(--muted)] leading-relaxed max-w-3xl font-normal">
          {t("approvals.whyRevokeBody")}
        </p>
      </section>
    </div>
  );
}
