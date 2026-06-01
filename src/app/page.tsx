import { ThemeToggle } from "@/src/components/theme-toggle";
import { SignInButton, UserButton } from "@clerk/nextjs";

export default function HomePage() {
  return (
    <div className="space-y-4 p4">
      <div className="flex items-center gap-4">
        <SignInButton />
        <UserButton />
        <ThemeToggle />
      </div>
    </div>
  );
}
