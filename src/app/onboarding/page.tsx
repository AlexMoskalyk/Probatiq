import { Suspense } from "react";
import { redirect } from "next/navigation";
import { OnboardingClient } from "./_client";
import { getCurrentUser } from "@/src/services/clerk/lib/get-current-user";

export default function OnboardingPage() {
  return (
    <div className="container flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-4xl">Creating your account...</h1>
      <Suspense fallback={null}>
        <OnboardingGate />
      </Suspense>
    </div>
  );
}

async function OnboardingGate() {
  const { userId, user } = await getCurrentUser({ allData: true });

  if (userId == null) return redirect("/");
  if (user != null) return redirect("/dashboard");

  return <OnboardingClient userId={userId} />;
}
