import { ReactNode } from "react";
import { ClerkProvider as OriginalClerkProvider } from "@clerk/nextjs";

interface Props {
  children: ReactNode;
}

export function ClerkProvider(props: Props) {
  const { children } = props;
  return <OriginalClerkProvider>{children}</OriginalClerkProvider>;
}
