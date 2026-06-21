import "@/src/test/mocks/db";
import "@/src/test/mocks/clerk";
import "@/src/test/mocks/next";
import "@/src/test/mocks/arcjet";
import "@/src/test/mocks/ai";
import { describe, it, expect, beforeEach } from "vitest";
import { dbMock } from "@/src/test/mocks/db";
import { setCurrentUser } from "@/src/test/mocks/clerk";
import { setArcjetDenied, protectMock } from "@/src/test/mocks/arcjet";
import { generateAiInterviewFeedbackMock } from "@/src/test/mocks/ai";
import {
  userFactory,
  jobInfoFactory,
  interviewFactory,
} from "@/src/test/factories";
import {
  createInterview,
  updateInterview,
  deleteInterview,
  generateInterviewFeedback,
} from "./actions";

beforeEach(() => {
  dbMock._reset();
  protectMock.mockReset();
  setArcjetDenied(false);
  generateAiInterviewFeedbackMock.mockReset().mockResolvedValue("feedback md");
});

describe("createInterview", () => {
  it("rejects unauthenticated", async () => {
    setCurrentUser(null);
    const r = await createInterview({ jobInfoId: "j1" });
    expect(r).toMatchObject({ error: true });
  });

  it("rejects when arcjet denies", async () => {
    setCurrentUser(userFactory());
    setArcjetDenied(true);
    const r = await createInterview({ jobInfoId: "j1" });
    expect(r).toMatchObject({ error: true });
    expect(dbMock.insert).not.toHaveBeenCalled();
  });

  it("rejects when jobInfo not owned", async () => {
    setCurrentUser(userFactory());
    dbMock.query.JobInfoTable.findFirst.mockResolvedValue(undefined);
    const r = await createInterview({ jobInfoId: "j1" });
    expect(r).toMatchObject({ error: true });
    expect(dbMock.insert).not.toHaveBeenCalled();
  });

  it("inserts on success", async () => {
    const user = userFactory();
    setCurrentUser(user);
    const job = jobInfoFactory({ userId: user.id });
    dbMock.query.JobInfoTable.findFirst.mockResolvedValue(job);
    dbMock._setInsertReturn([{ id: "interview-new", jobInfoId: job.id }]);

    const r = await createInterview({ jobInfoId: job.id });
    expect(r).toEqual({ error: false, id: "interview-new" });
  });
});

describe("updateInterview", () => {
  it("rejects unauthenticated", async () => {
    setCurrentUser(null);
    const r = await updateInterview("i1", { duration: "00:05:00" });
    expect(r).toMatchObject({ error: true });
  });

  it("rejects when interview not owned (IDOR)", async () => {
    setCurrentUser(userFactory());
    dbMock.query.InterviewTable.findFirst.mockResolvedValue(undefined);
    const r = await updateInterview("i1", { duration: "00:05:00" });
    expect(r).toMatchObject({ error: true });
    expect(dbMock.update).not.toHaveBeenCalled();
  });

  it("updates own interview", async () => {
    const user = userFactory();
    setCurrentUser(user);
    const job = jobInfoFactory({ userId: user.id });
    const interview = interviewFactory({ jobInfoId: job.id });
    dbMock.query.InterviewTable.findFirst.mockResolvedValue({
      ...interview,
      jobInfo: { id: job.id, userId: user.id },
    });
    dbMock._setUpdateReturn([{ id: interview.id, jobInfoId: job.id }]);

    const r = await updateInterview(interview.id, { duration: "00:05:00" });
    expect(r).toEqual({ error: false });
    expect(dbMock.update).toHaveBeenCalled();
  });

  it("rejects when interview owned by different user", async () => {
    const user = userFactory();
    setCurrentUser(user);
    const interview = interviewFactory();
    dbMock.query.InterviewTable.findFirst.mockResolvedValue({
      ...interview,
      jobInfo: { id: "j1", userId: "other-user" },
    });
    const r = await updateInterview(interview.id, { duration: "00:05:00" });
    expect(r).toMatchObject({ error: true });
    expect(dbMock.update).not.toHaveBeenCalled();
  });
});

describe("deleteInterview", () => {
  it("rejects unauthenticated", async () => {
    setCurrentUser(null);
    const r = await deleteInterview("i1");
    expect(r).toMatchObject({ error: true });
  });

  it("rejects when not owner", async () => {
    setCurrentUser(userFactory());
    dbMock.query.InterviewTable.findFirst.mockResolvedValue(undefined);
    const r = await deleteInterview("i1");
    expect(r).toMatchObject({ error: true });
    expect(dbMock.delete).not.toHaveBeenCalled();
  });
});

describe("generateInterviewFeedback", () => {
  it("rejects unauthenticated", async () => {
    setCurrentUser(null);
    const r = await generateInterviewFeedback("i1");
    expect(r).toMatchObject({ error: true });
  });

  it("rejects when interview not owned", async () => {
    setCurrentUser(userFactory());
    dbMock.query.InterviewTable.findFirst.mockResolvedValue(undefined);
    const r = await generateInterviewFeedback("i1");
    expect(r).toMatchObject({ error: true });
    expect(generateAiInterviewFeedbackMock).not.toHaveBeenCalled();
  });

  it("rejects when humeChatId missing", async () => {
    const user = userFactory();
    setCurrentUser(user);
    dbMock.query.InterviewTable.findFirst.mockResolvedValue({
      id: "i1",
      humeChatId: null,
      jobInfo: { id: "j1", userId: user.id },
    });
    const r = await generateInterviewFeedback("i1");
    expect(r).toMatchObject({ error: true, message: expect.any(String) });
    expect(generateAiInterviewFeedbackMock).not.toHaveBeenCalled();
  });

  it("generates and stores feedback on happy path", async () => {
    const user = userFactory();
    setCurrentUser(user);
    dbMock.query.InterviewTable.findFirst.mockResolvedValue({
      id: "i1",
      humeChatId: "hume-1",
      jobInfo: {
        id: "j1",
        userId: user.id,
        title: "T",
        description: "D",
        experienceLevel: "mid-level",
      },
    });
    dbMock._setUpdateReturn([{ id: "i1", jobInfoId: "j1" }]);

    const r = await generateInterviewFeedback("i1");
    expect(r).toEqual({ error: false });
    expect(generateAiInterviewFeedbackMock).toHaveBeenCalled();
    expect(dbMock.update).toHaveBeenCalled();
  });
});
