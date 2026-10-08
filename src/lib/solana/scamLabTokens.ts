import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  createInitializeMintInstruction,
  createMintToInstruction,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
  MINT_SIZE,
  createSetAuthorityInstruction,
  AuthorityType,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  ExtensionType,
  getMintLen,
  createInitializePermanentDelegateInstruction,
} from "@solana/spl-token";

export interface MintTestTokenResult {
  mintAddress: string;
  signature: string;
  type: "scam" | "safe";
}

/**
 * Creates a devnet Scam / Honeypot token:
 * - Active Freeze Authority
 * - Active Mint Authority
 * - Token-2022 with Permanent Delegate extension
 */
export async function createScamTestToken(
  connection: Connection,
  walletPubkey: PublicKey,
  sendTransaction: (tx: Transaction, conn: Connection) => Promise<string>
): Promise<MintTestTokenResult> {
  const mintKeypair = Keypair.generate();
  const decimals = 9;

  // Calculate rent for Token-2022 with Permanent Delegate extension
  const extensions = [ExtensionType.PermanentDelegate];
  const mintLen = getMintLen(extensions);
  const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

  const tx = new Transaction().add(
    // 1. Create account owned by Token-2022 program
    SystemProgram.createAccount({
      fromPubkey: walletPubkey,
      newAccountPubkey: mintKeypair.publicKey,
      space: mintLen,
      lamports,
      programId: TOKEN_2022_PROGRAM_ID,
    }),
    // 2. Initialize Permanent Delegate extension (set to walletPubkey)
    createInitializePermanentDelegateInstruction(
      mintKeypair.publicKey,
      walletPubkey,
      TOKEN_2022_PROGRAM_ID
    ),
    // 3. Initialize Mint with ACTIVE freeze authority and ACTIVE mint authority
    createInitializeMintInstruction(
      mintKeypair.publicKey,
      decimals,
      walletPubkey, // mintAuthority kept active!
      walletPubkey, // freezeAuthority kept active!
      TOKEN_2022_PROGRAM_ID
    )
  );

  // 4. Create user's ATA and mint 1,000,000 tokens
  const userAta = getAssociatedTokenAddressSync(
    mintKeypair.publicKey,
    walletPubkey,
    false,
    TOKEN_2022_PROGRAM_ID
  );

  tx.add(
    createAssociatedTokenAccountInstruction(
      walletPubkey,
      userAta,
      walletPubkey,
      mintKeypair.publicKey,
      TOKEN_2022_PROGRAM_ID
    ),
    createMintToInstruction(
      mintKeypair.publicKey,
      userAta,
      walletPubkey,
      1_000_000n * 1_000_000_000n,
      [],
      TOKEN_2022_PROGRAM_ID
    )
  );

  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.feePayer = walletPubkey;
  tx.partialSign(mintKeypair);

  const signature = await sendTransaction(tx, connection);
  const latestBlockhash = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    signature,
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
  });

  return {
    mintAddress: mintKeypair.publicKey.toBase58(),
    signature,
    type: "scam",
  };
}

/**
 * Creates a devnet Safe / Clean token:
 * - Revoked Freeze Authority
 * - Revoked Mint Authority (fixed supply)
 */
export async function createSafeTestToken(
  connection: Connection,
  walletPubkey: PublicKey,
  sendTransaction: (tx: Transaction, conn: Connection) => Promise<string>
): Promise<MintTestTokenResult> {
  const mintKeypair = Keypair.generate();
  const decimals = 6;
  const lamports = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

  const tx = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: walletPubkey,
      newAccountPubkey: mintKeypair.publicKey,
      space: MINT_SIZE,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    }),
    createInitializeMintInstruction(
      mintKeypair.publicKey,
      decimals,
      walletPubkey,
      null, // Freeze authority is null right from creation!
      TOKEN_PROGRAM_ID
    )
  );

  const userAta = getAssociatedTokenAddressSync(
    mintKeypair.publicKey,
    walletPubkey,
    false,
    TOKEN_PROGRAM_ID
  );

  // Create ATA, mint fixed initial supply, then REVOKE mint authority completely
  tx.add(
    createAssociatedTokenAccountInstruction(
      walletPubkey,
      userAta,
      walletPubkey,
      mintKeypair.publicKey,
      TOKEN_PROGRAM_ID
    ),
    createMintToInstruction(
      mintKeypair.publicKey,
      userAta,
      walletPubkey,
      100_000n * 1_000_000n,
      [],
      TOKEN_PROGRAM_ID
    ),
    createSetAuthorityInstruction(
      mintKeypair.publicKey,
      walletPubkey,
      AuthorityType.MintTokens,
      null, // Revoke mint authority to NULL!
      [],
      TOKEN_PROGRAM_ID
    )
  );

  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.feePayer = walletPubkey;
  tx.partialSign(mintKeypair);

  const signature = await sendTransaction(tx, connection);
  const latestBlockhash = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    signature,
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
  });

  return {
    mintAddress: mintKeypair.publicKey.toBase58(),
    signature,
    type: "safe",
  };
}
