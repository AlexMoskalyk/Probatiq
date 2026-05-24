import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { Navbar } from "./_nav-bar";
import { getCurrentUser } from "@/src/services/clerk/lib/get-current-user";

interface Props {
  children: ReactNode;
}

export default async function AppLayout(props: Props) {
  const { children } = props;
  const { userId, user } = await getCurrentUser({ allData: true });

  if (userId == null) return redirect("/");
  if (user == null) return redirect("/onboarding");

  return (
    <>
      <Navbar user={user} />
      {children}
    </>
  );
}
