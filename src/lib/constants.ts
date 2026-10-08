import { PublicKey } from "@solana/web3.js";

export const DEVNET_RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com";

export const SOLANA_NETWORK = "devnet" as const;

export const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);

export const TOKEN_2022_PROGRAM_ID = new PublicKey(
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
);

export const SYSTEM_PROGRAM_ID = new PublicKey("11111111111111111111111111111111");

export const SOL_EXPLORER_TX_BASE = "https://explorer.solana.com/tx";
export const SOL_EXPLORER_ADDRESS_BASE = "https://explorer.solana.com/address";

export function getExplorerTxUrl(signature: string): string {
  return `${SOL_EXPLORER_TX_BASE}/${signature}?cluster=devnet`;
}

export function getExplorerAddressUrl(address: string): string {
  return `${SOL_EXPLORER_ADDRESS_BASE}/${address}?cluster=devnet`;
}
