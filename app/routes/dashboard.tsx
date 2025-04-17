import { Outlet } from "@remix-run/react";
import { AppSidebar } from "~/components/app-sidebar";
import NavBar from "~/components/navbar";
import { SidebarProvider } from "~/components/ui/sidebar";

export default function DashboardLayout() {
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
  