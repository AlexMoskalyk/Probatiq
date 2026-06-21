import "@/src/test/mocks/db";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { dbMock } from "@/src/test/mocks/db";
import { userFactory } from "@/src/test/factories";

const { authMock } = vi.hoisted(() => ({ authMock: vi.fn() }));

vi.mock("@clerk/nextjs/server", () => ({
  auth: authMock,
}));

import { getCurrentUser } from "./get-current-user";

beforeEach(() => {
  dbMock._reset();
  authMock.mockReset();
});

describe("getCurrentUser", () => {
  it("returns null userId when signed out", async () => {
    authMock.mockResolvedValue({
      userId: null,
      redirectToSignIn: vi.fn(),
    });
    const r = await getCurrentUser();
    expect(r.userId).toBeNull();
    expect(r.user).toBeUndefined();
  });

  it("returns userId without user when allData omitted", async () => {
    authMock.mockResolvedValue({
      userId: "u1",
      redirectToSignIn: vi.fn(),
    });
    const r = await getCurrentUser();
    expect(r.userId).toBe("u1");
    expect(r.user).toBeUndefined();
    expect(dbMock.query.UserTable.findFirst).not.toHaveBeenCalled();
  });

  it("loads user when allData=true", async () => {
    const user = userFactory({ id: "u1" });
    authMock.mockResolvedValue({
      userId: "u1",
      redirectToSignIn: vi.fn(),
    });
    dbMock.query.UserTable.findFirst.mockResolvedValue(user);

    const r = await getCurrentUser({ allData: true });
    expect(r.user).toEqual(user);
    expect(dbMock.query.UserTable.findFirst).toHaveBeenCalled();
  });

  it("does not load user when allData=true but userId null", async () => {
    authMock.mockResolvedValue({
      userId: null,
      redirectToSignIn: vi.fn(),
    });
    const r = await getCurrentUser({ allData: true });
    expect(r.user).toBeUndefined();
    expect(dbMock.query.UserTable.findFirst).not.toHaveBeenCalled();
  });
});
