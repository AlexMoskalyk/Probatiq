import Link from "next/link";
import {
  BookOpenIcon,
  BrainCogIcon,
  BriefcaseIcon,
  FileSlidersIcon,
  SpeechIcon,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { ThemeToggle } from "@/src/components/theme-toggle";

const features: Array<{
  title: string;
  description: string;
  Icon: LucideIcon;
}> = [
  {
    title: "Job profiles",
    description:
      "Organize interview prep by role. Save the job description and reuse it everywhere.",
    Icon: BriefcaseIcon,
  },
  {
    title: "AI-generated questions",
    description:
      "Tailored question sets per role with instant written feedback on each answer.",
    Icon: BookOpenIcon,
  },
  {
    title: "Live voice mock interviews",
    description:
      "Practice out loud with a real-time voice agent that listens, replies, and follows up.",
    Icon: SpeechIcon,
  },
  {
    title: "Resume analysis",
    description:
      "Match your resume against a job description. Get a gap report and concrete improvements.",
    Icon: FileSlidersIcon,
  },
];

export function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="h-header border-b">
        <div className="container flex h-full items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <BrainCogIcon className="size-8 text-primary" />
            <span className="text-xl font-bold">Probatiq</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm">
              <Link href="/sign-in">Sign in</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container py-24 sm:py-32">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Practice interviews. Get hired.
            </h1>
            <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
              Probatiq turns any job description into a focused prep plan:
              tailored questions, live voice mock interviews, and resume gap
              analysis — all in one place.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/sign-in">Get started</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/sign-in">Sign in</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="container pb-24 sm:pb-32">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ title, description, Icon }) => (
              <div
                key={title}
                className="rounded-xl border bg-card p-6 text-card-foreground"
              >
                <Icon className="size-6 text-primary" />
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container flex h-16 items-center justify-between text-sm text-muted-foreground">
          <span>© Probatiq</span>
          <span>Built for interview prep.</span>
        </div>
      </footer>
    </div>
  );
}
