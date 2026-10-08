import { describe, expect, it } from "vitest";
import en from "../i18n/en.json";
import hi from "../i18n/hi.json";

function stringPaths(dictionary: object, prefix = ""): string[] {
  return Object.entries(dictionary).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === "string" ? [path] : stringPaths(value, path);
  }).sort();
}

describe("bilingual safety content", () => {
  it("keeps English and Hindi translation keys in sync", () => {
    expect(stringPaths(hi)).toEqual(stringPaths(en));
  });

  it.each([en, hi])("provides guidance and three questions for each learning page", (dictionary) => {
    for (const tool of ["scanner", "scamLab"] as const) {
      const guide = dictionary.education[tool];
      for (const value of Object.values(guide)) {
        expect(value.trim().length).toBeGreaterThan(0);
      }
      expect(Object.keys(guide).filter((key) => /^q\d$/.test(key))).toHaveLength(3);
      expect(Object.keys(guide).filter((key) => /^a\d$/.test(key))).toHaveLength(3);
      expect(guide.example).toContain("90/100");
    }
  });

  it("does not endorse signing or unknown sites", () => {
    expect(en.preview.verdictSafe).toBe("No warnings detected");
    expect(en.domainCheck.resultUnknown).toContain("not a recognized site");
    expect(en.education.verdictNote).toBe("No warning does not guarantee safety.");
  });

  it.each([en, hi])("gives each route unique metadata", (dictionary) => {
    const routes = Object.values(dictionary.metadata);
    expect(new Set(routes.map((route) => route.title)).size).toBe(6);
    expect(new Set(routes.map((route) => route.description)).size).toBe(6);
  });
});
