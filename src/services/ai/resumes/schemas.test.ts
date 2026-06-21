import { describe, it, expect } from "vitest";
import { aiAnalyzeSchema } from "./schemas";

const category = {
  score: 8,
  summary: "Good",
  feedback: [
    { type: "strength" as const, name: "Clear", message: "Well written" },
    {
      type: "minor-improvement" as const,
      name: "Spacing",
      message: "Tighten spacing",
    },
  ],
};

const valid = {
  overallScore: 7,
  ats: category,
  jobMatch: category,
  writingAndFormatting: category,
  keywordCoverage: category,
  other: category,
};

describe("aiAnalyzeSchema", () => {
  it("accepts valid payload", () => {
    expect(aiAnalyzeSchema.parse(valid)).toEqual(valid);
  });

  it("rejects overallScore > 10", () => {
    expect(() =>
      aiAnalyzeSchema.parse({ ...valid, overallScore: 11 }),
    ).toThrow();
  });

  it("rejects overallScore < 0", () => {
    expect(() =>
      aiAnalyzeSchema.parse({ ...valid, overallScore: -1 }),
    ).toThrow();
  });

  it("rejects category score > 10", () => {
    expect(() =>
      aiAnalyzeSchema.parse({
        ...valid,
        ats: { ...category, score: 11 },
      }),
    ).toThrow();
  });

  it("rejects unknown feedback type", () => {
    expect(() =>
      aiAnalyzeSchema.parse({
        ...valid,
        ats: {
          ...category,
          feedback: [{ type: "nitpick", name: "n", message: "m" }],
        },
      }),
    ).toThrow();
  });

  it.each(["strength", "minor-improvement", "major-improvement"])(
    "accepts feedback type %s",
    (type) => {
      expect(
        aiAnalyzeSchema.parse({
          ...valid,
          ats: {
            ...category,
            feedback: [{ type, name: "n", message: "m" }],
          },
        }),
      ).toBeTruthy();
    },
  );

  it("rejects missing category", () => {
    const { ats: _ats, ...rest } = valid;
    expect(() => aiAnalyzeSchema.parse(rest)).toThrow();
  });

  it("allows empty feedback array", () => {
    expect(
      aiAnalyzeSchema.parse({
        ...valid,
        ats: { ...category, feedback: [] },
      }),
    ).toBeTruthy();
  });
});
