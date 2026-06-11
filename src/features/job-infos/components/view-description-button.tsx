"use client";

import { MouseEvent, useState } from "react";
import { EyeIcon } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { JobInfoTable } from "@/src/drizzle/schema";
import { JobInfoForm } from "./job-info-form";

type Props = {
  jobInfo: Pick<
    typeof JobInfoTable.$inferSelect,
    "id" | "name" | "title" | "description" | "experienceLevel"
  >;
  iconOnly?: boolean;
};

export function ViewDescriptionButton({ jobInfo, iconOnly = false }: Props) {
  const [open, setOpen] = useState(false);

  function onTriggerClick(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  }

  return (
    <>
      {iconOnly ? (
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={onTriggerClick}
          aria-label={`View ${jobInfo.name}`}
          className="cursor-pointer"
        >
          <EyeIcon className="size-4" />
        </Button>
      ) : (
        <Button type="button" onClick={onTriggerClick} className="cursor-pointer">
          View Description
        </Button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          aria-describedby={undefined}
          className="md:max-w-3xl lg:max-w-4xl max-h-[calc(100%-2rem)] overflow-y-auto flex flex-col"
        >
          <DialogTitle>Job Description</DialogTitle>
          <JobInfoForm jobInfo={jobInfo} readOnly />
        </DialogContent>
      </Dialog>
    </>
  );
}
