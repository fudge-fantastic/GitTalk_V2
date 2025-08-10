// dashboard.projects.tsx: layout

import { Outlet, useOutletContext } from "@remix-run/react";

export default function ProjectsLayout() {
  const { projects } = useOutletContext<{ projects: any[] }>();
  return (
    <div className="mx-1">
      <Outlet context={{ projects }} />
    </div>
  );
}
