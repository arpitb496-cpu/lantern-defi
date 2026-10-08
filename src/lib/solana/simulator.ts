import {
  Connection,
  Transaction,
  VersionedTransaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID, SYSTEM_PROGRAM_ID } from "../constants";

export interface SimulationResult {
  success: boolean;
  verdict: "safe" | "caution" | "danger";
  balanceChanges: {
    account: string;
    preSol: number;
    postSol: number;
    diffSol: number;
  }[];
  dangerousInstructions: {
    programId: string;
    descriptionEn: string;
    descriptionHi: string;
    severity: "danger" | "caution";
  }[];
  logs: string[];
  error?: string;
}

const KNOWN_SAFE_PROGRAMS = new Set([
  SYSTEM_PROGRAM_ID.toBase58(),
  TOKEN_PROGRAM_ID.toBase58(),
  TOKEN_2022_PROGRAM_ID.toBase58(),
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL", // Associated Token Program
  "ComputeBudget111111111111111111111111111111", // Compute Budget Program
]);

export async function simulateRawTransaction(
  connection: Connection,
  rawBase64: string
): Promise<SimulationResult> {
  const dangerousInstructions: SimulationResult["dangerousInstructions"] = [];
  const buffer = Buffer.from(rawBase64.trim(), "base64");

  let tx: Transaction | VersionedTransaction;
  try {
    // Try legacy transaction first
    tx = Transaction.from(buffer);
  } catch {
    try {
      // Fallback to versioned transaction
      tx = VersionedTransaction.deserialize(buffer);
    } catch {
      throw new Error("Invalid serialized transaction wire format (expected valid base64 encoded Solana transaction).");
    }
  }

  // 1. Inspect instructions before simulation
  if ("instructions" in tx) {
    for (const ix of tx.instructions) {
      const pid = ix.programId.toBase58();

      // Check for unverified program ID
      if (!KNOWN_SAFE_PROGRAMS.has(pid)) {
        dangerousInstructions.push({
          programId: pid,
          descriptionEn: `Calls unverified external program (${pid.slice(0, 8)}...)`,
          descriptionHi: `अज्ञात बाहरी प्रोग्राम (${pid.slice(0, 8)}...) को कॉल करता है`,
          severity: "caution",
        });
      }

      // Check Token Program instructions (SetAuthority = instruction 6, Approve = instruction 4, CloseAccount = instruction 9)
      if (pid === TOKEN_PROGRAM_ID.toBase58() || pid === TOKEN_2022_PROGRAM_ID.toBase58()) {
        const typeTag = ix.data[0];
        if (typeTag === 6) {
          dangerousInstructions.push({
            programId: pid,
            descriptionEn: "SetAuthority instruction detected (can transfer ownership or authorities)",
            descriptionHi: "SetAuthority निर्देश पाया गया (खाते या मिंट का स्वामित्व बदल सकता है)",
            severity: "danger",
          });
        } else if (typeTag === 4) {
          dangerousInstructions.push({
            programId: pid,
            descriptionEn: "Approve instruction detected (grants token spending allowance)",
            descriptionHi: "Approve निर्देश पाया गया (टोकन खर्च करने की अनुमति देता है)",
            severity: "caution",
          });
        } else if (typeTag === 9) {
          dangerousInstructions.push({
            programId: pid,
            descriptionEn: "CloseAccount instruction detected (destroys token account and drains remaining SOL)",
            descriptionHi: "CloseAccount निर्देश पाया गया (टोकन खाता बंद कर बचा हुआ SOL निकाल सकता है)",
            severity: "danger",
          });
        }
      }
    }
  }

  // 2. Run simulation on Devnet
  let simResult;
  try {
    if ("instructions" in tx) {
      simResult = await connection.simulateTransaction(tx, undefined);
    } else {
      simResult = await connection.simulateTransaction(tx);
    }
  } catch (err: unknown) {
    throw new Error(err instanceof Error ? err.message : "Transaction simulation failed on Solana Devnet.");
  }

  const logs = simResult.value.logs || [];
  const balanceChanges: SimulationResult["balanceChanges"] = [];

  // Parse simulated balance changes if returned
  if (simResult.value.accounts) {
    simResult.value.accounts.forEach((acc, idx) => {
      if (acc) {
        const postSol = acc.lamports / LAMPORTS_PER_SOL;
        balanceChanges.push({
          account: `Account #${idx + 1}`,
          preSol: 0,
          postSol,
          diffSol: postSol,
        });
      }
    });
  }

  // Check logs for errors
  let hasError = false;
  if (simResult.value.err) {
    hasError = true;
    dangerousInstructions.push({
      programId: "Solana Runtime",
      descriptionEn: `Simulation reverted with error: ${JSON.stringify(simResult.value.err)}`,
      descriptionHi: `सिमुलेशन त्रुटि के साथ विफल हुआ: ${JSON.stringify(simResult.value.err)}`,
      severity: "danger",
    });
  }

  // Calculate overall verdict
  let verdict: SimulationResult["verdict"] = "safe";
  const hasDanger = dangerousInstructions.some((d) => d.severity === "danger") || hasError;
  const hasCaution = dangerousInstructions.some((d) => d.severity === "caution");

  if (hasDanger) {
    verdict = "danger";
  } else if (hasCaution) {
    verdict = "caution";
  }

  return {
    success: !hasError,
    verdict,
    balanceChanges,
    dangerousInstructions,
    logs,
  };
}
