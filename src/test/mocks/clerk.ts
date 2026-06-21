import { vi } from "vitest";
import type { User } from "@/src/test/factories";

type CurrentUser = {
  userId: string | null;
  redirectToSignIn: () => void;
  user?: User;
};

export const getCurrentUserMock = vi.fn<() => Promise<CurrentUser>>();

export function setCurrentUser(user: User | null) {
  if (user == null) {
    getCurrentUserMock.mockResolvedValue({
      userId: null,
      redirectToSignIn: vi.fn(),
      user: undefined,
    });
    return;
  }
  getCurrentUserMock.mockResolvedValue({
    userId: user.id,
    redirectToSignIn: vi.fn(),
    user,
  });
}

vi.mock("@/src/services/clerk/lib/get-current-user", () => ({
  getCurrentUser: getCurrentUserMock,
}));
