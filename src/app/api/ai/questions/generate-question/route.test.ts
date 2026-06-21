import "@/src/test/mocks/db";
import "@/src/test/mocks/clerk";
import "@/src/test/mocks/ai";
import { describe, it, expect, beforeEach } from "vitest";
import { dbMock } from "@/src/test/mocks/db";
import { setCurrentUser } from "@/src/test/mocks/clerk";
import { generateAiQuestionMock } from "@/src/test/mocks/ai";
import { userFactory, jobInfoFactory } from "@/src/test/factories";
import { POST } from "./route";

function makeReq(body: unknown) {
  return new Request("http://localhost/api/ai/questions/generate-question", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

beforeEach(() => {
  dbMock._reset();
  generateAiQuestionMock.mockClear();
});

describe("POST generate-question", () => {
  it("400 on invalid body", async () => {
    setCurrentUser(userFactory());
    const res = await POST(makeReq({ prompt: "wrong", jobInfoId: "" }));
    expect(res.status).toBe(400);
    expect(generateAiQuestionMock).not.toHaveBeenCalled();
  });

  it("401 when anon", async () => {
    setCurrentUser(null);
    const res = await POST(makeReq({ prompt: "medium", jobInfoId: "j1" }));
    expect(res.status).toBe(401);
    expect(generateAiQuestionMock).not.toHaveBeenCalled();
  });

  it("403 when jobInfo not owned", async () => {
    setCurrentUser(userFactory());
    dbMock.query.JobInfoTable.findFirst.mockResolvedValue(undefined);
    const res = await POST(makeReq({ prompt: "medium", jobInfoId: "j1" }));
    expect(res.status).toBe(403);
    expect(generateAiQuestionMock).not.toHaveBeenCalled();
  });

  it("200 + streams when owner", async () => {
    const user = userFactory();
    setCurrentUser(user);
    const job = jobInfoFactory({ userId: user.id });
    dbMock.query.JobInfoTable.findFirst.mockResolvedValue(job);
    dbMock.query.QuestionTable.findMany.mockResolvedValue([]);

    const res = await POST(makeReq({ prompt: "medium", jobInfoId: job.id }));
    expect(res.status).toBe(200);
    expect(generateAiQuestionMock).toHaveBeenCalled();
  });
});
