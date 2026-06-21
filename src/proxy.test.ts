import { describe, it, expect, vi } from "vitest";

vi.mock("@clerk/nextjs/server", () => ({
  clerkMiddleware: vi.fn((handler) => handler),
  createRouteMatcher: (patterns: string[]) => (req: { url: string }) => {
    const path = new URL(req.url).pathname;
    return patterns.some((p) => {
      const re = new RegExp(
        "^" + p.replace(/\(\.\*\)/g, ".*").replace(/\//g, "\\/") + "$",
      );
      return re.test(path);
    });
  },
}));

vi.mock("@arcjet/next", () => ({
  default: vi.fn(() => ({
    protect: vi.fn(async () => ({ isDenied: () => false })),
  })),
  shield: vi.fn(),
  detectBot: vi.fn(),
  slidingWindow: vi.fn(),
}));

import { config } from "./proxy";

describe("proxy config", () => {
  it("matches API routes", () => {
    expect(config.matcher).toContain("/(api|trpc)(.*)");
  });

  it("matches Clerk frontend API", () => {
    expect(config.matcher).toContain("/__clerk/(.*)");
  });

  it("has Next internals exclusion", () => {
    const general = config.matcher.find((m) => m.startsWith("/((?!_next"));
    expect(general).toBeDefined();
    expect(general).toContain("_next");
  });
});
