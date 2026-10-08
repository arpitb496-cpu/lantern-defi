import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from "../constants";

export interface ParsedTokenAccountInfo {
  pubkey: string;
  mint: string;
  owner: string;
  balance: number;
  decimals: number;
  programType: "SPL" | "Token-2022";
  delegate: string | null;
  delegatedAmount: number;
  state: string;
}

export interface WalletPortfolio {
  solBalance: number;
  tokens: ParsedTokenAccountInfo[];
}

export async function fetchWalletPortfolio(
  connection: Connection,
  walletPubkey: PublicKey
): Promise<WalletPortfolio> {
  // 1. Fetch native SOL balance
  const lamports = await connection.getBalance(walletPubkey);
  const solBalance = lamports / LAMPORTS_PER_SOL;

  const tokens: ParsedTokenAccountInfo[] = [];

  // 2. Fetch standard SPL tokens
  try {
    const splAccounts = await connection.getParsedTokenAccountsByOwner(
      walletPubkey,
      { programId: TOKEN_PROGRAM_ID }
    );

    for (const item of splAccounts.value) {
      const parsed = item.account.data.parsed.info;
      const amount = parsed.tokenAmount?.uiAmount ?? 0;
      const decimals = parsed.tokenAmount?.decimals ?? 0;
      const delegate = parsed.delegate || null;
      const delegatedAmount = parsed.delegatedAmount?.uiAmount ?? 0;

      tokens.push({
        pubkey: item.pubkey.toBase58(),
        mint: parsed.mint,
        owner: parsed.owner,
        balance: amount,
        decimals,
        programType: "SPL",
        delegate,
        delegatedAmount,
        state: parsed.state || "initialized",
      });
    }
  } catch (err) {
    console.warn("Failed fetching standard SPL token accounts:", err);
  }

  // 3. Fetch Token-2022 accounts
  try {
    const t22Accounts = await connection.getParsedTokenAccountsByOwner(
      walletPubkey,
      { programId: TOKEN_2022_PROGRAM_ID }
    );

    for (const item of t22Accounts.value) {
      const parsed = item.account.data.parsed.info;
      const amount = parsed.tokenAmount?.uiAmount ?? 0;
      const decimals = parsed.tokenAmount?.decimals ?? 0;
      const delegate = parsed.delegate || null;
      const delegatedAmount = parsed.delegatedAmount?.uiAmount ?? 0;

      tokens.push({
        pubkey: item.pubkey.toBase58(),
        mint: parsed.mint,
        owner: parsed.owner,
        balance: amount,
        decimals,
        programType: "Token-2022",
        delegate,
        delegatedAmount,
        state: parsed.state || "initialized",
      });
    }
  } catch (err) {
    console.warn("Failed fetching Token-2022 accounts:", err);
  }

  return {
    solBalance,
    tokens,
  };
}
