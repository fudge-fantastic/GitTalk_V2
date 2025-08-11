// dashboard._index.tsx


import { useOutletContext } from "@remix-run/react";
import { Link } from "@remix-run/react";
import { Sparkles } from "lucide-react";

export default function DashboardIndex() {
  const { user, projects } = useOutletContext<{ user: { username: string }, projects: any[] }>();

  const totalProjects = projects.length;
  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">Hey <span>{user.username}</span><Sparkles className="w-6 h-6 text-emerald-500"/></h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">Your workspace hub. Jump into a project, ask contextual questions, or sync fresh commits. Everything stays fast & grounded.</p>
      </div>
      <div className="grid sm:grid-cols-3 gap-4 mb-12">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-5 flex flex-col">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 mb-1">Projects</span>
          <span className="text-2xl font-semibold">{totalProjects}</span>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-5 flex flex-col">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 mb-1">Commits Indexed</span>
          <span className="text-2xl font-semibold">~{/* placeholder */}</span>
        </div>
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-5 flex flex-col">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 mb-1">Questions (soon)</span>
          <span className="text-2xl font-semibold">0</span>
        </div>
      </div>
      <div className="rounded-xl border border-zinc-100 dark:border-zinc-950 bg-gradient-to-br from-zinc-50 to-pink-50 dark:from-blue-950/30 dark:to-teal-900/30 p-8">
        <h2 className="text-xl font-semibold mb-4">Quick Start</h2>
        <ol className="grid md:grid-cols-2 gap-4 text-sm text-zinc-700 dark:text-zinc-300">
          <li className="rounded-lg bg-white/70 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 p-4">
            <p className="font-medium mb-1">1. Create a Project</p>
            <p>Point at a GitHub repo: <Link className="text-emerald-600 font-medium hover:underline" to="/dashboard/projects/createProject">New Project</Link></p>
          </li>
          <li className="rounded-lg bg-white/70 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 p-4">
            <p className="font-medium mb-1">2. Browse & Sync</p>
            <p>Manage everything on the <Link className="text-emerald-600 font-medium hover:underline" to="/dashboard/projects">Projects</Link> page.</p>
          </li>
          <li className="rounded-lg bg-white/70 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 p-4">
            <p className="font-medium mb-1">3. Ask Questions</p>
            <p>Use contextual Q&A in <Link className="text-emerald-600 font-medium hover:underline" to="/dashboard/askquestions">Ask</Link> to explore code.</p>
          </li>
          <li className="rounded-lg bg-white/70 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 p-4">
            <p className="font-medium mb-1">4. Iterate</p>
            <p>Refresh commits to keep your knowledge base current.</p>
          </li>
        </ol>
      </div>
    </div>
  );
}
  