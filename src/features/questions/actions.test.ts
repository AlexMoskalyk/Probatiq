import "@/src/test/mocks/db";
import "@/src/test/mocks/clerk";
import "@/src/test/mocks/next";
import { describe, it, expect, beforeEach } from "vitest";
import { dbMock } from "@/src/test/mocks/db";
import { setCurrentUser } from "@/src/test/mocks/clerk";
import { userFactory, jobInfoFactory } from "@/src/test/factories";
import { createQuestion } from "./actions";

beforeEach(() => dbMock._reset());

describe("createQuestion", () => {
  const payload = {
    text: "Q?",
    jobInfoId: "job-1",
    difficulty: "medium" as const,
  };

  it("rejects unauthenticated", async () => {
    setCurrentUser(null);
    const r = await createQuestion(payload);
    expect(r).toMatchObject({ error: true });
    expect(dbMock.insert).not.toHaveBeenCalled();
  });

  it("rejects when jobInfo not owned (IDOR)", async () => {
    setCurrentUser(userFactory());
    dbMock.query.JobInfoTable.findFirst.mockResolvedValue(undefined);
    const r = await createQuestion(payload);
    expect(r).toMatchObject({ error: true });
    expect(dbMock.insert).not.toHaveBeenCalled();
  });

  it("inserts on success", async () => {
    const user = userFactory();
    setCurrentUser(user);
    const job = jobInfoFactory({ userId: user.id });
    dbMock.query.JobInfoTable.findFirst.mockResolvedValue(job);
    dbMock._setInsertReturn([{ id: "q-new", jobInfoId: job.id }]);

    const r = await createQuestion({ ...payload, jobInfoId: job.id });
    expect(r).toEqual({ error: false, id: "q-new" });
  });
});
