// dashboard.projects.new.tsx
import { Form, json, redirect, useActionData } from "@remix-run/react";
import { LuCodeXml } from "react-icons/lu";
import { createSingleProject } from "~/models/project.server";
import { getSession } from "~/session.server";
import dotenv from "dotenv"; import { createCollection, upsertSummarizedDocsToQdrant } from "~/models/qdrant.server";
import { loadGithubDocs } from "~/models/langchain.server";
dotenv.config();

export function isValidGitHubRepoUrl(url: string): boolean {
    const regex = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/i;
    return regex.test(url.trim());
}

export async function action({ request }: { request: Request }) {
    const body = await request.formData();
    const projectName = body.get("projectName") as string;
    const githubUrl = body.get("githubUrl") as string;
    // const githubToken = body.get("githubToken") as string;

    const isValidGitHubUrl = isValidGitHubRepoUrl(githubUrl);
    if (!isValidGitHubUrl) {
        return json({ error: "Invalid GitHub repository URL" }, { status: 400 });
    }

    const session = await getSession(request.headers.get("Cookie"));
    const userId = session.get("userId");

    if (!userId) {
        return json({ error: "Unauthorized User" }, { status: 401 });
    }

    try {
        const project = await createSingleProject({ userId, projectName, githubUrl });
        console.log("✅ Project created:", { projectName, githubUrl });

        const collection_name = process.env.COLLECTION_NAME || "";
        await createCollection(collection_name);
        const docs = await loadGithubDocs(githubUrl, userId, project.id);
        await upsertSummarizedDocsToQdrant(docs, collection_name);

        return redirect(`/dashboard/projects/${project.id}`);
    } catch (error) {
        console.error("❌ Failed to create project and vector data:", error);
        return json({ error: "Failed to create project" }, { status: 500 });
    }
}

export default function CreateProject() {
    const actionData = useActionData<typeof action>();
    return (
        <div className="flex items-center justify-center my-12">
            <div className="flex flex-col items-center">
                <div className="flex flex-row items-center gap-3">
                    <LuCodeXml className="md:h-16 md:w-16 w-12 h-12 text-muted-foreground" />
                    <div className="flex flex-col">
                        <h1 className="md:text-2xl text-xl font-semibold">Create New Project</h1>
                        <p className="md:text-sm text-xs text-muted-foreground font-medium">Enter your GitHub repository details</p>
                    </div>
                </div>
                <Form method="post" className="w-full flex flex-col gap-4 md:p-0 p-2 mt-4">
                    {actionData?.error && (
                        <p className="text-red-500 text-center">{actionData.error}</p>
                    )}
                    <label>
                        <span className="text-sm text-muted-foreground font-medium">Project Name</span>
                        <input
                            name="projectName"
                            type="text"
                            placeholder="Can be any name :)"
                            required
                            className="bg-zinc-200 dark:bg-zinc-900 dark:text-white text-zinc-950 p-2 md:text-base text-sm w-full rounded-md outline-none font-medium"
                        />
                    </label>
                    <label>
                        <span className="text-sm text-muted-foreground font-medium">Github Repository URL</span>
                        <input
                            name="githubUrl"
                            type="url"
                            placeholder="https://github.com/username/repo"
                            required
                            className="bg-zinc-200 dark:bg-zinc-900 dark:text-white text-zinc-950 p-2 md:text-base text-sm w-full rounded-md outline-none font-medium"
                        />
                    </label>
                    <button
                        type="submit"
                        className="p-2 md:text-base text-sm w-full rounded-md bg-primary text-primary-foreground font-semibold mt-3">
                        Create Project
                    </button>
                </Form>
            </div>
        </div>
    );
}