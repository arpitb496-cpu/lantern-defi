import { Connection } from "@solana/web3.js";
import { DEVNET_RPC_URL } from "../constants";

let connectionInstance: Connection | null = null;

export function getSolanaConnection(): Connection {
  if (!connectionInstance) {
    connectionInstance = new Connection(DEVNET_RPC_URL, {
      commitment: "confirmed",
      confirmTransactionInitialTimeout: 30000,
    });
  }
  return connectionInstance;
}
