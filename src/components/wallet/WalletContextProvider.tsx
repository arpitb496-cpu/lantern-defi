"use client";

import React, { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { DEVNET_RPC_URL } from "@/lib/constants";
import "@solana/wallet-adapter-react-ui/styles.css";

export function WalletContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Hardcoded strictly to DEVNET RPC
  const endpoint = DEVNET_RPC_URL;

  // Empty array or standard supported wallets: modern Phantom, Solflare, Backpack auto-register via Standard Wallet spec
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
