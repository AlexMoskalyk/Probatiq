import { vi } from "vitest";

export class RedirectError extends Error {
  constructor(public url: string) {
    super(`REDIRECT:${url}`);
    this.name = "RedirectError";
  }
}

export const redirectMock = vi.fn((url: string) => {
  throw new RedirectError(url);
});

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
  notFound: vi.fn(() => {
    throw new Error("NOT_FOUND");
  }),
}));
