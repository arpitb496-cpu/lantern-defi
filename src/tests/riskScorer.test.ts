import { describe, it, expect } from "vitest";
import { calculateRiskScore } from "../lib/solana/riskScorer";

describe("calculateRiskScore", () => {
  it("should score a fully renounced, clean token as safe (0-29)", () => {
    const result = calculateRiskScore({
      mintAuthority: null,
      freezeAuthority: null,
      extensions: [],
      topHoldersShare: 25,
      hasMetadata: true,
    });

    expect(result.score).toBeLessThan(30);
    expect(result.verdict).toBe("safe");
  });

  it("should flag a token with active mint and freeze authority as danger or caution", () => {
    const result = calculateRiskScore({
      mintAuthority: "Owner1111111111111111111111111111111111111",
      freezeAuthority: "Owner1111111111111111111111111111111111111",
      extensions: [],
      topHoldersShare: 85,
      hasMetadata: false,
    });

    expect(result.score).toBeGreaterThanOrEqual(60);
    expect(result.verdict).toBe("danger");
    expect(result.flags.some((f) => f.id === "active_mint_authority")).toBe(true);
    expect(result.flags.some((f) => f.id === "active_freeze_authority")).toBe(true);
  });

  it("should heavily penalize Token-2022 permanent delegate backdoor", () => {
    const result = calculateRiskScore({
      mintAuthority: null,
      freezeAuthority: null,
      extensions: ["permanentDelegate"],
      topHoldersShare: 30,
      hasMetadata: true,
    });

    expect(result.flags.some((f) => f.id === "permanent_delegate")).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(25);
  });
});
