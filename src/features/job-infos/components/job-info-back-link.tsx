import { BackLink } from "@/src/components/back-link";
import { cn } from "@/src/lib/utils";
import { Suspense } from "react";
import { getJobInfoWithoutUserCheck } from "../actions";

type Props = {
  jobInfoId: string;
  className?: string;
};

export function JobInfoBackLink(props: Props) {
  const { jobInfoId, className } = props;
  return (
    <BackLink
      href={`/dashboard/job-infos/${jobInfoId}`}
      className={cn("mb-4", className)}
    >
      <Suspense fallback="Job Description">
        <JobName jobInfoId={jobInfoId} />
      </Suspense>
    </BackLink>
  );
}

async function JobName({ jobInfoId }: { jobInfoId: string }) {
  const jobInfo = await getJobInfoWithoutUserCheck(jobInfoId);
  return jobInfo?.name ?? "Job Description";
}
