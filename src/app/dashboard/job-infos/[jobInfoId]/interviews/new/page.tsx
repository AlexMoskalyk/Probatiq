import { and, eq } from "drizzle-orm";
import { Loader2Icon } from "lucide-react";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { fetchAccessToken } from "hume";

import { VoiceShell } from "@/src/features/interviews/components/voice-shell";

import { BackLink } from "@/src/components/back-link";
import { db } from "@/src/drizzle/db";
import { JobInfoTable } from "@/src/drizzle/schema";
import { getJobInfoIdTag } from "@/src/features/job-infos/db-cache";
import { getCurrentUser } from "@/src/services/clerk/lib/get-current-user";
import { env } from "@/src/data/env/server";
import { StartCall } from "@/src/features/interviews/components/start-call";

export default async function NewInterviewPage({
  params,
}: {
  params: Promise<{ jobInfoId: string }>;
}) {
  const { jobInfoId } = await params;
  return (
    <div className="h-screen-header flex flex-col">
      <div className="container py-4">
        <BackLink href={`/dashboard/job-infos/${jobInfoId}/interviews`}>
          All Interviews
        </BackLink>
      </div>
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center">
            <Loader2Icon className="animate-spin size-24" />
          </div>
        }
      >
        <SuspendedComponent jobInfoId={jobInfoId} />
      </Suspense>
    </div>
  );
}

async function SuspendedComponent({ jobInfoId }: { jobInfoId: string }) {
  const { userId, redirectToSignIn, user } = await getCurrentUser({
    allData: true,
  });
  if (userId == null || user == null) return redirectToSignIn();

  const jobInfo = await getJobInfo(jobInfoId, userId);
  if (jobInfo == null) return notFound();

  const accessToken = await fetchAccessToken({
    apiKey: env.HUME_API_KEY,
    secretKey: env.HUME_SECRET_KEY,
  });

  return (
    <VoiceShell>
      <StartCall jobInfo={jobInfo} user={user} accessToken={accessToken} />
    </VoiceShell>
  );
}

async function getJobInfo(id: string, userId: string) {
  "use cache";
  cacheTag(getJobInfoIdTag(id));

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  });
}
