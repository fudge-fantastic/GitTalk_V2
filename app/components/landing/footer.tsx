import { Link } from "@remix-run/react";
import { Github } from "lucide-react";
import { Logo } from "~/components/brand/logo";

export function Footer() {
  return (
    <footer className="relative mt-10 border-t border-zinc-200/70 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-sm">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-zinc-950/0 dark:to-zinc-950/40" />
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-start gap-10 md:gap-16">
          <div className="flex-1 min-w-[220px]">
            <Logo size="sm" />
            <p className="mt-4 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 max-w-sm">
              Chat with your repositories, retrieve the right context instantly, and build faster with intelligent code insight.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Product</h3>
              <ul className="space-y-2 text-zinc-600 dark:text-zinc-400">
                <li><Link to="/dashboard" className="hover:text-zinc-900 dark:hover:text-zinc-200">Dashboard</Link></li>
                <li><Link to="/dashboard/projects" className="hover:text-zinc-900 dark:hover:text-zinc-200">Projects</Link></li>
                <li><Link to="/dashboard/askquestions" className="hover:text-zinc-900 dark:hover:text-zinc-200">Ask</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Resources</h3>
              <ul className="space-y-2 text-zinc-600 dark:text-zinc-400">
                <li><Link to="/dashboard/projects" className="hover:text-zinc-900 dark:hover:text-zinc-200">Projects</Link></li>
                <li><Link to="/dashboard/askquestions" className="hover:text-zinc-900 dark:hover:text-zinc-200">Ask</Link></li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Company</h3>
              <ul className="space-y-2 text-zinc-600 dark:text-zinc-400">
                <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-zinc-900 dark:hover:text-zinc-200">GitHub</a></li>
                <li><a href="mailto:contact@example.com" className="hover:text-zinc-900 dark:hover:text-zinc-200">Contact</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-zinc-500 dark:text-zinc-500">© {new Date().getFullYear()} GitTalk. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200">
              <Github className="size-3.5" /> <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
