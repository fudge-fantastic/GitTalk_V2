import { SectionHeading } from "~/components/landing/section-heading";
import { FeatureCard } from "~/components/landing/feature-card";
import { CalendarDays, Clock, Users, Video } from "lucide-react";

export default function Meetings() {
    return (
        <div className="max-w-5xl mx-auto py-12 px-4 space-y-10">
            <header className="space-y-3 text-center">
                <SectionHeading>Meetings & Standups</SectionHeading>
                <p className="text-sm md:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                    Centralize sync notes, decisions, and action items. Automated summaries from commits are coming soon.
                </p>
            </header>

            <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-5">
                <FeatureCard icon={<CalendarDays className="w-5 h-5" />} title="Schedule" description="Link calendar events and keep context in one place." />
                <FeatureCard icon={<Users className="w-5 h-5" />} title="Attendance" description="Track who joined and auto-log highlights." />
                <FeatureCard icon={<Clock className="w-5 h-5" />} title="Standups" description="Lightweight daily notes replacing noisy chats." />
                <FeatureCard icon={<Video className="w-5 h-5" />} title="Recording" description="Future: attach calls for AI summarization." />
            </div>

            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-6 shadow-sm">
                <h2 className="text-lg font-semibold mb-2">What’s next?</h2>
                <ul className="list-disc pl-5 text-sm space-y-1 text-zinc-600 dark:text-zinc-400">
                    <li>Auto-generate meeting briefs from recent commits & merged PRs.</li>
                    <li>Semantic search over past decisions.</li>
                    <li>AI-generated follow-up task suggestions.</li>
                </ul>
                <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-500">This module is in early preview.</p>
            </div>
        </div>
    );
}