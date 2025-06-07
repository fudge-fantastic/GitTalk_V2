// dashboard.projects.$id.tsx
import { useParams, useOutletContext, useLoaderData, Link } from "@remix-run/react";
import { Textarea } from "~/components/ui/textarea";
import { FaCodeCommit } from "react-icons/fa6";
import { ScrollArea } from "~/components/ui/scroll-area";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { CommitResponse, pollCommits } from "~/models/github.server";
import { FiExternalLink } from "react-icons/fi";

export interface SingleProjectData {
    id: string;
    projectName: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    githubUrl: string;
}

export async function loader({ params }: LoaderFunctionArgs) {
    const projectId = params.id;
    if (!projectId) throw new Response("Project ID required", { status: 400 });

    // Poll commits from GitHub and save new ones to DB
    const commits = await pollCommits(projectId);

    // If pollCommits returns undefined on error, fallback to empty array
    return json({ commits: commits ?? [] });
}

export default function ProjectDetailsRoute() {
    const { id } = useParams();
    const { projects } = useOutletContext<{ projects: SingleProjectData[] }>();
    const { commits } = useLoaderData<{ commits: CommitResponse[] }>();
    // console.log(commits);

    const project = projects.find((p) => p.id === id);

    if (!project) { return <p className="text-red-500 text-center text-lg">Project not found.</p>; }

    return (
        <div>
            <div className="flex flex-row w-full gap-3">
                <div className="flex justify-between flex-col px-4 py-3 dark:bg-zinc-900 bg-zinc-100 rounded-md shadow-sm shadow-zinc-400 dark:shadow-none w-[60%]">
                    <div>
                        <h1 className="text-lg font-semibold">Ask a question</h1>
                        <p className="text-muted-foreground text-sm mb-2">GitTalk has knowledge to your codebase</p>
                        <Textarea
                            placeholder="Which part of the codebase do you need help with?"
                            className="bg-white dark:bg-zinc-950 rounded-md h-28"
                        />
                    </div>
                    <div className="mb-2">
                        <button className="mt-4 px-2.5 py-1.5 dark:bg-white dark:text-black dark:hover:bg-zinc-200 bg-zinc-950 text-white hover:bg-zinc-900 rounded-md text-sm font-semibold transition">Submit</button>
                    </div>
                </div>
                <div className="py-3 pl-4 dark:bg-zinc-900 bg-zinc-100 rounded-md shadow-sm shadow-zinc-400 dark:shadow-none w-[40%]">
                    <h1 className="text-lg font-semibold mb-1">{project.projectName}</h1>
                    <ScrollArea className="font-medium text-muted-foreground tracking-wider text-sm h-44 overflow-auto pr-4 text-justify">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto ex rerum repellat labore. Ipsa blanditiis adipisci, autem porro, at dolorum saepe animi iusto ratione molestiae et tempore? Ullam, animi consectetur! Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestiae similique, architecto nobis eaque officia iusto eos possimus deserunt
                    </ScrollArea>
                </div>
            </div>
            <div className="mt-3">
                <div className="flex gap-2 items-center">
                    <FaCodeCommit className="w-7 h-7" />
                    <h1 className="font-semibold text-xl">Recent Commits</h1>
                    <Link to={project.githubUrl} target="_blank" className="font-medium lowercase hover:underline flex items-center gap-1" rel="noreferrer">
                        <p>Visit Repository</p>
                        <FiExternalLink className="w-4 h-4" />
                    </Link>
                </div>
                <div className="bg-zinc-100 dark:bg-zinc-900 shadow-sm shadow-zinc-400 dark:shadow-none rounded-md mt-3 h-auto overflow-auto pr-4 space-y-6 px-4 py-4">
                    {commits.length === 0 ? (
                        <p className="text-muted-foreground">No commits found.</p>
                    ) : (
                        commits.map((commit) => (
                            <div key={commit.commitHash} className="flex items-center">
                                <div className="flex items-start gap-4">
                                    {/* Avatar */}
                                    <div className="w-9 h-9 flex items-center justify-center shrink-0 mt-1">
                                        {commit.authorAvatarUrl && (
                                            <img
                                                src={commit.authorAvatarUrl}
                                                alt={commit.authorName}
                                                className="w-9 h-9 rounded-full object-cover"
                                            />
                                        )}
                                    </div>
                                    {/* Commit details */}
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2 text-sm mb-1">
                                            <Link to={commit.authorUrl ?? ''} target="_blank" className="font-semibold" rel="noreferrer">{commit.authorName || "Unknown Author"}</Link>
                                            <Link to={commit.commitUrl ?? ''} target="_blank" className="text-muted-foreground" rel="noreferrer">commited</Link>
                                            <time dateTime={commit.committedAt} className="text-muted-foreground uppercase">
                                                @{new Date(commit.committedAt || "").toLocaleString()}
                                            </time>
                                        </div>
                                        <p className="text-sm line-clamp-3 tracking-tight">{commit.commitMessage}</p>
                                        {/* <p className="text-muted-foreground text-sm">{commit.commitHash}</p> */}
                                    </div>
                                </div>
                                {/* <div>
                                    <button className="text-sm font-medium px-2.5 py-1.5 dark:bg-white dark:text-black dark:hover:bg-zinc-200 bg-zinc-950 text-white hover:bg-zinc-900 rounded-md">Summarize Commit</button>
                                </div> */}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
