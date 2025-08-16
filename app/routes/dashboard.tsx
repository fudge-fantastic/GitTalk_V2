// dashboard.tsx: layout 
import { json, LoaderFunctionArgs, redirect, defer } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { AppSidebar } from "~/components/app-sidebar";
import NavBar from "~/components/navbar";
import { SidebarProvider } from "~/components/ui/sidebar";
import { getAllProjects } from "~/models/project.server";

// Fetch user info and all projects for sidebar and children
export async function loader({ request }: LoaderFunctionArgs) {
  // Single-user mode: no user record, provide static metadata
  const user = { username: "Local User", email: "local-mode" };
  const projectsPromise = getAllProjects();
  return defer({ user, projects: projectsPromise });
}

export default function DashboardLayout() {
  const data = useLoaderData();
  return (
    <SidebarProvider>
      <AppSidebar />
      {/* Whole Canvas Container */}
      <div className="flex flex-col w-full rounded-xl dark:bg-zinc-950/90 bg-white/95 m-3 shadow-md shadow-zinc-400 dark:shadow-none">
        <NavBar />
        <div className="m-3">
          <Outlet context={data} />
        </div>
      </div>
    </SidebarProvider>
  );
}
