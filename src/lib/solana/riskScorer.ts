export interface RiskFlag {
  id: string;
  severity: "low" | "medium" | "high";
  titleEn: string;
  titleHi: string;
  summaryEn: string;
  summaryHi: string;
  explanationEn: string;
  explanationHi: string;
  points: number;
}

export interface TokenScanResult {
  mint: string;
  decimals: number;
  supply: string;
  programType: "SPL" | "Token-2022";
  mintAuthority: string | null;
  freezeAuthority: string | null;
  extensions: string[];
  topHoldersShare: number;
  hasMetadata: boolean;
  score: number; // 0 to 100
  verdict: "safe" | "caution" | "danger";
  flags: RiskFlag[];
}

export function calculateRiskScore(params: {
  mintAuthority: string | null;
  freezeAuthority: string | null;
  extensions: string[];
  topHoldersShare?: number; // percentage held by top 3 accounts (0 - 100)
  hasMetadata?: boolean;
}): { score: number; verdict: "safe" | "caution" | "danger"; flags: RiskFlag[] } {
  const extensions = params.extensions || [];
  const flags: RiskFlag[] = [];
  let score = 0;

  // 1. Mint Authority Active Check
  if (params.mintAuthority !== null) {
    flags.push({
      id: "active_mint_authority",
      severity: "high",
      titleEn: "Active Mint Authority",
      titleHi: "सक्रिय मिंट अधिकार (Infinite Mint)",
      summaryEn: "Creator can print unlimited supply",
      summaryHi: "निर्माता असीमित टोकन छाप सकता है",
      explanationEn:
        "The creator has kept the key that mints new tokens. They can arbitrarily inflate the total token supply at zero cost and dump tokens onto buyers, driving the market value to zero.",
      explanationHi:
        "निर्माता ने नए टोकन बनाने की चाबी अपने पास रखी है। वे बिना किसी लागत के असीमित टोकन बनाकर बाजार में बेच सकते हैं, जिससे आपके टोकन का मूल्य शून्य हो सकता है।",
      points: 35,
    });
    score += 35;
  }

  // 2. Freeze Authority Active Check
  if (params.freezeAuthority !== null) {
    flags.push({
      id: "active_freeze_authority",
      severity: "high",
      titleEn: "Active Freeze Authority",
      titleHi: "सक्रिय फ्रीज अधिकार (Freeze Authority)",
      summaryEn: "Creator can freeze your token account",
      summaryHi: "निर्माता आपका टोकन खाता फ्रीज कर सकता है",
      explanationEn:
        "The freeze authority allows the token issuer to freeze any wallet holding this token. If frozen, you will not be able to transfer, sell, or swap your tokens — effectively trapping your funds.",
      explanationHi:
        "फ्रीज अधिकार टोकन जारीकर्ता को किसी भी धारक के खाते को फ्रीज (लॉक) करने की अनुमति देता है। फ्रीज होने पर आप अपने टोकन को ट्रांसफर या बेच नहीं पाएंगे।",
      points: 30,
    });
    score += 30;
  }

  // 3. Token-2022 Permanent Delegate
  if (extensions.includes("permanentDelegate")) {
    flags.push({
      id: "permanent_delegate",
      severity: "high",
      titleEn: "Permanent Delegate Enabled",
      titleHi: "स्थायी प्रतिनिधि (Permanent Delegate)",
      summaryEn: "An external key can transfer or burn your tokens without permission",
      summaryHi: "कोई बाहरी पता आपकी अनुमति के बिना आपके टोकन ट्रांसफर या जला सकता है",
      explanationEn:
        "A Token-2022 extension granting an admin key permanent delegate access over all token accounts. This key can seize or burn your tokens at any time without asking for your signature.",
      explanationHi:
        "एक टोकन-2022 एक्सटेंशन जो व्यवस्थापक को सभी खातों पर पूर्ण अधिकार देता है। यह पता कभी भी आपकी अनुमति के बिना आपके टोकन जब्त कर सकता है।",
      points: 25,
    });
    score += 25;
  }

  // 4. Token-2022 Non-Transferable
  if (extensions.includes("nonTransferable")) {
    flags.push({
      id: "non_transferable",
      severity: "medium",
      titleEn: "Non-Transferable (Soulbound)",
      titleHi: "गैर-हस्तांतरणीय (Non-Transferable)",
      summaryEn: "Tokens cannot be transferred or traded once received",
      summaryHi: "टोकन प्राप्त होने के बाद उन्हें ट्रांसफर या बेचा नहीं जा सकता",
      explanationEn:
        "This token is permanently bound to the receiving wallet and cannot be moved or swapped on any decentralized exchange.",
      explanationHi:
        "यह टोकन प्राप्तकर्ता के वॉलेट से हमेशा के लिए जुड़ जाता है और इसे किसी अन्य पते पर भेजा या बेचा नहीं जा सकता।",
      points: 20,
    });
    score += 20;
  }

  // 5. Token-2022 Transfer Hook
  if (extensions.includes("transferHook")) {
    flags.push({
      id: "transfer_hook",
      severity: "medium",
      titleEn: "Custom Transfer Hook Program",
      titleHi: "कस्टम ट्रांसफर हुक (Transfer Hook)",
      summaryEn: "Executes custom program logic during every transfer",
      summaryHi: "प्रत्येक ट्रांसफर के दौरान कस्टम प्रोग्राम कोड निष्पादित होता है",
      explanationEn:
        "The token program delegates transfer validation to a secondary custom program. If that program is malicious or buggy, it can revert or tax your transfers unexpectedly.",
      explanationHi:
        "यह टोकन ट्रांसफर की अनुमति देने के लिए एक दूसरे प्रोग्राम पर निर्भर करता है। यदि वह प्रोग्राम दुर्भावनापूर्ण है, तो वह आपके ट्रांसफर को रोक सकता है।",
      points: 15,
    });
    score += 15;
  }

  // 6. Token-2022 Transfer Fee
  if (extensions.includes("transferFeeConfig")) {
    flags.push({
      id: "transfer_fee",
      severity: "low",
      titleEn: "Transfer Fee Enabled",
      titleHi: "ट्रांसफर शुल्क (Transfer Fee)",
      summaryEn: "A fee percentage is automatically deducted on transfer",
      summaryHi: "ट्रांसफर पर स्वतः शुल्क काट लिया जाता है",
      explanationEn:
        "A protocol fee is deducted on every token transfer and routed to a fee authority. Check the fee rate before trading.",
      explanationHi:
        "हर ट्रांसफर पर एक निश्चित शुल्क कटता है और अधिकार वाले पते पर जाता है। लेन-देन से पहले शुल्क दर की जांच करें।",
      points: 10,
    });
    score += 10;
  }

  // 7. Top Holders Concentration (> 70% in top 3 accounts)
  if (params.topHoldersShare && params.topHoldersShare > 70) {
    flags.push({
      id: "high_concentration",
      severity: "medium",
      titleEn: "High Top-Holder Concentration",
      titleHi: "शीर्ष धारक संकेन्द्रण (High Concentration)",
      summaryEn: `${params.topHoldersShare.toFixed(1)}% of supply held by top 3 accounts`,
      summaryHi: `सप्लाई का ${params.topHoldersShare.toFixed(1)}% हिस्सा केवल शीर्ष 3 खातों में है`,
      explanationEn:
        "When a tiny handful of accounts control the vast majority of supply, they can easily manipulate the market price or dump all liquidity abruptly (rug pull).",
      explanationHi:
        "जब कुछ ही खातों के पास अधिकांश सप्लाई होती है, तो वे कभी भी सारा पैसा निकालकर टोकन की कीमत गिरा सकते हैं (Rug Pull)।",
      points: 15,
    });
    score += 15;
  }

  // 8. Missing Metadata
  if (params.hasMetadata === false) {
    flags.push({
      id: "missing_metadata",
      severity: "low",
      titleEn: "Missing On-Chain Metadata",
      titleHi: "मेटाडेटा अनुपलब्ध (Missing Metadata)",
      summaryEn: "No token name, symbol, or verified URI found",
      summaryHi: "कोई टोकन नाम, प्रतीक या सत्यापित URI नहीं मिला",
      explanationEn:
        "Legitimate tokens usually provide registered metadata so wallets can display their logo and verified name. Anonymous mints pose a higher risk.",
      explanationHi:
        "विश्वसनीय टोकन आमतौर पर नाम और लोगो पंजीकृत करते हैं। अज्ञात मिंट में जोखिम अधिक होता है।",
      points: 10,
    });
    score += 10;
  }

  // Bound score between 0 and 100
  score = Math.min(100, score);

  let verdict: "safe" | "caution" | "danger" = "safe";
  if (score >= 55) {
    verdict = "danger";
  } else if (score >= 25) {
    verdict = "caution";
  }

  return {
    score,
    verdict,
    flags,
  };
}
