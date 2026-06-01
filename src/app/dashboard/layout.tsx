import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { Navbar } from "../../components/nav-bar";
import { getCurrentUser } from "@/src/services/clerk/lib/get-current-user";

interface Props {
  children: ReactNode;
}

export default function AppLayout(props: Props) {
  const { children } = props;
  return (
    <Suspense fallback={null}>
      <AuthShell>{children}</AuthShell>
    </Suspense>
  );
}

async function AuthShell({ children }: { children: ReactNode }) {
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
