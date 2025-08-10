// dashboard._index.tsx


import { useOutletContext } from "@remix-run/react";
import { FeatureCard } from "~/components/landing/feature-card";
import { FaPlus } from "react-icons/fa6";
import { Link } from "@remix-run/react";
import { Sparkles } from "lucide-react";

export default function DashboardIndex() {
  const { user, projects } = useOutletContext<{ user: { username: string }, projects: any[] }>();

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 flex flex-col items-center">
      <div className="flex flex-col items-center mb-8">
        <h1 className="flex items-center gap-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Welcome, {user.username}! <span className="mb-3"><Sparkles className="w-8 h-8" /></span></h1>
        <p className="text-md text-zinc-600 dark:text-zinc-400 mb-4 text-center max-w-xl">
          Ready to supercharge your workflow? Here’s how to get started with <span className="font-semibold text-indigo-600">GitTalk</span>:
        </p>
      </div>

      <div className="w-full bg-zinc-50 dark:bg-zinc-900 rounded-xl shadow p-6 mb-10">
        <h2 className="text-xl font-semibold mb-3 text-zinc-800 dark:text-zinc-100">Get Started Guide</h2>
        <ol className="list-decimal list-inside space-y-3 text-zinc-700 dark:text-zinc-300">
          <li>
            <span className="font-medium">Create a Project:</span> <br />
            Click <Link to="/dashboard/projects/createProject" className="text-indigo-600 hover:underline font-semibold">New Project</Link> to add your first GitHub repository.
          </li>
          <li>
            <span className="font-medium">Explore Your Projects:</span> <br />
            View and manage all your projects from the sidebar or the <Link to="/dashboard/projects" className="text-indigo-600 hover:underline font-semibold">Projects</Link> page.
          </li>
          <li>
            <span className="font-medium">Ask Questions:</span> <br />
            Use the <Link to="/dashboard/askquestions" className="text-indigo-600 hover:underline font-semibold">Q&A</Link> section to get instant answers about your codebase.
          </li>
          <li>
            <span className="font-medium">Track Activity:</span> <br />
            See recent commits and project activity right here as you work.
          </li>
        </ol>
      </div>
    </div>
  );
}
  