import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LandingPage } from "@/src/components/landing/landing-page";
import { getCurrentUser } from "@/src/services/clerk/lib/get-current-user";

export default function HomePage() {
  return (
    <Suspense fallback={<LandingPage />}>
      <HomeGate />
    </Suspense>
  );
}

async function HomeGate() {
  const { userId } = await getCurrentUser();
  if (userId != null) redirect("/dashboard");
  return <LandingPage />;
}
