// dashboard.tsx: layout 
import { json, LoaderFunctionArgs, redirect, defer } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { AppSidebar } from "~/components/app-sidebar";
import NavBar from "~/components/navbar";
import { SidebarProvider } from "~/components/ui/sidebar";
import { prisma } from "~/db.server";
import { getProjectsForUser } from "~/models/project.server";
import { ensureLocalUser } from "~/models/user.server";

// Fetch user info and all projects for sidebar and children
export async function loader({ request }: LoaderFunctionArgs) {
  const userRecord = await ensureLocalUser();
  const user = { username: userRecord.username, email: userRecord.email };
  // If the user record no longer exists (e.g. database reset after migration),
  // clear the stale session cookie and send them to login instead of 404.
  const projectsPromise = getProjectsForUser(userRecord.id);
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
