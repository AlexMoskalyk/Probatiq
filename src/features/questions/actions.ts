"use server";

import { db } from "@/src/drizzle/db";
import { JobInfoTable, QuestionDifficulty } from "@/src/drizzle/schema";
import { getJobInfoIdTag } from "@/src/features/job-infos/db-cache";
import { getCurrentUser } from "@/src/services/clerk/lib/get-current-user";
import { and, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { insertQuestion } from "./db";

export async function createQuestion({
  text,
  jobInfoId,
  difficulty,
}: {
  text: string;
  jobInfoId: string;
  difficulty: QuestionDifficulty;
}) {
  const { userId } = await getCurrentUser();
  if (userId == null) {
    return { error: true as const, message: "Unauthorized" };
  }

  const jobInfo = await getJobInfo(jobInfoId, userId);
  if (jobInfo == null) {
    return { error: true as const, message: "You don't have permission to do this" };
  }

  const question = await insertQuestion({ text, jobInfoId, difficulty });

  return { error: false as const, id: question.id };
}

async function getJobInfo(id: string, userId: string) {
  "use cache";
  cacheTag(getJobInfoIdTag(id));

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  });
}
