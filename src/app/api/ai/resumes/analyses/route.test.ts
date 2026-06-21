import "@/src/test/mocks/db";
import "@/src/test/mocks/clerk";
import "@/src/test/mocks/ai";
import { describe, it, expect, beforeEach } from "vitest";
import { dbMock } from "@/src/test/mocks/db";
import { setCurrentUser } from "@/src/test/mocks/clerk";
import { analyzeResumeForJobMock } from "@/src/test/mocks/ai";
import { userFactory, jobInfoFactory } from "@/src/test/factories";
import { POST } from "./route";

function makeReq(form: FormData, url = "http://localhost/api/ai/resumes/analyses") {
  return new Request(url, { method: "POST", body: form });
}

function pdfFile(bytes = 100, type = "application/pdf") {
  return new File([new Uint8Array(bytes)], "cv.pdf", { type });
}

beforeEach(() => {
  dbMock._reset();
  analyzeResumeForJobMock.mockClear();
});

describe("POST resume analyses", () => {
  it("401 when anon", async () => {
    setCurrentUser(null);
    const fd = new FormData();
    fd.set("resumeFile", pdfFile());
    fd.set("jobInfoId", "j1");
    const res = await POST(makeReq(fd));
    expect(res.status).toBe(401);
  });

  it("400 when missing fields", async () => {
    setCurrentUser(userFactory());
    const fd = new FormData();
    const res = await POST(makeReq(fd));
    expect(res.status).toBe(400);
  });

  it("400 when file > 10MB", async () => {
    setCurrentUser(userFactory());
    const fakeFile = {
      size: 11 * 1024 * 1024,
      type: "application/pdf",
      name: "cv.pdf",
    } as unknown as File;
    const fd = new FormData();
    fd.set("jobInfoId", "j1");
    const reqLike = {
      formData: async () => {
        const map = new Map<string, unknown>();
        map.set("resumeFile", fakeFile);
        map.set("jobInfoId", "j1");
        return { get: (k: string) => map.get(k) } as unknown as FormData;
      },
      url: "http://localhost/api/ai/resumes/analyses",
    } as unknown as Request;
    const res = await POST(reqLike);
    expect(res.status).toBe(400);
  });

  it("400 on disallowed mime type", async () => {
    setCurrentUser(userFactory());
    const fd = new FormData();
    fd.set("resumeFile", pdfFile(100, "image/png"));
    fd.set("jobInfoId", "j1");
    const res = await POST(makeReq(fd));
    expect(res.status).toBe(400);
  });

  it("403 when jobInfo not owned", async () => {
    setCurrentUser(userFactory());
    dbMock.query.JobInfoTable.findFirst.mockResolvedValue(undefined);
    const fd = new FormData();
    fd.set("resumeFile", pdfFile());
    fd.set("jobInfoId", "j1");
    const res = await POST(makeReq(fd));
    expect(res.status).toBe(403);
    expect(analyzeResumeForJobMock).not.toHaveBeenCalled();
  });

  it("200 + streams on happy path", async () => {
    const user = userFactory();
    setCurrentUser(user);
    const job = jobInfoFactory({ userId: user.id });
    dbMock.query.JobInfoTable.findFirst.mockResolvedValue(job);
    const fd = new FormData();
    fd.set("resumeFile", pdfFile());
    fd.set("jobInfoId", job.id);
    const res = await POST(makeReq(fd));
    expect(res.status).toBe(200);
    expect(analyzeResumeForJobMock).toHaveBeenCalled();
  });

  it("passes model override from ?model query", async () => {
    const user = userFactory();
    setCurrentUser(user);
    const job = jobInfoFactory({ userId: user.id });
    dbMock.query.JobInfoTable.findFirst.mockResolvedValue(job);
    const fd = new FormData();
    fd.set("resumeFile", pdfFile());
    fd.set("jobInfoId", job.id);
    await POST(
      makeReq(
        fd,
        "http://localhost/api/ai/resumes/analyses?model=gemini-2.0-flash",
      ),
    );
    expect(analyzeResumeForJobMock).toHaveBeenCalledWith(
      expect.objectContaining({ model: "gemini-2.0-flash" }),
    );
  });
});
