import { Suspense } from "react";
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Suspense fallback={null}>
        <SignUp />
      </Suspense>
    </div>
  );
}
