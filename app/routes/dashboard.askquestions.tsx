import { useState } from "react";
import { Textarea } from "~/components/ui/textarea";
import { SectionHeading } from "~/components/landing/section-heading";
import { FeatureCard } from "~/components/landing/feature-card";
import { Loader2, Sparkles } from "lucide-react";

export default function AskQuestions() {
    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(false);
    const [answer, setAnswer] = useState<string | null>(null);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!question.trim()) return;
        setLoading(true);
        setAnswer(null);
        // Placeholder for future action/ fetch to backend
        setTimeout(() => {
            setAnswer("(Demo) This is where an AI answer about your repository will appear.");
            setLoading(false);
        }, 900);
    }

    return (
        <div className="max-w-5xl mx-auto py-10 px-4 space-y-10">
            <header className="text-center space-y-2">
                <SectionHeading>Ask your codebase anything</SectionHeading>
                <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto tracking-tight">
                    Query repositories you have added. GitTalk will ground responses in real commits, code and docs.
                </p>
            </header>

            <div className="grid md:grid-cols-3 gap-6 items-start">
                <form onSubmit={onSubmit} className="md:col-span-2 flex flex-col gap-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 shadow-sm p-5">
                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Your question</span>
                        <Textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Eg. Where is authentication middleware defined?"
                            className="min-h-[140px] resize-y text-sm"
                        />
                    </label>
                    <div className="flex items-center gap-3 justify-between">
                        <p className="text-xs text-zinc-500 dark:text-zinc-500">Answers are contextual—include file / feature hints when possible.</p>
                        <button
                            disabled={loading}
                            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-2 text-sm font-semibold shadow-sm"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Ask
                        </button>
                    </div>
                    {answer && (
                        <div className="mt-2 text-sm rounded-md bg-zinc-50 dark:bg-zinc-800/60 p-3 border border-zinc-200 dark:border-zinc-700">
                            <p className="font-medium mb-1 flex items-center gap-2"><Sparkles className="w-4 h-4 text-indigo-500" /> Draft Answer</p>
                            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">{answer}</p>
                        </div>
                    )}
                </form>

                <div className="space-y-4">
                    <FeatureCard
                        icon={<span className="text-xs font-bold bg-indigo-600 text-white rounded-md px-2 py-1">TIP</span>}
                        title="Better questions"
                        description="Reference filenames, functions, or commits (hash prefixes) for higher precision responses."
                    />
                    <FeatureCard
                        icon={<span className="text-xs font-bold bg-emerald-600 text-white rounded-md px-2 py-1">NEW</span>}
                        title="Multi-model"
                        description="We auto-route smaller questions to fast local models and complex reasoning to larger ones."
                    />
                    <FeatureCard
                        icon={<span className="text-xs font-bold bg-rose-600 text-white rounded-md px-2 py-1">PRO</span>}
                        title="Follow-ups"
                        description="Soon you can refine answers conversationally without re-loading context."
                    />
                </div>
            </div>
        </div>
    );
}