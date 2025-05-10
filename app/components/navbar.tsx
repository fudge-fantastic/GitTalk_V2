import ModeToggle from "./darkModeToggle";
import { SidebarTrigger } from "./ui/sidebar";

export default function NavBar() {
    return (
        <div className="ml-2 mr-5 mt-3 rounded-sm flex justify-between flex-row items-center">
            <div className="flex gap-4 items-center w-full">
                <SidebarTrigger className="ml-3" />
                <input
                    // type="text"
                    placeholder="Search..."
                    required
                    className="bg-zinc-100 dark:bg-zinc-900 dark:text-white text-zinc-950 p-1.5 rounded-md outline-none font-medium w-full mr-3.5"
                    // className="bg-zinc-100 dark:bg-zinc-900 dark:text-white text-zinc-950 p-1.5 rounded-md outline-none font-medium md:w-1/2 w-full mr-3.5"
                />
            </div>
            <ModeToggle />
        </div>
    );
}