import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";

const snippets = [
  `// Ask anything about your repo\nawait chat.ask("Where is user auth handled?")`,
  `// Semantic search across code & docs\nconst results = await vectorStore.search("stream handler")`,
  `// Multi model support (Gemini / Ollama / OpenAI)\nconst answer = await models.gemini.respond(query)`,
  `// Cached embeddings reduce costs\nawait embedder.embedBatch(files)`,
];

export function CodeWindow() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % snippets.length), 3400);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className={cn(
        "relative w-full max-w-xl rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/60 dark:bg-zinc-900/40 backdrop-blur-md overflow-hidden shadow-lg",
        "ring-1 ring-black/[0.04] dark:ring-white/5",
        "sm:max-w-xl max-w-full"
      )}
    >
      <div className="flex items-center gap-1 px-2 sm:px-3 py-2 bg-gradient-to-r from-zinc-200/70 to-zinc-100/30 dark:from-zinc-800/50 dark:to-zinc-900/20 text-[9px] sm:text-[10px] uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-400 font-medium">
        <span className="size-2 rounded-full bg-red-400" />
        <span className="size-2 rounded-full bg-amber-400" />
        <span className="size-2 rounded-full bg-emerald-400" />
        <span className="ml-2 sm:ml-3">GitTalk Session</span>
      </div>
      <pre className="relative m-0 p-2 sm:p-4 font-mono text-[11px] sm:text-[12.5px] leading-relaxed text-zinc-700 dark:text-zinc-200 min-h-[120px] sm:min-h-[180px] break-words whitespace-pre-wrap">
        <code key={index} className="block animate-fade-in">
          {snippets[index]}
        </code>
        <span className="absolute bottom-2 sm:bottom-3 left-2 sm:left-4 h-3 sm:h-4 w-1.5 sm:w-2 bg-primary rounded-sm animate-caret" />
      </pre>
    </div>
  );
}
