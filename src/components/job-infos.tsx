import { getJobInfos } from "@/src/features/job-infos/actions";
import { getCurrentUser } from "@/src/services/clerk/lib/get-current-user";
import NoJobInfos from "./no-job-infos";
import { Button } from "@/src/components/ui/button";
import Link from "next/link";
import { ArrowRightIcon, PlusIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { formatExperienceLevel } from "@/src/features/job-infos/lib/format-experience-level";
import { Badge } from "@/src/components/ui/badge";
import { DeleteJobInfoButton } from "@/src/features/job-infos/components/delete-job-info-button";

export async function JobInfos() {
  const { userId, redirectToSignIn } = await getCurrentUser();
  if (userId == null) return redirectToSignIn();

  const jobInfos = await getJobInfos(userId);

  if (jobInfos.length === 0) {
    return <NoJobInfos />;
  }

  return (
    <div className="container my-4">
      <div className="flex gap-2 justify-between mb-6">
        <h1 className="text-3xl md:text-4xl lg:text-5xl">
          Select a job description
        </h1>
        <Button asChild>
          <Link href="/dashboard/job-infos/new">
            <PlusIcon />
            Create Job Description
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 has-hover:*:not-hover:opacity-70">
        {jobInfos.map((jobInfo) => (
          <Link
            className="hover:scale-[1.02] transition-[transform_opacity]"
            href={`/dashboard/job-infos/${jobInfo.id}`}
            key={jobInfo.id}
          >
            <Card className="h-full">
              <div className="space-y-4 h-full">
                <CardHeader className="flex items-center justify-between gap-2">
                  <CardTitle className="text-lg">{jobInfo.name}</CardTitle>
                  <DeleteJobInfoButton id={jobInfo.id} name={jobInfo.name} />
                </CardHeader>

                <CardContent className="text-muted-foreground line-clamp-3 flex justify-between items-center gap-4">
                  {jobInfo.description}
                  <ArrowRightIcon className="size-6 text-foreground" />
                </CardContent>

                <CardFooter className="flex gap-2">
                  <Badge variant="outline">
                    {formatExperienceLevel(jobInfo.experienceLevel)}
                  </Badge>
                  {jobInfo.title && (
                    <Badge variant="outline">{jobInfo.title}</Badge>
                  )}
                </CardFooter>
              </div>
            </Card>
          </Link>
        ))}
        <Link className="transition-opacity" href="/dashboard/job-infos/new">
          <Card className="h-full flex items-center justify-center border-dashed border-3 bg-transparent hover:border-primary/50 transition-colors shadow-none">
            <div className="text-lg flex items-center gap-2">
              <PlusIcon className="size-6" />
              New Job Description
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
