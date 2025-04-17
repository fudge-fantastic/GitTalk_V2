// dashboard.projects.tsx: layout
import { Outlet } from "@remix-run/react";

export default function ProjectsLayout() {
  return (
    <div className="p-6">
      <Outlet />
    </div>
  );
}
