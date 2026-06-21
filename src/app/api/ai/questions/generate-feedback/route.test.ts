import "@/src/test/mocks/db";
import "@/src/test/mocks/clerk";
import "@/src/test/mocks/ai";
import { describe, it, expect, beforeEach } from "vitest";
import { dbMock } from "@/src/test/mocks/db";
import { setCurrentUser } from "@/src/test/mocks/clerk";
import { generateAiQuestionFeedbackMock } from "@/src/test/mocks/ai";
import { userFactory } from "@/src/test/factories";
import { POST } from "./route";

function makeReq(body: unknown) {
  return new Request("http://localhost/api/ai/questions/generate-feedback", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

beforeEach(() => {
  dbMock._reset();
  generateAiQuestionFeedbackMock.mockClear();
});

describe("POST generate-feedback", () => {
  it("400 on invalid body", async () => {
    setCurrentUser(userFactory());
    const res = await POST(makeReq({ prompt: "", questionId: "" }));
    expect(res.status).toBe(400);
  });

  it("401 when anon", async () => {
    setCurrentUser(null);
    const res = await POST(
      makeReq({ prompt: "my answer", questionId: "q1" }),
    );
    expect(res.status).toBe(401);
  });

  it("403 when question not found", async () => {
    setCurrentUser(userFactory());
    dbMock.query.QuestionTable.findFirst.mockResolvedValue(undefined);
    const res = await POST(
      makeReq({ prompt: "my answer", questionId: "q1" }),
    );
    expect(res.status).toBe(403);
    expect(generateAiQuestionFeedbackMock).not.toHaveBeenCalled();
  });

  it("403 when question's jobInfo owned by another user (IDOR)", async () => {
    setCurrentUser(userFactory({ id: "u1" }));
    dbMock.query.QuestionTable.findFirst.mockResolvedValue({
      id: "q1",
      text: "Q?",
      jobInfo: { userId: "other" },
    });
    const res = await POST(
      makeReq({ prompt: "my answer", questionId: "q1" }),
    );
    expect(res.status).toBe(403);
    expect(generateAiQuestionFeedbackMock).not.toHaveBeenCalled();
  });

  it("200 + streams when owner", async () => {
    const user = userFactory();
    setCurrentUser(user);
    dbMock.query.QuestionTable.findFirst.mockResolvedValue({
      id: "q1",
      text: "Q?",
      jobInfo: { userId: user.id },
    });
    const res = await POST(
      makeReq({ prompt: "my answer", questionId: "q1" }),
    );
    expect(res.status).toBe(200);
    expect(generateAiQuestionFeedbackMock).toHaveBeenCalled();
  });
});
