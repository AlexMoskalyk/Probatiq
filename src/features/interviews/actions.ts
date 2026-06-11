"use server";

import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getJobInfoIdTag } from "../job-infos/db-cache";
import { db } from "@/src/drizzle/db";
import { and, eq } from "drizzle-orm";
import { InterviewTable, JobInfoTable } from "@/src/drizzle/schema";
import {
  insertInterview,
  updateInterview as updateInterviewDb,
  deleteInterview as deleteInterviewDb,
} from "./db";
import { getInterviewIdTag } from "./db-cache";
import { RATE_LIMIT_MESSAGE } from "../../lib/error-toast";
import { env } from "@/src/data/env/server";
import arcjet, { tokenBucket, request } from "@arcjet/next";
import { getCurrentUser } from "@/src/services/clerk/lib/get-current-user";
import { generateAiInterviewFeedback } from "@/src/services/ai/interviews";

const aj = arcjet({
  characteristics: ["userId"],
  key: env.ARCJET_KEY,
  rules: [
    tokenBucket({
      capacity: 12,
      refillRate: 4,
      interval: "1d",
      mode: "LIVE",
    }),
  ],
});

export async function createInterview({
  jobInfoId,
}: {
  jobInfoId: string;
}): Promise<{ error: true; message: string } | { error: false; id: string }> {
  const { userId } = await getCurrentUser();
  if (userId == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  const decision = await aj.protect(await request(), {
    userId,
    requested: 1,
  });

  if (decision.isDenied()) {
    return {
      error: true,
      message: RATE_LIMIT_MESSAGE,
    };
  }

  const jobInfo = await getJobInfo(jobInfoId, userId);
  if (jobInfo == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  const interview = await insertInterview({ jobInfoId, duration: "00:00:00" });

  return { error: false, id: interview.id };
}

export async function updateInterview(
  id: string,
  data: {
    humeChatId?: string;
    duration?: string;
  },
) {
  const { userId } = await getCurrentUser();
  if (userId == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  const interview = await getInterview(id, userId);
  if (interview == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  await updateInterviewDb(id, data);

  return { error: false };
}

export async function generateInterviewFeedback(interviewId: string) {
  const { userId, user } = await getCurrentUser({ allData: true });
  if (userId == null || user == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  const interview = await getInterview(interviewId, userId);
  if (interview == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  if (interview.humeChatId == null) {
    return {
      error: true,
      message: "Interview has not been completed yet",
    };
  }

  const feedback = await generateAiInterviewFeedback({
    humeChatId: interview.humeChatId,
    jobInfo: interview.jobInfo,
    userName: user.name,
  });

  if (feedback == null) {
    return {
      error: true,
      message: "Failed to generate feedback",
    };
  }

  await updateInterviewDb(interviewId, { feedback });

  return { error: false };
}

export async function deleteInterview(id: string) {
  const { userId } = await getCurrentUser();
  if (userId == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  const interview = await getInterview(id, userId);
  if (interview == null) {
    return {
      error: true,
      message: "You don't have permission to do this",
    };
  }

  await deleteInterviewDb(id);

  return { error: false as const };
}

async function getJobInfo(id: string, userId: string) {
  "use cache";
  cacheTag(getJobInfoIdTag(id));

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  });
}

async function getInterview(id: string, userId: string) {
  "use cache";
  cacheTag(getInterviewIdTag(id));

  const interview = await db.query.InterviewTable.findFirst({
    where: eq(InterviewTable.id, id),
    with: {
      jobInfo: {
        columns: {
          id: true,
          userId: true,
          description: true,
          title: true,
          experienceLevel: true,
        },
      },
    },
  });

  if (interview == null) return null;

  cacheTag(getJobInfoIdTag(interview.jobInfo.id));
  if (interview.jobInfo.userId !== userId) return null;

  return interview;
}
