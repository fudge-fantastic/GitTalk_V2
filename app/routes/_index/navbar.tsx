import { Link } from "@remix-run/react";
import { GalleryVerticalEnd } from "lucide-react";
import ModeToggle from "~/components/darkModeToggle";

export const buttonStyleLogin = "px-2.5 py-1.5 dark:bg-zinc-900 bg-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-800 rounded-md text-sm font-semibold transition"
export default function NavBar() {
    return (
        <div className="flex flex-row items-center justify-between px-5 py-3">
            <Link to="/" className="font-semibold text-xl flex flex-row items-center gap-1.5"><GalleryVerticalEnd /> GitTalk</Link>
            <div className="flex flex-row items-center gap-2.5">
                <Link to="/login"><button className={buttonStyleLogin}>Login</button></Link>
                <Link to="/register"><button className={buttonStyleLogin}>SignUp</button></Link>
                <ModeToggle />
            </div>
        </div>
    )
}