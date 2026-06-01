import { Button } from "./ui/button";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { cn } from "../lib/utils";

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export function BackLink(props: Props) {
  const { href, children, className } = props;
  return (
    <Button
      asChild
      variant="ghost"
      size="sm"
      className={cn("-ml-3", className)}
    >
      <Link
        href={href}
        className="flex gap-2 items-center text-sm text-muted-foreground"
      >
        <ArrowLeftIcon />
        {children}
      </Link>
    </Button>
  );
}
