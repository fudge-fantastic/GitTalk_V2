import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

export function SectionHeading({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2 className={cn("text-2xl md:text-3xl font-semibold tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-900 dark:from-zinc-100 dark:via-zinc-300 dark:to-zinc-100 bg-clip-text text-transparent", className)}>
      {children}
    </h2>
  );
}
