import { Form, Link, useLoaderData, useMatches, Await } from "@remix-run/react"
import { Suspense } from "react";
import { RiRobot2Line } from "react-icons/ri";
import { PiProjectorScreen } from "react-icons/pi";
// import { FiCreditCard } from "react-icons/fi";
import { RxDashboard } from "react-icons/rx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";

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
  const { user, projects } = useLoaderData<LoaderData>();
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
      <SideBarFooterComponent user={user} />
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
    <SidebarHeader className="flex flex-row items-center gap-[7px] mx-1.5 mt-3">
      <Logo size="sm" />
    </SidebarHeader>
  )
}

function SideBarGroup1Component() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-muted-foreground font-semibold">Application</SidebarGroupLabel>
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
    </SidebarGroup>
  )
}

function SideBarGroup2Component({ projects }: { projects: { id: string; projectName: string }[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-muted-foreground font-semibold">Your Projects</SidebarGroupLabel>
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

function SideBarFooterComponent({ user }: { user: { username: string; email: string } }) {

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) {
      return parts[0][0]?.toUpperCase() || "";
    } else {
      return (parts[0][0] + parts[1][0])?.toUpperCase();
    }
  };

  const initials = getInitials(user.username);

  return (
    <SidebarFooter className="flex flex-row items-center gap-3 mb-3.5 dark:hover:bg-zinc-800 ml-2 rounded-md">
      <Dialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex gap-2 focus:outline-none">
              <div className="h-9 w-9 rounded-full bg-zinc-950 text-white flex items-center justify-center font-medium text-sm">
                {initials}
              </div>
              <div className="flex flex-col text-left">
                <p className="text-sm font-medium tracking-wide">{user.username}</p>
                <p className="text-xs leading-none text-muted-foreground tracking-wide">{user.email}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 m-1.5">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>GitHub</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will log you out of your account.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-1">
            <DialogClose asChild>
              <button className="px-2 py-0.5 text-xs shadow-sm dark:shadow-none hover:shadow-md shadow-zinc-400 hover:shadow-zinc-400 dark:bg-zinc-800 border dark:hover:border-zinc-700 rounded-md font-semibold duration-150">
                Cancel
              </button>
            </DialogClose>
            <Form method="post" action="/logout">
              <button type="submit" className="px-3 py-2 text-xs font-semibold bg-red-600 shadow-sm hover:shadow-md hover:shadow-red-500 shadow-red-500 text-white rounded-md duration-150">Logout</button>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarFooter>
  )
}