// dashboard layout 
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { AppSidebar } from "~/components/app-sidebar";
import NavBar from "~/components/navbar";
import { SidebarProvider } from "~/components/ui/sidebar";
import prisma from "~/lib/prisma";
import { requireUserSession } from "~/session";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await requireUserSession(request); // get the session
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      username: true,
      email: true,
    },
  });

  if (!user) throw new Response("User not found", { status: 404 });
  // console.log(user)
  return json({ user });
}

export default function DashboardLayout() {
  console.log("dashboard layout")
    return (
      <SidebarProvider>
        <AppSidebar />
        <div className="flex flex-col w-full rounded-xl dark:bg-zinc-950 bg-white m-3 shadow-md shadow-zinc-400 dark:shadow-none">
          <NavBar />
          <div className="m-3">
            <Outlet />
          </div>
        </div>
      </SidebarProvider>
    );
  }
  