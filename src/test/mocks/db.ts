import { vi } from "vitest";

type AnyFn = (...args: unknown[]) => unknown;

function chainableReturning(rows: unknown[] = []) {
  const obj: Record<string, AnyFn> & {
    then?: (resolve: (value: unknown[]) => unknown) => unknown;
  } = {} as never;
  obj.values = vi.fn(() => obj);
  obj.set = vi.fn(() => obj);
  obj.where = vi.fn(() => obj);
  obj.from = vi.fn(() => obj);
  obj.onConflictDoUpdate = vi.fn(() => obj);
  obj.onConflictDoNothing = vi.fn(() => obj);
  obj.returning = vi.fn(() => Promise.resolve(rows));
  obj.then = (resolve) => resolve(rows);
  return obj;
}

export function makeQueryTable() {
  return {
    findFirst: vi.fn<() => Promise<unknown>>().mockResolvedValue(undefined),
    findMany: vi.fn<() => Promise<unknown[]>>().mockResolvedValue([]),
  };
}

export const dbMock = {
  query: {
    JobInfoTable: makeQueryTable(),
    InterviewTable: makeQueryTable(),
    QuestionTable: makeQueryTable(),
    UserTable: makeQueryTable(),
  },
  insert: vi.fn(() => chainableReturning([])),
  update: vi.fn(() => chainableReturning([])),
  delete: vi.fn(() => chainableReturning([])),
  select: vi.fn(() => chainableReturning([])),
  transaction: vi.fn(async (cb: (tx: unknown) => unknown) => cb(dbMock)),
  _setInsertReturn(rows: unknown[]) {
    this.insert.mockImplementation(() => chainableReturning(rows));
  },
  _setUpdateReturn(rows: unknown[]) {
    this.update.mockImplementation(() => chainableReturning(rows));
  },
  _setDeleteReturn(rows: unknown[]) {
    this.delete.mockImplementation(() => chainableReturning(rows));
  },
  _reset() {
    this.query.JobInfoTable.findFirst.mockReset().mockResolvedValue(undefined);
    this.query.JobInfoTable.findMany.mockReset().mockResolvedValue([]);
    this.query.InterviewTable.findFirst
      .mockReset()
      .mockResolvedValue(undefined);
    this.query.InterviewTable.findMany.mockReset().mockResolvedValue([]);
    this.query.QuestionTable.findFirst.mockReset().mockResolvedValue(undefined);
    this.query.QuestionTable.findMany.mockReset().mockResolvedValue([]);
    this.query.UserTable.findFirst.mockReset().mockResolvedValue(undefined);
    this.query.UserTable.findMany.mockReset().mockResolvedValue([]);
    this.insert.mockReset().mockImplementation(() => chainableReturning([]));
    this.update.mockReset().mockImplementation(() => chainableReturning([]));
    this.delete.mockReset().mockImplementation(() => chainableReturning([]));
    this.select.mockReset().mockImplementation(() => chainableReturning([]));
  },
};

vi.mock("@/src/drizzle/db", () => ({
  db: dbMock,
}));

vi.mock("next/dist/server/use-cache/cache-tag", () => ({
  cacheTag: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
}));
