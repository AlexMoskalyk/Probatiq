import { describe, it, expect } from "vitest";
import { formatQuestionDifficulty } from "./formatters";

describe("formatQuestionDifficulty", () => {
  it.each([
    ["easy", "Easy"],
    ["medium", "Medium"],
    ["hard", "Hard"],
  ] as const)("formats %s -> %s", (input, expected) => {
    expect(formatQuestionDifficulty(input)).toBe(expected);
  });

  it("throws on unknown value", () => {
    expect(() =>
      formatQuestionDifficulty("nightmare" as never),
    ).toThrow();
  });
});
