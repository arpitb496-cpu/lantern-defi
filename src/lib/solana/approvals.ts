import {
  Connection,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import { createRevokeInstruction } from "@solana/spl-token";
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from "../constants";

export interface ApprovalItem {
  tokenAccount: string;
  mint: string;
  owner: string;
  balance: number;
  decimals: number;
  programType: "SPL" | "Token-2022";
  delegate: string;
  delegatedAmount: number;
  severity: "high" | "medium" | "low";
}

export async function fetchWalletApprovals(
  connection: Connection,
  walletPubkey: PublicKey
): Promise<ApprovalItem[]> {
  const approvals: ApprovalItem[] = [];

  // Query Standard SPL
  try {
    const splAccounts = await connection.getParsedTokenAccountsByOwner(
      walletPubkey,
      { programId: TOKEN_PROGRAM_ID }
    );
    for (const item of splAccounts.value) {
      const parsed = item.account.data.parsed.info;
      if (parsed.delegate && parsed.delegatedAmount?.uiAmount > 0) {
        const balance = parsed.tokenAmount?.uiAmount ?? 0;
        const delegatedAmount = parsed.delegatedAmount.uiAmount;
        // If delegated amount >= balance or > 0, evaluate severity
        const severity = delegatedAmount >= balance ? "high" : "medium";
        approvals.push({
          tokenAccount: item.pubkey.toBase58(),
          mint: parsed.mint,
          owner: parsed.owner,
          balance,
          decimals: parsed.tokenAmount?.decimals ?? 0,
          programType: "SPL",
          delegate: parsed.delegate,
          delegatedAmount,
          severity,
        });
      }
    }
  } catch (err) {
    console.warn("Failed fetching SPL approvals:", err);
  }

  // Query Token-2022
  try {
    const t22Accounts = await connection.getParsedTokenAccountsByOwner(
      walletPubkey,
      { programId: TOKEN_2022_PROGRAM_ID }
    );
    for (const item of t22Accounts.value) {
      const parsed = item.account.data.parsed.info;
      if (parsed.delegate && parsed.delegatedAmount?.uiAmount > 0) {
        const balance = parsed.tokenAmount?.uiAmount ?? 0;
        const delegatedAmount = parsed.delegatedAmount.uiAmount;
        const severity = delegatedAmount >= balance ? "high" : "medium";
        approvals.push({
          tokenAccount: item.pubkey.toBase58(),
          mint: parsed.mint,
          owner: parsed.owner,
          balance,
          decimals: parsed.tokenAmount?.decimals ?? 0,
          programType: "Token-2022",
          delegate: parsed.delegate,
          delegatedAmount,
          severity,
        });
      }
    }
  } catch (err) {
    console.warn("Failed fetching Token-2022 approvals:", err);
  }

  return approvals;
}

export function buildRevokeTransaction(params: {
  tokenAccountPubkey: PublicKey;
  ownerPubkey: PublicKey;
  programType: "SPL" | "Token-2022";
}): Transaction {
  const programId =
    params.programType === "Token-2022"
      ? TOKEN_2022_PROGRAM_ID
      : TOKEN_PROGRAM_ID;

  const ix = createRevokeInstruction(
    params.tokenAccountPubkey,
    params.ownerPubkey,
    [],
    programId
  );

  const tx = new Transaction().add(ix);
  return tx;
}
