import { describe, it, expect } from "vitest";
import { jobInfoSchema } from "./schemas";

const valid = {
  name: "Acme JD",
  title: "Senior Engineer",
  experienceLevel: "senior" as const,
  description: "Build great stuff.",
};

describe("jobInfoSchema", () => {
  it("accepts valid input", () => {
    expect(jobInfoSchema.parse(valid)).toEqual(valid);
  });

  it("allows null title", () => {
    const result = jobInfoSchema.parse({ ...valid, title: null });
    expect(result.title).toBeNull();
  });

  it("rejects empty title string", () => {
    expect(() => jobInfoSchema.parse({ ...valid, title: "" })).toThrow();
  });

  it("rejects empty name", () => {
    expect(() => jobInfoSchema.parse({ ...valid, name: "" })).toThrow();
  });

  it("rejects empty description", () => {
    expect(() => jobInfoSchema.parse({ ...valid, description: "" })).toThrow();
  });

  it.each(["junior", "mid-level", "senior"])(
    "accepts experience level %s",
    (level) => {
      expect(
        jobInfoSchema.parse({ ...valid, experienceLevel: level }),
      ).toMatchObject({ experienceLevel: level });
    },
  );

  it("rejects unknown experience level", () => {
    expect(() =>
      jobInfoSchema.parse({ ...valid, experienceLevel: "lead" }),
    ).toThrow();
  });

  it("rejects missing required fields", () => {
    expect(() => jobInfoSchema.parse({})).toThrow();
  });
});
