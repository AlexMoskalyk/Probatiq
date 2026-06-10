import { Loader2Icon } from "lucide-react";
import { Suspense } from "react";
import { JobInfoBackLink } from "@/src/features/job-infos/components/job-info-back-link";
import ResumePageClient from "@/src/features/resume-analyses/components/resume-page-client";

type Props = {
  params: Promise<{ jobInfoId: string }>;
};
export default async function ResumePage(props: Props) {
  const { params } = props;
  const { jobInfoId } = await params;

  return (
    <div className="container py-4 space-y-4 h-screen-header flex flex-col items-start">
      <JobInfoBackLink jobInfoId={jobInfoId} />
      <Suspense
        fallback={<Loader2Icon className="animate-spin size-24 m-auto" />}
      >
        <SuspendedComponent jobInfoId={jobInfoId} />
      </Suspense>
    </div>
  );
}

async function SuspendedComponent({ jobInfoId }: { jobInfoId: string }) {
  return <ResumePageClient jobInfoId={jobInfoId} />;
}
