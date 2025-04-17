import { Link } from "@remix-run/react"
import { RiRobot2Line } from "react-icons/ri";
import { PiProjectorScreen } from "react-icons/pi";
import { FiCreditCard } from "react-icons/fi";
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

// Menu items.
const group1 = [
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
  },
  {
    title: "Billing",
    url: "/settings",
    icon: FiCreditCard,
  },
]

const group2 = [
  {
    title: "WordSmith",
    url: "/",
    icon: <div className="h-6 w-6 rounded-md font-medium bg-zinc-950 text-white flex items-center justify-center">P</div>,
  },
  {
    title: "SprintSync",
    url: "/",
    icon: <div className="h-6 w-6 rounded-md font-medium bg-zinc-950 text-white flex items-center justify-center">P</div>,

  },
  {
    title: "Kaizen Board",
    url: "/",
    icon: <div className="h-6 w-6 rounded-md font-medium bg-zinc-950 text-white flex items-center justify-center">P</div>,
  },
  {
    title: "TimeSheet Manager",
    url: "/",
    icon: <div className="h-6 w-6 rounded-md font-medium bg-zinc-950 text-white flex items-center justify-center">P</div>,
  }
]

export function AppSidebar() {
  return (
    <Sidebar className="border-none">
      <SideBarHeaderComponent />
      <SidebarContent>
        <SideBarGroup1Component />
        <SideBarGroup2Component />
      </SidebarContent>
      <SideBarFooterComponent />
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

function SideBarGroup2Component() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-muted-foreground font-semibold">Projects</SidebarGroupLabel>
      <SidebarGroupAction title="Add Project">
        <Link to="/dashboard/projects/new">
          <FaPlus /> <span className="sr-only">Add Project</span>
        </Link>
      </SidebarGroupAction>
      <SidebarGroupContent>
        <SidebarMenu>
          {group2.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <Link to={item.url} className="flex items-center gap-2">
                  {item.icon}
                  <span className="font-medium">{item.title}</span>
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

function SideBarFooterComponent() {
  return (
    <SidebarFooter className="flex flex-row items-center gap-3 mb-3.5 dark:hover:bg-zinc-800 ml-2 rounded-md">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex gap-2 focus:outline-none">
            <div className="h-9 w-9 rounded-full bg-zinc-950 text-white flex items-center justify-center font-medium text-sm">
              BS
            </div>
            <div className="flex flex-col text-left">
              <p className="text-sm font-medium tracking-wide">Bluesalt</p>
              <p className="text-xs leading-none text-muted-foreground tracking-wide">bluesalt@example.com</p>
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
          <DropdownMenuItem>
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarFooter>
  )
}