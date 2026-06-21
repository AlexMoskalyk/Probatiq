import { describe, it, expect } from "vitest";
import { formatExperienceLevel } from "./format-experience-level";

describe("formatExperienceLevel", () => {
  it.each([
    ["junior", "Junior"],
    ["mid-level", "Mid-Level"],
    ["senior", "Senior"],
  ] as const)("formats %s -> %s", (input, expected) => {
    expect(formatExperienceLevel(input)).toBe(expected);
  });

  it("throws on unknown level", () => {
    expect(() => formatExperienceLevel("lead" as never)).toThrow();
  });
});
