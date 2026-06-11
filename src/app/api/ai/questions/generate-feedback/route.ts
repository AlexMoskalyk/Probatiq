import { db } from "@/src/drizzle/db";
import { QuestionTable } from "@/src/drizzle/schema";
import { getQuestionIdTag } from "@/src/features/questions/db-cache";
import { generateAiQuestionFeedback } from "@/src/services/ai/questions";
import { getCurrentUser } from "@/src/services/clerk/lib/get-current-user";
import { eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import z from "zod";

const schema = z.object({
  prompt: z.string().min(1),
  questionId: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json();
  const result = schema.safeParse(body);

  if (!result.success) {
    return new Response("Error generating your feedback", { status: 400 });
  }

  const { prompt: answer, questionId } = result.data;
  const { userId } = await getCurrentUser();

  if (userId == null) {
    return new Response("You are not logged in", { status: 401 });
  }

  const question = await getQuestion(questionId);
  if (question == null || question.jobInfo.userId !== userId) {
    return new Response("You do not have permission to do this", {
      status: 403,
    });
  }

  const res = generateAiQuestionFeedback({
    question: question.text,
    answer,
  });

  return res.toTextStreamResponse();
}

async function getQuestion(id: string) {
  "use cache";
  cacheTag(getQuestionIdTag(id));

  return db.query.QuestionTable.findFirst({
    where: eq(QuestionTable.id, id),
    with: { jobInfo: { columns: { userId: true } } },
  });
}
