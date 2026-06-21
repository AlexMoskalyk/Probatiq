import "@/src/test/mocks/db";
import "@/src/test/mocks/clerk";
import "@/src/test/mocks/next";
import { describe, it, expect, beforeEach } from "vitest";
import { dbMock } from "@/src/test/mocks/db";
import { setCurrentUser } from "@/src/test/mocks/clerk";
import { RedirectError } from "@/src/test/mocks/next";
import { userFactory, jobInfoFactory } from "@/src/test/factories";
import {
  createJobInfo,
  updateJobInfo,
  deleteJobInfo,
} from "./actions";

const validInput = {
  name: "Acme",
  title: "Senior Engineer",
  experienceLevel: "senior" as const,
  description: "Build things.",
};

beforeEach(() => dbMock._reset());

describe("createJobInfo", () => {
  it("returns error when unauthenticated", async () => {
    setCurrentUser(null);
    const r = await createJobInfo(validInput);
    expect(r).toEqual({ error: true, message: expect.any(String) });
  });

  it("returns error on invalid input", async () => {
    setCurrentUser(userFactory());
    const r = await createJobInfo({ ...validInput, name: "" } as never);
    expect(r).toMatchObject({ error: true, message: "Invalid job data" });
  });

  it("inserts and redirects to new job info", async () => {
    const user = userFactory();
    setCurrentUser(user);
    dbMock._setInsertReturn([{ id: "new-job", userId: user.id }]);

    await expect(createJobInfo(validInput)).rejects.toBeInstanceOf(
      RedirectError,
    );
    expect(dbMock.insert).toHaveBeenCalled();
  });
});

describe("updateJobInfo", () => {
  it("returns error when unauthenticated", async () => {
    setCurrentUser(null);
    const r = await updateJobInfo("job-1", validInput);
    expect(r).toMatchObject({ error: true });
  });

  it("returns error when row owned by different user", async () => {
    const user = userFactory();
    setCurrentUser(user);
    dbMock.query.JobInfoTable.findFirst.mockResolvedValue(undefined);

    const r = await updateJobInfo("job-1", validInput);
    expect(r).toMatchObject({ error: true });
    expect(dbMock.update).not.toHaveBeenCalled();
  });

  it("updates own row and redirects", async () => {
    const user = userFactory();
    setCurrentUser(user);
    const job = jobInfoFactory({ userId: user.id });
    dbMock.query.JobInfoTable.findFirst.mockResolvedValue(job);
    dbMock._setUpdateReturn([{ id: job.id, userId: user.id }]);

    await expect(updateJobInfo(job.id, validInput)).rejects.toBeInstanceOf(
      RedirectError,
    );
    expect(dbMock.update).toHaveBeenCalled();
  });
});

describe("deleteJobInfo", () => {
  it("returns error when unauthenticated", async () => {
    setCurrentUser(null);
    const r = await deleteJobInfo("job-1");
    expect(r).toMatchObject({ error: true });
  });

  it("returns error when not owner (IDOR guard)", async () => {
    setCurrentUser(userFactory());
    dbMock.query.JobInfoTable.findFirst.mockResolvedValue(undefined);

    const r = await deleteJobInfo("job-1");
    expect(r).toMatchObject({ error: true });
    expect(dbMock.delete).not.toHaveBeenCalled();
  });

  it("deletes own row", async () => {
    const user = userFactory();
    setCurrentUser(user);
    const job = jobInfoFactory({ userId: user.id });
    dbMock.query.JobInfoTable.findFirst.mockResolvedValue(job);
    dbMock._setDeleteReturn([{ id: job.id, userId: user.id }]);

    const r = await deleteJobInfo(job.id);
    expect(r).toEqual({ error: false });
    expect(dbMock.delete).toHaveBeenCalled();
  });
});
