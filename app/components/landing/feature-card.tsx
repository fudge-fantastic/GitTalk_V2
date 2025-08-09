import type { ReactNode } from "react";
import { cn } from "~/lib/utils";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({ icon, title, description, className }: FeatureCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 transition-colors",
        "outline-none",
        className
      )}
      tabIndex={0}
    >
      <div className="flex items-start gap-4">
        <div className="shrink-0 inline-flex items-center justify-center rounded-md text-zinc-600 dark:text-zinc-400 size-10">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold tracking-tight text-base mb-1 text-zinc-900 dark:text-zinc-100">{title}</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-snug">{description}</p>
        </div>
      </div>
    </div>
  );
}
