// dashboard.tsx: layout 
import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { AppSidebar } from "~/components/app-sidebar";
import NavBar from "~/components/navbar";
import { SidebarProvider } from "~/components/ui/sidebar";
import { prisma } from "~/db.server";
import { getProjectsForUser } from "~/models/project.server";
import { requireUserSession, getSession, destroySession } from "~/session.server";

// Fetch user info and all projects for sidebar and children
export async function loader({ request }: LoaderFunctionArgs) {
  const session = await requireUserSession(request);
  const [user, projects] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        username: true,
        email: true,
      },
    }),
    getProjectsForUser(session.userId),
  ]);
  // If the user record no longer exists (e.g. database reset after migration),
  // clear the stale session cookie and send them to login instead of 404.
  if (!user) {
    const existing = await getSession(request.headers.get("Cookie"));
    throw redirect("/login", {
      headers: {
        "Set-Cookie": await destroySession(existing),
      },
    });
  }
  return json({ user, projects });
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
