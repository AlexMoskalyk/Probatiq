import { BackLink } from "@/src/components/back-link";
import { Skeleton } from "@/src/components/skeleton";
import { SuspendedItem } from "@/src/components/suspended-item";
import { Badge } from "@/src/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { getJobInfo } from "@/src/features/job-infos/actions";
import { ViewDescriptionButton } from "@/src/features/job-infos/components/view-description-button";

import { formatExperienceLevel } from "@/src/features/job-infos/lib/format-experience-level";

import { getCurrentUser } from "@/src/services/clerk/lib/get-current-user";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

const options = [
  {
    label: "Answer Technical Questions",
    description:
      "Challenge yourself with practice questions tailored to your job description.",
    href: "questions",
  },
  {
    label: "Practice Interviewing",
    description: "Simulate a real interview with AI interviewer.",
    href: "interviews",
  },
  {
    label: "Refine Your Resume",
    description:
      "Get expert feedback on your resume and improve your chances of landing an interview.",
    href: "resume",
  },
  {
    label: "Update Job Description",
    description: "Adjust job details for small tweaks.",
    href: "edit",
  },
];

type Props = {
  params: Promise<{ jobInfoId: string }>;
};

export default async function JobInfoPage(props: Props) {
  const { params } = props;
  const { jobInfoId } = await params;

  const jobInfo = getCurrentUser().then(
    async ({ userId, redirectToSignIn }) => {
      if (userId == null) return redirectToSignIn();

      const jobInfo = await getJobInfo(jobInfoId, userId);
      if (jobInfo == null) return notFound();

      return jobInfo;
    },
  );

  return (
    <div className="container my-4 space-y-4">
      <BackLink href="/dashboard">Dashboard</BackLink>

      <div className="space-y-6">
        <header className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl">
                <SuspendedItem
                  item={jobInfo}
                  fallback={<Skeleton className="w-48" />}
                  result={(j) => j.name}
                />
              </h1>
              <div className="flex gap-2">
                <SuspendedItem
                  item={jobInfo}
                  fallback={<Skeleton className="w-12" />}
                  result={(j) => (
                    <Badge variant="secondary">
                      {formatExperienceLevel(j.experienceLevel)}
                    </Badge>
                  )}
                />
                <SuspendedItem
                  item={jobInfo}
                  fallback={null}
                  result={(j) => {
                    return (
                      j.title && <Badge variant="secondary">{j.title}</Badge>
                    );
                  }}
                />
              </div>
            </div>
            <SuspendedItem
              item={jobInfo}
              fallback={null}
              result={(j) => <ViewDescriptionButton jobInfo={j} />}
            />
          </div>
          <p className="text-muted-foreground line-clamp-3">
            <SuspendedItem
              item={jobInfo}
              fallback={<Skeleton className="w-96" />}
              result={(j) => j.description}
            />
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 has-hover:*:not-hover:opacity-70">
          {options.map((option) => (
            <Link
              className="hover:scale-[1.02] transition-[transform_opacity]"
              href={`/dashboard/job-infos/${jobInfoId}/${option.href}`}
              key={option.href}
            >
              <Card className="h-full flex items-start justify-between flex-row">
                <CardHeader className="flex-grow">
                  <CardTitle>{option.label}</CardTitle>
                  <CardDescription>{option.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ArrowRightIcon className="size-6" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
