import { Card, CardContent } from "@/src/components/ui/card";

import { getJobInfo } from "@/src/features/job-infos/actions";
import { JobInfoBackLink } from "@/src/features/job-infos/components/job-info-back-link";
import { JobInfoForm } from "@/src/features/job-infos/components/job-info-form";
import { getCurrentUser } from "@/src/services/clerk/lib/get-current-user";
import { Loader2 } from "lucide-react";

import { notFound } from "next/navigation";
import { Suspense } from "react";

type JobInfoNewPageProps = {
  params: Promise<{ jobInfoId: string }>;
};

export default async function JobInfoNewPage(props: JobInfoNewPageProps) {
  const { params } = props;
  const { jobInfoId } = await params;

  return (
    <div className="container my-4 space-y-4">
      <JobInfoBackLink jobInfoId={jobInfoId} />

      <h1 className="text-3xl md:text-4xl">Edit Job Description</h1>

      <Card>
        <CardContent>
          <Suspense
            fallback={<Loader2 className="size-24 animate-spin mx-auto" />}
          >
            <SuspendedForm jobInfoId={jobInfoId} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

type SuspendedFormProps = {
  jobInfoId: string;
};

async function SuspendedForm(props: SuspendedFormProps) {
  const { jobInfoId } = props;
  const { userId, redirectToSignIn } = await getCurrentUser();
  if (userId == null) return redirectToSignIn();

  const jobInfo = await getJobInfo(jobInfoId, userId);
  if (jobInfo == null) return notFound();

  return <JobInfoForm jobInfo={jobInfo} />;
}
