import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-surface px-4 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-muted">
        <Compass className="h-6 w-6 text-ink-subtle" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-ink">
        Nothing to see here
      </h1>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">
        The page you&apos;re looking for doesn&apos;t exist, or you don&apos;t
        have access to it.
      </p>
      <div className="mt-5">
        <Link href="/dashboard">
          <Button>Back to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}