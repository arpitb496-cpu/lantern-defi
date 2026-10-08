import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from "../constants";
import { calculateRiskScore, TokenScanResult } from "./riskScorer";

export async function scanTokenMint(
  connection: Connection,
  mintAddressStr: string
): Promise<TokenScanResult> {
  const mintPubkey = new PublicKey(mintAddressStr.trim());

  // 1. Fetch account info with parsed JSON
  const accountInfo = await connection.getParsedAccountInfo(mintPubkey);
  if (!accountInfo.value) {
    throw new Error("Mint account not found on Solana Devnet. Please verify the address.");
  }

  const ownerProgram = accountInfo.value.owner;
  const isToken2022 = ownerProgram.equals(TOKEN_2022_PROGRAM_ID);
  const isSplToken = ownerProgram.equals(TOKEN_PROGRAM_ID);

  if (!isToken2022 && !isSplToken) {
    throw new Error(
      `Address is owned by program ${ownerProgram.toBase58()}, not a recognized Solana SPL Token or Token-2022 mint.`
    );
  }

  const parsedData = (accountInfo.value.data as unknown as { parsed?: { info?: Record<string, unknown>; type?: string } })?.parsed;
  if (!parsedData || parsedData.type !== "mint") {
    throw new Error("The specified account is not an initialized SPL Token mint.");
  }

  const info = parsedData.info || {};
  const decimals = Number(info.decimals ?? 0);
  const supplyRaw = String(info.supply ?? "0");
  const mintAuthority = (info.mintAuthority as string) || null;
  const freezeAuthority = (info.freezeAuthority as string) || null;

  // 2. Token-2022 extensions parsing
  const extensions: string[] = [];
  if (isToken2022 && info.extensions && Array.isArray(info.extensions)) {
    for (const ext of info.extensions) {
      if (ext && typeof ext === "object" && "extension" in ext) {
        extensions.push(String(ext.extension));
      }
    }
  }

  // 3. Top holder concentration check
  let topHoldersShare = 0;
  try {
    const largestAccounts = await connection.getTokenLargestAccounts(mintPubkey);
    if (largestAccounts.value && largestAccounts.value.length > 0) {
      const totalRaw = BigInt(supplyRaw);
      if (totalRaw > BigInt(0)) {
        let top3Sum = BigInt(0);
        const top3 = largestAccounts.value.slice(0, 3);
        for (const holder of top3) {
          top3Sum += BigInt(holder.amount || "0");
        }
        topHoldersShare = Number((top3Sum * BigInt(10000)) / totalRaw) / 100;
      }
    }
  } catch {
    // Top accounts query may fail on some private devnet accounts
  }

  // 4. Metadata presence check (Metaplex metadata PDA)
  let hasMetadata = false;
  try {
    const METADATA_PROGRAM_ID = new PublicKey(
      "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
    );
    const [metadataPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        METADATA_PROGRAM_ID.toBuffer(),
        mintPubkey.toBuffer(),
      ],
      METADATA_PROGRAM_ID
    );
    const metadataAccount = await connection.getAccountInfo(metadataPda);
    if (metadataAccount && metadataAccount.data.length > 0) {
      hasMetadata = true;
    }
  } catch {
    hasMetadata = false;
  }

  // Calculate formatted human supply
  const divisor = 10 ** decimals;
  const supplyFormatted = (Number(supplyRaw) / divisor).toLocaleString(undefined, {
    maximumFractionDigits: decimals,
  });

  const { score, verdict, flags } = calculateRiskScore({
    mintAuthority,
    freezeAuthority,
    extensions,
    topHoldersShare,
    hasMetadata,
  });

  return {
    mint: mintPubkey.toBase58(),
    decimals,
    supply: supplyFormatted,
    programType: isToken2022 ? "Token-2022" : "SPL",
    mintAuthority,
    freezeAuthority,
    extensions,
    topHoldersShare,
    hasMetadata,
    score,
    verdict,
    flags,
  };
}
