// dashboard.projects.tsx: layout

import { Await, Outlet, useOutletContext } from "@remix-run/react";
import { Suspense } from "react";

export default function ProjectsLayout() {
  const { projects } = useOutletContext<{ projects: any[] | Promise<any[]> }>();
  return (
    <div className="mx-1">
      <Suspense fallback={<div className="text-sm text-muted-foreground p-2">Loading projects…</div>}>
        <Await resolve={projects} errorElement={<div className="text-sm text-red-500 p-2">Failed to load projects.</div>}>
          {(resolved: any[]) => <Outlet context={{ projects: resolved }} />}
        </Await>
      </Suspense>
    </div>
  );
}
