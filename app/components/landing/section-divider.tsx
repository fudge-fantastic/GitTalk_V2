interface SectionDividerProps {
  label?: string;
}

export function SectionDivider({ label }: SectionDividerProps) {
  return (
    <div className="relative my-14">
      <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-300/70 to-transparent dark:via-zinc-700/60" />
      </div>
      {label && (
        <div className="relative flex justify-center">
          <span className="group inline-flex items-center gap-1 rounded-full border border-zinc-200/70 dark:border-zinc-700/70 bg-white/80 dark:bg-zinc-900/70 backdrop-blur px-4 py-1 text-[13px] font-medium tracking-wide text-zinc-600 dark:text-zinc-300 shadow-sm">
            {label}
            <span className="size-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 animate-pulse" />
          </span>
        </div>
      )}
    </div>
  );
}
