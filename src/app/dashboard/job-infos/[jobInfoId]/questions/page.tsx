import { db } from "@/src/drizzle/db";
import { JobInfoTable } from "@/src/drizzle/schema";
import { and, eq } from "drizzle-orm";
import { Loader2Icon } from "lucide-react";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getJobInfoIdTag } from "@/src/features/job-infos/db-cache";
import { getCurrentUser } from "@/src/services/clerk/lib/get-current-user";
import { NewQuestionClientPage } from "@/src/features/questions/components/new-question-client-page";

type Props = {
  params: Promise<{ jobInfoId: string }>;
};
export default async function QuestionsPage(props: Props) {
  const { params } = props;
  const { jobInfoId } = await params;

  return (
    <Suspense
      fallback={
        <div className="h-screen-header flex items-center justify-center">
          <Loader2Icon className="animate-spin size-24" />
        </div>
      }
    >
      <SuspendedComponent jobInfoId={jobInfoId} />
    </Suspense>
  );
}

async function SuspendedComponent({ jobInfoId }: { jobInfoId: string }) {
  const { userId, redirectToSignIn } = await getCurrentUser();
  if (userId == null) return redirectToSignIn();

  const jobInfo = await getJobInfo(jobInfoId, userId);
  if (jobInfo == null) return notFound();

  return <NewQuestionClientPage jobInfo={jobInfo} />;
}

async function getJobInfo(id: string, userId: string) {
  "use cache";
  cacheTag(getJobInfoIdTag(id));

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  });
}
