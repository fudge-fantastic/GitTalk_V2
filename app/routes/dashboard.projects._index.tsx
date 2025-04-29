// routes/dashboard.projects._index.tsx
import { Link, useOutletContext } from "@remix-run/react";
import { Plus } from "lucide-react";
import { ProjectData } from "./dashboard.projects";

interface ContextData {
  projects: ProjectData[];
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateString));
}

function ProjectCard({ project }: { project: ProjectData }) {
  return (
    <Link to={`/dashboard/projects/${project.id}`} className="block hover:shadow-md transition-shadow">
      <div className="bg-zinc-200 dark:bg-zinc-900 dark:text-white text-zinc-950 py-3 px-3.5 rounded-md shadow-sm shadow-zinc-400 dark:shadow-none flex flex-col justify-between h-full">
        <h2 className="text-lg font-semibold">{project.projectName}</h2>
        <p className="text-sm text-muted-foreground mt-1">{formatDate(project.createdAt)}</p>
        <p className="text-sm text-zinc-400 mt-2">
          {project.description || "No description provided."}
        </p>
      </div>
    </Link>
  );
}

export default function ProjectsIndex() {
  const { projects } = useOutletContext<ContextData>();

  return (
    <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
      {/* New Project Card */}
      <Link to="/dashboard/projects/newproject" className="gap-2 bg-zinc-100 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 transition rounded-md flex items-center justify-center text-center py-10 px-5 font-semibold text-zinc-600 dark:text-zinc-300 border border-dashed border-zinc-400">
        <Plus className="w-6 h-6" />
        <p className="md:text-lg text-sm">Create New Project</p>
      </Link>

      {projects.length > 0 ? (
        projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))
      ) : (
        <div className="col-span-full text-center py-10 text-zinc-500">
          <p className="text-lg font-medium">You haven&apos;t created any projects yet.</p>
          <Link
            to="/dashboard/projects/newproject"
            className="text-blue-500 underline mt-2 inline-block"
          >
            Create your first project →
          </Link>
        </div>
      )}
    </div>
  );
}