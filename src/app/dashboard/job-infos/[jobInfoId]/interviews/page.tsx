import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { db } from "@/src/drizzle/db";
import { InterviewTable } from "@/src/drizzle/schema";
import { getInterviewJobInfoTag } from "@/src/features/interviews/db-cache";
import { JobInfoBackLink } from "@/src/features/job-infos/components/job-info-back-link";
import { getJobInfoIdTag } from "@/src/features/job-infos/db-cache";
import { formatDateTime } from "@/src/lib/formatters";
import { getCurrentUser } from "@/src/services/clerk/lib/get-current-user";
import { DeleteInterviewButton } from "@/src/features/interviews/components/delete-interview-button";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Link from "next/link";
import { Suspense } from "react";

type Props = {
  params: Promise<{ jobInfoId: string }>;
};

export default async function InterviewsPage(props: Props) {
  const { params } = props;
  const { jobInfoId } = await params;

  return (
    <div className="container py-4 gap-4 h-screen-header flex flex-col items-start">
      <JobInfoBackLink jobInfoId={jobInfoId} />

      <Suspense
        fallback={<Loader2Icon className="size-24 animate-spin m-auto" />}
      >
        <SuspendedPage jobInfoId={jobInfoId} />
      </Suspense>
    </div>
  );
}

async function SuspendedPage({ jobInfoId }: { jobInfoId: string }) {
  const { userId, redirectToSignIn } = await getCurrentUser();
  if (userId == null) return redirectToSignIn();

  const interviews = await getInterviews(jobInfoId, userId);
  if (interviews.length === 0) {
    return <NoInterviews jobInfoId={jobInfoId} />;
  }
  return (
    <div className="space-y-6 w-full">
      <div className="flex gap-2 justify-between">
        <h1 className="text-3xl md:text-4xl lg:text-5xl">Interviews</h1>
        <Button asChild>
          <Link href={`/dashboard/job-infos/${jobInfoId}/interviews/new`}>
            <PlusIcon />
            New Interview
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 has-hover:*:not-hover:opacity-70">
        <Link
          className="transition-opacity"
          href={`/dashboard/job-infos/${jobInfoId}/interviews/new`}
        >
          <Card className="h-full flex items-center justify-center border-dashed border-3 bg-transparent hover:border-primary/50 transition-colors shadow-none">
            <div className="text-lg flex items-center gap-2">
              <PlusIcon className="size-6" />
              New Interview
            </div>
          </Card>
        </Link>
        {interviews.map((interview) => (
          <Link
            className="hover:scale-[1.02] transition-[transform_opacity]"
            href={`/dashboard/job-infos/${jobInfoId}/interviews/${interview.id}`}
            key={interview.id}
          >
            <Card className="h-full">
              <div className="flex items-center justify-between h-full">
                <CardHeader className="gap-1 flex-grow">
                  <CardTitle className="text-lg">
                    {formatDateTime(interview.createdAt)}
                  </CardTitle>
                  <CardDescription>{interview.duration}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-2">
                  <DeleteInterviewButton
                    id={interview.id}
                    date={formatDateTime(interview.createdAt)}
                  />
                </CardContent>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function NoInterviews({ jobInfoId }: { jobInfoId: string }) {
  return (
    <div className="space-y-6 w-full">
      <h1 className="text-3xl md:text-4xl lg:text-5xl">Interviews</h1>
      <Card className="border-dashed text-center">
        <CardHeader>
          <CardTitle className="text-xl">No interviews yet</CardTitle>
          <CardDescription>Practice with an AI interviewer.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <Button asChild>
            <Link href={`/dashboard/job-infos/${jobInfoId}/interviews/new`}>
              <PlusIcon />
              Start your first interview
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

async function getInterviews(jobInfoId: string, userId: string) {
  "use cache";
  cacheTag(getInterviewJobInfoTag(jobInfoId));
  cacheTag(getJobInfoIdTag(jobInfoId));

  const data = await db.query.InterviewTable.findMany({
    where: and(
      eq(InterviewTable.jobInfoId, jobInfoId),
      isNotNull(InterviewTable.humeChatId),
    ),
    with: { jobInfo: { columns: { userId: true } } },
    orderBy: desc(InterviewTable.updatedAt),
  });

  return data.filter((interview) => interview.jobInfo.userId === userId);
}
