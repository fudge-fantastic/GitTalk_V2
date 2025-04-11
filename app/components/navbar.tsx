import ModeToggle from "./darkModeToggle";
import { Input } from "./ui/input";
import { SidebarTrigger } from "./ui/sidebar";

export default function NavBar() {
    return (
        <div className="ml-2 mr-5 mt-2 rounded-sm flex justify-between flex-row items-center">
            <div className="flex gap-4 items-center w-full">
                <SidebarTrigger className="ml-2" />
                <Input placeholder="Search..." className="bg-zinc-100 dark:bg-zinc-900 h-8 rounded-md w-1/3" />
            </div>
            <ModeToggle />
        </div>
    );
}