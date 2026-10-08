"use client";

import React, { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useTranslation } from "@/i18n/LanguageContext";
import { Coins, Loader2, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";

interface AirdropButtonProps {
  onSuccess?: () => void;
  className?: string;
}

export function AirdropButton({ onSuccess, className = "" }: AirdropButtonProps) {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "rate-limited" | "error";
    text: string;
  } | null>(null);

  const requestAirdrop = async () => {
    if (!publicKey) return;

    setIsLoading(true);
    setStatusMessage(null);

    try {
      const signature = await connection.requestAirdrop(
        publicKey,
        1 * LAMPORTS_PER_SOL
      );

      const latestBlockHash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature,
      });

      setStatusMessage({
        type: "success",
        text: t("dashboard.airdropSuccess"),
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch {
      setStatusMessage({
        type: "rate-limited",
        text: t("dashboard.airdropRateLimited"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!publicKey) return null;

  return (
    <div className="flex flex-col gap-2">
      <button
        id="airdrop-request-btn"
        onClick={requestAirdrop}
        disabled={isLoading}
        className={`btn-chrome gap-2 text-xs h-10 px-4 ${className}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--muted)]" />
            <span>{t("dashboard.airdropping")}</span>
          </>
        ) : (
          <>
            <Coins className="w-3.5 h-3.5 text-white/80" />
            <span>{t("dashboard.airdrop")}</span>
          </>
        )}
      </button>

      {statusMessage && (
        <div
          className={`p-3 rounded-xl text-xs flex items-start gap-2 border animate-fade-in-up ${
            statusMessage.type === "success"
              ? "bg-[rgba(52,211,153,0.05)] border-[rgba(52,211,153,0.2)] text-[#34d399]"
              : "bg-[rgba(251,191,36,0.05)] border-[rgba(251,191,36,0.2)] text-[#fbbf24]"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-[#34d399] shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-[#fbbf24] shrink-0 mt-0.5" />
          )}
          <div className="flex-1 space-y-1">
            <p>{statusMessage.text}</p>
            {statusMessage.type === "rate-limited" && (
              <a
                href="https://faucet.solana.com"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-medium text-white hover:underline pt-0.5"
              >
                <span>{t("dashboard.openFaucet")}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
