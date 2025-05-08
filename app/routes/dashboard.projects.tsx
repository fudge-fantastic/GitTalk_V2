// dashboard.projects.tsx: layout
import { Outlet, useOutletContext } from "@remix-run/react";

export interface ProjectData {
  id: string;
  projectName: string;
  description: string;
  createdAt: string;
}

interface LoaderData {
  projects: ProjectData[];
}

export default function ProjectsLayout() {
  const {projects}  = useOutletContext<LoaderData>();
  console.log("Called from dashboard.projects.tsx",projects);
  return (
    <div className="mx-1">
      <Outlet context={{projects}}/>
    </div>
  );
}
