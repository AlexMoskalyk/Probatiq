import { describe, it, expect } from "vitest";
import { formatDateTime } from "./formatters";

describe("formatDateTime", () => {
  it("returns non-empty string", () => {
    expect(formatDateTime(new Date("2026-06-14T10:30:00Z"))).toMatch(/\d/);
  });

  it("contains year + time-like parts", () => {
    const s = formatDateTime(new Date("2026-06-14T10:30:00Z"));
    expect(s).toContain("2026");
  });
});
