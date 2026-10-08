export interface DomainCheckResult {
  domain: string;
  verdict: "safe" | "suspicious" | "blocked";
  reasonEn: string;
  reasonHi: string;
  matchedOfficialDomain?: string;
  similarityScore?: number;
}

// Known official legitimate domains in the Solana ecosystem
export const OFFICIAL_SOLANA_DOMAINS = [
  "phantom.app",
  "solflare.com",
  "backpack.app",
  "jup.ag",
  "raydium.io",
  "orca.so",
  "solana.com",
  "explorer.solana.com",
  "solscan.io",
  "magiceden.io",
  "tensor.trade",
];

// Local Blocklist of known phishing / scam domains
export const KNOWN_PHISHING_BLOCKLIST = new Set([
  "phantom-airdrop.xyz",
  "phantom-wallet-auth.net",
  "solflare-claim-sol.cc",
  "jupiter-airdrop-claim.com",
  "raydium-rewards.top",
  "solana-foundation-airdrop.org",
  "magiceden-claim.xyz",
  "backpack-claim-nft.online",
]);

function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  );

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

export function checkDomainSafety(inputUrlOrDomain: string): DomainCheckResult {
  let cleaned = inputUrlOrDomain.trim().toLowerCase();
  try {
    if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
      const parsed = new URL(cleaned);
      cleaned = parsed.hostname;
    } else {
      // Remove paths/slashes if user typed "phantom.app/airdrop"
      cleaned = cleaned.split("/")[0].split("?")[0];
    }
  } catch {
    // Keep cleaned
  }

  // 1. Direct blocklist check
  if (KNOWN_PHISHING_BLOCKLIST.has(cleaned)) {
    return {
      domain: cleaned,
      verdict: "blocked",
      reasonEn: "This domain matches our active security blocklist of known drainer / phishing websites.",
      reasonHi: "यह डोमेन ज्ञात फ़िशिंग / वॉलेट ड्रेनर वेबसाइटों की सक्रिय सुरक्षा ब्लॉकलिस्ट से मेल खाता है।",
    };
  }

  // 2. Direct official domain match
  if (OFFICIAL_SOLANA_DOMAINS.includes(cleaned)) {
    return {
      domain: cleaned,
      verdict: "safe",
      reasonEn: "Verified official domain in the Solana ecosystem.",
      reasonHi: "सोलाना इकोसिस्टम का सत्यापित आधिकारिक डोमेन।",
      matchedOfficialDomain: cleaned,
    };
  }

  // 3. Typo-squatting & lookalike heuristic
  // Check Levenshtein distance or substrings
  for (const official of OFFICIAL_SOLANA_DOMAINS) {
    const officialBase = official.split(".")[0];
    const cleanedBase = cleaned.split(".")[0];

    // Direct substring spoofing (e.g. phantom-claim.xyz or free-solflare.com)
    if (
      cleanedBase.includes(officialBase) &&
      cleanedBase !== officialBase &&
      (cleaned.includes("airdrop") ||
        cleaned.includes("claim") ||
        cleaned.includes("wallet") ||
        cleaned.includes("auth") ||
        cleaned.includes("free") ||
        cleaned.includes("gift") ||
        cleaned.includes("swap") ||
        cleaned.includes("rewards") ||
        cleaned.includes("connect") ||
        cleaned.includes("login") ||
        cleaned.includes("stake"))
    ) {
      return {
        domain: cleaned,
        verdict: "suspicious",
        reasonEn: `High-probability phishing lookalike impersonating "${official}". Often uses fake claim or airdrop lures.`,
        reasonHi: `संभावित फ़िशिंग वेबसाइट जो "${official}" की नकल कर रही है। अक्सर मुफ्त टोकन का लालच देती है।`,
        matchedOfficialDomain: official,
      };
    }

    // Levenshtein distance check on domain base (1 or 2 edits away, e.g., phant0m.app)
    const dist = levenshteinDistance(cleanedBase, officialBase);
    if (dist > 0 && dist <= 2 && Math.abs(cleanedBase.length - officialBase.length) <= 2) {
      return {
        domain: cleaned,
        verdict: "suspicious",
        reasonEn: `Typo-squatting detected! Domain name is visually deceptive and mimics "${official}" (distance: ${dist}).`,
        reasonHi: `टाइपो-स्क्वैटिंग पकड़ी गई! यह नाम देखने में "${official}" जैसा धोखा देने वाला है।`,
        matchedOfficialDomain: official,
        similarityScore: dist,
      };
    }
  }

  // 4. Unknown domain
  return {
    domain: cleaned,
    verdict: "safe",
    reasonEn: "No direct scam match or typo-squatting patterns detected. Always verify SSL and contract origins before signing.",
    reasonHi: "कोई सीधा स्कैम या फ़िशिंग पैटर्न नहीं मिला। हस्ताक्षर करने से पहले हमेशा सावधानी बरतें।",
  };
}
