import { describe, it, expect, vi, beforeEach } from "vitest";

const { verifyWebhookMock, upsertUserMock, deleteUserMock } = vi.hoisted(
  () => ({
    verifyWebhookMock: vi.fn(),
    upsertUserMock: vi.fn(async () => undefined),
    deleteUserMock: vi.fn(async () => undefined),
  }),
);

vi.mock("@clerk/nextjs/webhooks", () => ({
  verifyWebhook: verifyWebhookMock,
}));

vi.mock("@/src/features/users/db", () => ({
  upsertUser: upsertUserMock,
  deleteUser: deleteUserMock,
}));

import { POST } from "./route";

function makeReq() {
  return new Request("http://localhost/api/webhooks/clerk", {
    method: "POST",
    body: "{}",
  }) as unknown as Parameters<typeof POST>[0];
}

beforeEach(() => {
  verifyWebhookMock.mockReset();
  upsertUserMock.mockReset().mockResolvedValue(undefined);
  deleteUserMock.mockReset().mockResolvedValue(undefined);
});

describe("clerk webhook POST", () => {
  it("returns 400 on bad signature", async () => {
    verifyWebhookMock.mockRejectedValue(new Error("bad sig"));
    const res = await POST(makeReq());
    expect(res.status).toBe(400);
    expect(upsertUserMock).not.toHaveBeenCalled();
    expect(deleteUserMock).not.toHaveBeenCalled();
  });

  it("upserts on user.created", async () => {
    verifyWebhookMock.mockResolvedValue({
      type: "user.created",
      data: {
        id: "u1",
        email_addresses: [{ id: "e1", email_address: "a@b.com" }],
        primary_email_address_id: "e1",
        first_name: "Jane",
        last_name: "Doe",
        image_url: "https://img",
        created_at: 0,
        updated_at: 0,
      },
    });
    const res = await POST(makeReq());
    expect(res.status).toBe(200);
    expect(upsertUserMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "u1",
        email: "a@b.com",
        name: "Jane Doe",
      }),
    );
  });

  it("upserts on user.updated", async () => {
    verifyWebhookMock.mockResolvedValue({
      type: "user.updated",
      data: {
        id: "u2",
        email_addresses: [{ id: "e1", email_address: "c@d.com" }],
        primary_email_address_id: "e1",
        first_name: "X",
        last_name: "Y",
        image_url: "https://img",
        created_at: 0,
        updated_at: 0,
      },
    });
    const res = await POST(makeReq());
    expect(res.status).toBe(200);
    expect(upsertUserMock).toHaveBeenCalled();
  });

  it("returns 400 when primary email missing", async () => {
    verifyWebhookMock.mockResolvedValue({
      type: "user.created",
      data: {
        id: "u1",
        email_addresses: [{ id: "other", email_address: "x@y.com" }],
        primary_email_address_id: "e1",
        first_name: "A",
        last_name: "B",
        image_url: "https://img",
        created_at: 0,
        updated_at: 0,
      },
    });
    const res = await POST(makeReq());
    expect(res.status).toBe(400);
    expect(upsertUserMock).not.toHaveBeenCalled();
  });

  it("deletes on user.deleted", async () => {
    verifyWebhookMock.mockResolvedValue({
      type: "user.deleted",
      data: { id: "u1" },
    });
    const res = await POST(makeReq());
    expect(res.status).toBe(200);
    expect(deleteUserMock).toHaveBeenCalledWith("u1");
  });

  it("returns 400 when delete id missing", async () => {
    verifyWebhookMock.mockResolvedValue({
      type: "user.deleted",
      data: { id: null },
    });
    const res = await POST(makeReq());
    expect(res.status).toBe(400);
    expect(deleteUserMock).not.toHaveBeenCalled();
  });

  it("returns 400 on unhandled event type", async () => {
    verifyWebhookMock.mockResolvedValue({
      type: "session.created",
      data: {},
    });
    const res = await POST(makeReq());
    expect(res.status).toBe(400);
  });
});
