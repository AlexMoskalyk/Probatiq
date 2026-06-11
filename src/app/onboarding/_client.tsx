"use client";

import { getUser } from "@/src/features/users/actions";
import { Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface Props {
  userId: string;
}

export function OnboardingClient(props: Props) {
  const { userId } = props;
  const router = useRouter();

  useEffect(() => {
    const intervalId = setInterval(async () => {
      const user = await getUser(userId);
      if (user == null) return;

      router.replace("/dashboard");
      clearInterval(intervalId);
    }, 250);

    return () => {
      clearInterval(intervalId);
    };
  }, [userId, router]);

  return <Loader2Icon className="animate-spin size-24" />;
}
