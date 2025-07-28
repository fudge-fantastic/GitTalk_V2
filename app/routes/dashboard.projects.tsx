// dashboard.projects.tsx: layout
import { Outlet, useOutletContext } from "@remix-run/react";
import { ProjectData } from "~/utils/someFunctionsAndInterface";

interface LoaderData {
  projects: ProjectData[];
}

export default function ProjectsLayout() {
  const {projects}  = useOutletContext<LoaderData>();
  return (
    <div className="mx-1">
      <Outlet context={{projects}}/>
    </div>
  );
}
