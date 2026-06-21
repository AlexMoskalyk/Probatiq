import { vi } from "vitest";

export const protectMock = vi.fn(async (): Promise<{
  isDenied: () => boolean;
  isAllowed: () => boolean;
}> => ({
  isDenied: () => false,
  isAllowed: () => true,
}));

vi.mock("@arcjet/next", () => {
  const arcjet = vi.fn(() => ({
    protect: protectMock,
  }));
  return {
    default: arcjet,
    tokenBucket: vi.fn(() => ({})),
    shield: vi.fn(() => ({})),
    detectBot: vi.fn(() => ({})),
    slidingWindow: vi.fn(() => ({})),
    request: vi.fn(async () => ({})),
  };
});

export function setArcjetDenied(denied = true) {
  protectMock.mockResolvedValue({
    isDenied: () => denied,
    isAllowed: () => !denied,
  });
}
