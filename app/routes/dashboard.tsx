// dashboard.tsx: layout 
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { AppSidebar } from "~/components/app-sidebar";
import NavBar from "~/components/navbar";
import { SidebarProvider } from "~/components/ui/sidebar";
import { prisma } from "~/db.server";
import { getProjectsForUser } from "~/models/project.server";
import { requireUserSession } from "~/session.server";

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
  if (!user) throw new Response("User not found", { status: 404 });
  return json({ user, projects });
}

export default function DashboardLayout() {
  const data = useLoaderData();
  return (
    <SidebarProvider>
      <AppSidebar />
      {/* Whole Canvas Container */}
      <div className="flex flex-col w-full rounded-xl dark:bg-zinc-950 bg-white m-3 shadow-md shadow-zinc-400 dark:shadow-none">
        <NavBar />
        <div className="m-3">
          <Outlet context={data} />
        </div>
      </div>
    </SidebarProvider>
  );
}
