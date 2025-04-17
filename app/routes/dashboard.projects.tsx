// dashboard.projects.tsx: layout
import { Outlet } from "@remix-run/react";

export default function ProjectsLayout() {
  return (
    <div className="mx-1">
      <Outlet />
    </div>
  );
}
