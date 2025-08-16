import { Link, useLoaderData, useMatches, Await } from "@remix-run/react"
import { Suspense } from "react";
import { RiRobot2Line } from "react-icons/ri";
import { PiProjectorScreen } from "react-icons/pi";
// import { FiCreditCard } from "react-icons/fi";
import { RxDashboard } from "react-icons/rx";
import { IoSettingsSharp } from "react-icons/io5";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "~/components/ui/sidebar"
import { Logo } from "~/components/brand/logo";
import { FaPlus, FaRegFolder } from "react-icons/fa6";
import { FaGithub } from "react-icons/fa";

// Menu items.
const group1 = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: RxDashboard,
  },
  {
    title: "Q&A",
    url: "/dashboard/askquestions",
    icon: RiRobot2Line,
  },
  {
    title: "Meetings",
    url: "/dashboard/meetings",
    icon: PiProjectorScreen,
  },
  {
    title: "Projects",
    url: "/dashboard/projects",
    icon: FaRegFolder,
  }
]

const group2 = [
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: IoSettingsSharp,
  },
  {
    title: "Support",
    url: "https://github.com/fudge-fantastic/GitTalk_V2",
    icon: FaGithub,
  }
]

type LoaderData = {
  user: {
    username: string;
    email: string;
  };
  projects: Promise<{
    id: string;
    projectName: string;
  }[]> | {
    id: string;
    projectName: string;
  }[];
};

export function AppSidebar() {
  const { projects } = useLoaderData<LoaderData>();
  const matches = useMatches();
  return (
    <Sidebar className="border-none">
      <SideBarHeaderComponent />
      <SidebarContent>
        <SideBarGroup1Component />
        <Suspense fallback={<ProjectsSkeleton />}>
          <Await resolve={projects} errorElement={<div className="px-3 py-2 text-xs text-red-500">Failed to load projects</div>}>
            {(resolved: { id: string; projectName: string }[]) => (
              <SideBarGroup2Component projects={resolved} />
            )}
          </Await>
        </Suspense>
      </SidebarContent>
    </Sidebar>
  )
}

function ProjectsSkeleton() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-muted-foreground font-semibold">Your Projects</SidebarGroupLabel>
      <SidebarGroupContent>
        <div className="space-y-2 px-2 py-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-7 rounded-md bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          ))}
        </div>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function SideBarHeaderComponent() {
  return (
    <SidebarHeader className="flex flex-row items-center gap-[7px] mx-1.5 mt-4">
      <Logo size="sm" />
    </SidebarHeader>
  )
}

function SideBarGroup1Component() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-muted-foreground font-semibold">Get Started</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {group1.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <Link to={item.url}>
                  <item.icon />
                  <span className="font-medium">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
      <SidebarGroupLabel className="text-muted-foreground font-semibold mt-5">Help & Support</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {group2.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <Link to={item.url}>
                  <item.icon />
                  <span className="font-medium">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

function SideBarGroup2Component({ projects }: { projects: { id: string; projectName: string }[] }) {
  return (
    <SidebarGroup className="mt-1">
      <SidebarGroupLabel className="text-muted-foreground font-semibold mt-0">Your Projects</SidebarGroupLabel>
      <SidebarGroupAction title="Add new project">
        <Link to="/dashboard/projects/createProject">
          <FaPlus /> <span className="sr-only">Add New Project</span>
        </Link>
      </SidebarGroupAction>
      <SidebarGroupContent>
        {projects.length === 0 ? (
          <div className="flex items-center justify-center mt-2">
            <span className="text-sm font-medium text-muted-foreground">No projects</span>
          </div>
        ) : (
          <SidebarMenu>
            {projects.filter((r, i) => i < 5).map((item) => (
              <SidebarMenuItem key={item.projectName}>
                <SidebarMenuButton asChild>
                  <Link to={`/dashboard/projects/${item.id}`} className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full font-medium bg-zinc-950 text-white flex items-center justify-center text-xs">
                      {item.projectName[0].toUpperCase()}
                    </div>
                    <span className="font-medium">{item.projectName}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        )}
        {projects.length > 5 && (
          <div className="flex items-center justify-center mt-2">
            <button className="text-sm font-medium text-muted-foreground hover:underline hover:underline-offset-2">Show more...</button>
          </div>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  )
}