import { describe, it, expect } from "vitest";
import { checkDomainSafety, OFFICIAL_SOLANA_DOMAINS } from "../lib/security/domainChecker";

describe("checkDomainSafety", () => {
  it("should recognize only listed official domains", () => {
    const res1 = checkDomainSafety("https://phantom.app");
    expect(res1.verdict).toBe("recognized");
    expect(res1.domain).toBe("phantom.app");

    const res2 = checkDomainSafety("jup.ag");
    expect(res2.verdict).toBe("recognized");
    expect(res2.domain).toBe("jup.ag");
  });

  it.each(OFFICIAL_SOLANA_DOMAINS)("recognizes the official domain %s", (domain) => {
    const result = checkDomainSafety(domain);
    expect(result.verdict).toBe("recognized");
    expect(result.matchedOfficialDomain).toBe(domain);
  });

  it.each(["example.com", "https://unlisted-example.org/path", "another-unlisted-site.net"])(
    "does not endorse the unknown domain %s",
    (domain) => {
      const result = checkDomainSafety(domain);
      expect(result.verdict).toBe("unknown");
      expect(result.matchedOfficialDomain).toBeUndefined();
      expect(result.reasonEn).toContain("not a recognized site");
      expect(result.reasonHi).toContain("पहचानी गई साइट नहीं");
    }
  );

  it("does not recognize an official hostname embedded in another hostname", () => {
    expect(checkDomainSafety("https://phantom.app.attacker.example").verdict).not.toBe("recognized");
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
