import { describe, it, expect } from "vitest";
import { checkDomainSafety } from "../lib/security/domainChecker";

describe("checkDomainSafety", () => {
  it("should classify legitimate domains as safe", () => {
    const res1 = checkDomainSafety("https://phantom.app");
    expect(res1.verdict).toBe("safe");
    expect(res1.domain).toBe("phantom.app");

    const res2 = checkDomainSafety("jup.ag");
    expect(res2.verdict).toBe("safe");
    expect(res2.domain).toBe("jup.ag");
  });

  it("should detect known phishing domains as blocked", () => {
    const res = checkDomainSafety("https://phantom-airdrop.xyz/claim");
    expect(res.verdict).toBe("blocked");
  });

  it("should detect typo-squatting lookalike domains as suspicious", () => {
    const res = checkDomainSafety("phant0m.app");
    expect(res.verdict).toBe("suspicious");
    expect(res.matchedOfficialDomain).toBe("phantom.app");
  });

  it("should flag suspicious spoofing keywords", () => {
    const res = checkDomainSafety("raydium-swap.net");
    expect(res.verdict).toBe("suspicious");
    expect(res.matchedOfficialDomain).toBe("raydium.io");
  });
});
