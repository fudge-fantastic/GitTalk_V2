import { Form, Link, useLoaderData } from "@remix-run/react"
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
import { GalleryVerticalEnd } from "lucide-react";
import { FaPlus, FaRegFolder } from "react-icons/fa6";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { useState } from "react";

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
  projects: {
    id: string;
    projectName: string;
  }[];
};

export function AppSidebar() {
  const { user, projects } = useLoaderData<LoaderData>();
  return (
    <Sidebar className="border-none">
      <SideBarHeaderComponent />
      <SidebarContent>
        <SideBarGroup1Component />
        <SideBarGroup2Component projects = {projects} />
      </SidebarContent>
      <SideBarFooterComponent user = {user} />
    </Sidebar>
  )
}

function SideBarHeaderComponent() {
  return (
    <SidebarHeader className="flex flex-row items-center gap-[7px] mx-1.5 mt-3">
      <Link to="/" className="flex flex-row items-center gap-[7px]">
        <GalleryVerticalEnd />
        <h1 className="text-zinc-900 dark:text-white text-xl font-semibold tracking-wide">GitTalk</h1>
      </Link>
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
      <SidebarGroupLabel className="text-muted-foreground font-semibold">Projects</SidebarGroupLabel>
      <SidebarGroupAction title="Add Project">
        <Link to="/dashboard/projects/newproject">
          <FaPlus /> <span className="sr-only">Add Project</span>
        </Link>
      </SidebarGroupAction>
      <SidebarGroupContent>
        <SidebarMenu>
          {projects.filter((r, i)=>i<6).map((item) => (
            <SidebarMenuItem key={item.projectName}>
              <SidebarMenuButton asChild>
                <Link to={`/dashboard/projects/${item.id}`} className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md font-medium bg-zinc-950 text-white flex items-center justify-center text-xs">
                    {item.projectName[0].toUpperCase()}
                  </div>
                  <span className="font-medium">{item.projectName}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
      <div className="flex items-center justify-center mt-2">
        <button className="text-sm font-medium text-muted-foreground hover:underline hover:underline-offset-2">Show more...</button>
      </div>
    </SidebarGroup>
  )
}

function SideBarFooterComponent({user}: {user: {username: string; email: string}}) {
  const [open, setOpen] = useState(false)

  return (
    <SidebarFooter className="flex flex-row items-center gap-3 mb-3.5 dark:hover:bg-zinc-800 ml-2 rounded-md">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex gap-2 focus:outline-none">
            <div className="h-9 w-9 rounded-full bg-zinc-950 text-white flex items-center justify-center font-medium text-sm">
              BS
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
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpen(true)}>
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <DialogDescription>
              This will log you out of your account.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-1">
            <button className="px-2 py-0.5 text-xs shadow-sm dark:shadow-none hover:shadow-md shadow-zinc-400 hover:shadow-zinc-400 dark:bg-zinc-800 border dark:hover:border-zinc-700 rounded-md font-semibold duration-150" onClick={() => setOpen(false)}>Cancel</button>
            <Form method="post" action="/logout">
              <button type="submit" className="px-3 py-2 text-xs font-semibold bg-red-600 shadow-sm hover:shadow-md hover:shadow-red-500 shadow-red-500 text-white rounded-md duration-150">Logout</button>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarFooter>
  )
}