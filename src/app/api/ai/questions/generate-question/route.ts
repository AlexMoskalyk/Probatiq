import { db } from "@/src/drizzle/db";
import {
  JobInfoTable,
  questionDifficulties,
  QuestionTable,
} from "@/src/drizzle/schema";
import { getJobInfoIdTag } from "@/src/features/job-infos/db-cache";
import { getQuestionJobInfoTag } from "@/src/features/questions/db-cache";
import { generateAiQuestion } from "@/src/services/ai/questions";
import { getCurrentUser } from "@/src/services/clerk/lib/get-current-user";
import { and, asc, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import z from "zod";

const schema = z.object({
  prompt: z.enum(questionDifficulties),
  jobInfoId: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    return new Response("Error generating your question", { status: 400 });
  }

  const { prompt: difficulty, jobInfoId } = result.data;
  const { userId } = await getCurrentUser();

  if (userId == null) {
    return new Response("You are not logged in", { status: 401 });
  }

  const jobInfo = await getJobInfo(jobInfoId, userId);
  if (jobInfo == null) {
    return new Response("You do not have permission to do this", {
      status: 403,
    });
  }

  const previousQuestions = await getQuestions(jobInfoId);

  const res = generateAiQuestion({
    previousQuestions,
    jobInfo,
    difficulty,
    onFinish: () => {},
  });

  return res.toTextStreamResponse();
}

async function getQuestions(jobInfoId: string) {
  "use cache";
  cacheTag(getQuestionJobInfoTag(jobInfoId));

  return db.query.QuestionTable.findMany({
    where: eq(QuestionTable.jobInfoId, jobInfoId),
    orderBy: asc(QuestionTable.createdAt),
  });
}

async function getJobInfo(id: string, userId: string) {
  "use cache";
  cacheTag(getJobInfoIdTag(id));

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  });
}
