import { ComponentProps } from "react";
import Markdown from "react-markdown";
import { cn } from "../lib/utils";

interface Props extends ComponentProps<typeof Markdown> {
  className?: string;
}

export function MarkdownRenderer(props: Props) {
  const { className } = props;
  return (
    <div
      className={cn(
        "max-w-none prose prose-neutral dark:prose-invert font-sans",
        className,
      )}
    >
      <Markdown {...props} />
    </div>
  );
}
