// dashboard.projects.$id.tsx
import { useParams, useOutletContext, useLoaderData, Link, Form } from "@remix-run/react";
import { Textarea } from "~/components/ui/textarea";
import { FaCodeCommit } from "react-icons/fa6";
import { ScrollArea } from "~/components/ui/scroll-area";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { CommitResponse, pollCommits } from "~/models/github.server";
import { FiExternalLink } from "react-icons/fi";
import { useState } from "react"; import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "~/components/ui/dialog"
import { SingleProjectData } from "~/utils/someFunctionsAndInterface";

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

    const [question, setQuestion] = useState("");
    const [open, setOpen] = useState(false);

    if (!project) { return <p className="text-red-500 text-center text-lg">Project not found.</p>; }

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setOpen(true);
    }

    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete your account
                            and remove your data from our servers.
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
            <div className="flex md:flex-row flex-col w-full gap-3">
                <Form onSubmit={onSubmit} className="flex justify-between flex-col px-4 py-3 dark:bg-zinc-900 bg-zinc-100 rounded-md shadow-sm shadow-zinc-400 dark:shadow-none md:w-[60%]">
                    <div>
                        <h1 className="text-lg font-semibold">Ask a question</h1>
                        <p className="text-muted-foreground text-sm mb-2">GitTalk has knowledge to your codebase</p>
                        <Textarea
                            value={question} onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Which part of the codebase do you need help with?"
                            className="bg-white dark:bg-zinc-950 rounded-md h-28"
                        />
                    </div>
                    <div className="mb-2">
                        <button className="mt-4 px-2.5 py-1.5 dark:bg-white dark:text-black dark:hover:bg-zinc-200 bg-zinc-950 text-white hover:bg-zinc-900 rounded-md text-sm font-semibold transition">Submit</button>
                    </div>
                </Form>
                <div className="py-3 pl-4 dark:bg-zinc-900 bg-zinc-100 rounded-md shadow-sm shadow-zinc-400 dark:shadow-none md:w-[40%]">
                    <h1 className="text-lg font-semibold mb-1">{project.projectName}</h1>
                    <ScrollArea className="font-medium text-muted-foreground text-sm h-44 overflow-auto pr-4 text-justify">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto ex rerum repellat labore. Ipsa blanditiis adipisci, autem porro, at dolorum saepe animi iusto ratione molestiae et tempore? Ullam, animi consectetur! Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestiae similique, architecto nobis eaque officia iusto eos possimus deserunt
                    </ScrollArea>
                </div>
            </div>
            <div className="mt-3">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <FaCodeCommit className="w-7 h-7" />
                        <h1 className="font-semibold text-xl">Recent Commits</h1>
                        <Link to={project.githubUrl} target="_blank" className="font-medium text-sm lowercase hover:underline flex items-center gap-1" rel="noreferrer">
                            <p>Visit Repository</p>
                            <FiExternalLink className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                    <button className="flex items-center gap-1 px-2.5 py-1.5 dark:bg-white dark:text-black dark:hover:bg-zinc-200 bg-zinc-950 text-white hover:bg-zinc-900 rounded-md text-sm font-semibold transition">
                        {/* <IoMdRefresh className="w-5 h-5" /> */}
                        <p>Refresh Commits</p>
                    </button>
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
                                        <p className="text-sm line-clamp-3 tracking-tight font-medium">{commit.commitMessage}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
