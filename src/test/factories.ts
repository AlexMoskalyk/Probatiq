import type { ExperienceLevel } from "@/src/drizzle/schema/job-info";
import type { QuestionDifficulty } from "@/src/drizzle/schema/questions";

let seq = 0;
const nextId = (prefix: string) => `${prefix}_${++seq}`;

export type User = {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
};

export type JobInfo = {
  id: string;
  title: string | null;
  name: string;
  experienceLevel: ExperienceLevel;
  description: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Interview = {
  id: string;
  jobInfoId: string;
  duration: string;
  humeChatId: string | null;
  feedback: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Question = {
  id: string;
  jobInfoId: string;
  text: string;
  difficulty: QuestionDifficulty;
  createdAt: Date;
  updatedAt: Date;
};

const now = () => new Date("2026-01-01T00:00:00Z");

export function userFactory(overrides: Partial<User> = {}): User {
  const id = overrides.id ?? nextId("user");
  return {
    id,
    name: "Test User",
    email: `${id}@test.dev`,
    imageUrl: "https://example.com/avatar.png",
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  };
}

export function jobInfoFactory(overrides: Partial<JobInfo> = {}): JobInfo {
  return {
    id: nextId("job"),
    title: "Software Engineer",
    name: "Acme JD",
    experienceLevel: "mid-level",
    description: "Build things.",
    userId: nextId("user"),
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  };
}

export function interviewFactory(
  overrides: Partial<Interview> = {},
): Interview {
  return {
    id: nextId("interview"),
    jobInfoId: nextId("job"),
    duration: "00:10:00",
    humeChatId: null,
    feedback: null,
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  };
}

export function questionFactory(overrides: Partial<Question> = {}): Question {
  return {
    id: nextId("question"),
    jobInfoId: nextId("job"),
    text: "Explain event loop.",
    difficulty: "medium",
    createdAt: now(),
    updatedAt: now(),
    ...overrides,
  };
}

export function resetFactorySeq() {
  seq = 0;
}
