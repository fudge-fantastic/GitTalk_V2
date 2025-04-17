// dashboard.projects.new.tsx
import { LuCodeXml } from "react-icons/lu";

export default function CreateProject() {
    return (
        <div className="flex items-center justify-center my-6">
            <div className="flex flex-col items-center">
                <div className="flex flex-row items-center gap-3">
                    <LuCodeXml className="md:h-16 md:w-16 w-12 h-12 text-muted-foreground" />
                    <div className="flex flex-col">
                        <h1 className="md:text-2xl text-xl font-semibold">Create New Project</h1>
                        <p className="md:text-sm text-xs text-muted-foreground font-medium">Enter your GitHub repository details</p>
                    </div>
                </div>
                <div className="w-full flex flex-col gap-4 md:p-0 p-2 mt-4">
                    <label>
                        <span className="text-sm text-muted-foreground font-medium">Project Name</span>
                        <input
                            // type="text"
                            placeholder="Can be any name :)"
                            required
                            className="bg-zinc-200 dark:bg-zinc-900 dark:text-white text-zinc-950 p-2 md:text-base text-sm w-full rounded-md outline-none font-medium"
                        />
                    </label>
                    <label>
                        <span className="text-sm text-muted-foreground font-medium">Github Repository URL</span>
                        <input
                            // type="url"
                            placeholder="https://github.com/username/repo"
                            required
                            className="bg-zinc-200 dark:bg-zinc-900 dark:text-white text-zinc-950 p-2 md:text-base text-sm w-full rounded-md outline-none font-medium"
                        />
                    </label>
                    <label>
                        <span className="text-sm text-muted-foreground font-medium">GitHub Access Token (Optional)</span>
                        <input
                            // type="password"
                            placeholder="GitHub Access Token"
                            className="bg-zinc-200 dark:bg-zinc-900 dark:text-white text-zinc-950 p-2 md:text-base text-sm w-full rounded-md outline-none font-medium"
                        />
                    </label>
                    <button
                        type="submit"
                        className="p-2 md:text-base text-sm w-full rounded-md bg-primary text-primary-foreground font-semibold mt-3">
                        Create Project
                    </button>
                </div>
            </div>
        </div>
    );
}