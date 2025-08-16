// dashboard.projects.new.tsx
import { Form, useActionData } from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import { LuCodeXml } from "react-icons/lu";
import { createSingleProject } from "~/models/project.server";
import { isValidGitHubRepoUrl } from "~/utils/someFunctions";

export async function action({ request }: { request: Request }) {
    const body = await request.formData();
    const projectName = body.get("projectName") as string;
    const githubUrl = body.get("githubUrl") as string;

    const isValidGitHubUrl = isValidGitHubRepoUrl(githubUrl);
    if (!isValidGitHubUrl) {
        return json({ error: "Invalid GitHub repository URL" }, { status: 400 });
    }

    try {
        // Create project with initial PENDING status
    const project = await createSingleProject({ projectName, githubUrl });
    console.log("✅ Project created:", { projectName, githubUrl: project.githubUrl });

    // Immediate redirect while ingestion continues
        return redirect(`/dashboard/projects/${project.id}`);
    } catch (error) {
        console.error("❌ Failed to create project:", error);
        return json({ error: "Failed to create project" }, { status: 500 });
    }
}

export default function CreateProject() {
    const actionData = useActionData<typeof action>();
    return (
        <div className="flex items-center justify-center min-h-[60vh] py-12 px-2">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-lg p-8 flex flex-col items-center">
                <div className="flex flex-col items-center mb-6">
                    <span className="inline-flex items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-3 p-4">
                        <LuCodeXml className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                    </span>
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-1">Create a New Project</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">Connect a GitHub repository to get started.</p>
                </div>
                <Form method="post" className="w-full flex flex-col gap-5">
                    {actionData?.error && (
                        <p className="text-red-500 text-center font-medium">{actionData.error}</p>
                    )}
                    <label className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Project Name</span>
                        <input
                            name="projectName"
                            type="text"
                            placeholder="Can be any name :)"
                            required
                            className="bg-zinc-100 dark:bg-zinc-800 dark:text-white text-zinc-950 px-3 py-2 text-base w-full rounded-md outline-none font-medium border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-emerald-400"
                        />
                    </label>
                    <label className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">GitHub Repository URL</span>
                        <input
                            name="githubUrl"
                            type="url"
                            placeholder="https://github.com/username/repo"
                            required
                            className="bg-zinc-100 dark:bg-zinc-800 dark:text-white text-zinc-950 px-3 py-2 text-base w-full rounded-md outline-none font-medium border border-zinc-200 dark:border-zinc-700 focus:ring-2 focus:ring-emerald-400"
                        />
                    </label>
                    <button
                        type="submit"
                        className="mt-2 py-2 text-base w-full rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow transition">
                        Create Project
                    </button>
                </Form>
            </div>
        </div>
    );
}