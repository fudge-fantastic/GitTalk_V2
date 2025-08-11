// dashboard.projects.$id.tsx
import { useParams, useLoaderData, Link, Form, useSubmit, useSearchParams, useNavigate, Await } from "@remix-run/react";
import { Textarea } from "~/components/ui/textarea";
import { FaCodeCommit } from "react-icons/fa6";
import { ScrollArea } from "~/components/ui/scroll-area";
import { json, LoaderFunctionArgs, ActionFunctionArgs, redirect, defer } from "@remix-run/node";
import { pollCommits, fetchAndReplaceCommits, DEFAULT_PAGE_SIZE } from "~/models/github.server";
import { FiExternalLink } from "react-icons/fi";
import { useState, Suspense } from "react"; import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "~/components/ui/dialog"
import { SingleProjectData } from "~/utils/someFunctionsAndInterface";
import { getProjectsForUser } from "~/models/project.server";
import { requireUserSession } from "~/session.server";
import { prisma } from "~/db.server";

export async function action({ request, params }: ActionFunctionArgs) {
    const formData = await request.formData();
    const intent = formData.get("intent");
    const projectId = params.id;
    if (!projectId) return json({ error: "Missing project id" }, { status: 400 });
    if (intent === "refresh") {
        await fetchAndReplaceCommits(projectId);
        return redirect(`/dashboard/projects/${projectId}`); // back to first page
    }
    return json({ ok: true });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
    const session = await requireUserSession(request);
    const projectId = params.id;
    if (!projectId) throw new Response("Project ID required", { status: 400 });
    const url = new URL(request.url);
    const pageParam = url.searchParams.get("page");
    const page = Math.max(1, Number(pageParam) || 1);
    const pageSize = DEFAULT_PAGE_SIZE; // could allow override

    // Fetch project first to validate existence (we don't want to stream a 404 late)
    const project = await prisma.project.findUnique({
        where: { id: projectId, userId: session.userId },
    });
    if (!project) throw new Response("Project not found", { status: 404 });

    // Stream commits separately so the UI can render project shell immediately.
    const commitPagePromise = pollCommits(projectId, page, pageSize);

    return defer({ project, commitPage: commitPagePromise, page, pageSize });
}

// Simple skeleton components
function CommitsSkeleton({ count = 5 }: { count?: number }) {
    return (
        <div className="space-y-6">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex items-start gap-4 animate-pulse">
                    <div className="w-9 h-9 rounded-full bg-zinc-300 dark:bg-zinc-800" />
                    <div className="flex-1 space-y-2">
                        <div className="h-3 w-40 bg-zinc-300 dark:bg-zinc-800 rounded" />
                        <div className="h-3 w-64 bg-zinc-300 dark:bg-zinc-800 rounded" />
                        <div className="h-3 w-52 bg-zinc-300 dark:bg-zinc-800 rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function ProjectDetailsRoute() {
    const data = useLoaderData<typeof loader>();
    const { project } = data as any;
    const initialPage = (data as any).page as number | undefined;
    const [question, setQuestion] = useState("");
    const [open, setOpen] = useState(false);
    const submit = useSubmit(); // still used for refresh form
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    function goToPage(p: number) {
        // We only know current page once commitPage resolves; optimistic guard using URLSearchParams
        const current = Number(searchParams.get("page") || initialPage || 1);
        if (p < 1 || p === current) return; // guard
        const sp = new URLSearchParams(searchParams);
        if (p <= 1) sp.delete("page"); else sp.set("page", String(p));
        navigate(`?${sp.toString()}`);
    }

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
                        {project.description || "No description provided."}
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
                    <Form method="post">
                        <input type="hidden" name="intent" value="refresh" />
                        <button className="flex items-center gap-1 px-2.5 py-1.5 dark:bg-white dark:text-black dark:hover:bg-zinc-200 bg-zinc-950 text-white hover:bg-zinc-900 rounded-md text-sm font-semibold transition">
                            <p>Refresh Commits</p>
                        </button>
                    </Form>
                </div>
                <Suspense fallback={<div className="bg-zinc-100 dark:bg-zinc-900 shadow-sm shadow-zinc-400 dark:shadow-none rounded-md mt-3 h-auto overflow-hidden pr-4 px-4 py-4"><CommitsSkeleton /></div>}>
                    <Await resolve={data.commitPage} errorElement={<p className="text-sm text-red-500 mt-3">Failed to load commits. (Or the quota has been exceeded, please try again later.)</p>}>
                        {(commitPage: { commits: any[]; total: number; page: number; pageSize: number; totalPages: number }) => {
                            const { commits, total, page, totalPages } = commitPage;
                            return (
                                <>
                                    <div className="bg-zinc-100 dark:bg-zinc-900 shadow-sm shadow-zinc-400 dark:shadow-none rounded-md mt-3 h-auto overflow-auto pr-4 space-y-6 px-4 py-4">
                                        {commits.length === 0 ? (
                                            <p className="text-muted-foreground">No commits found.</p>
                                        ) : (
                                            commits.map((commit) => (
                                                <div key={commit.commitHash} className="flex items-center">
                                                    <div className="flex items-start gap-4">
                                                        <div className="w-9 h-9 flex items-center justify-center shrink-0 mt-1">
                                                            {commit.authorAvatarUrl && (
                                                                <img
                                                                    src={commit.authorAvatarUrl}
                                                                    alt={commit.authorName}
                                                                    className="w-9 h-9 rounded-full object-cover"
                                                                />
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2 text-sm mb-1">
                                                                <Link to={commit.authorUrl ?? ''} target="_blank" className="font-semibold" rel="noreferrer">{commit.authorName || "Unknown Author"}</Link>
                                                                <Link to={commit.commitUrl ?? ''} target="_blank" className="text-muted-foreground" rel="noreferrer">committed</Link>
                                                                <time dateTime={commit.committedAt} className="text-muted-foreground uppercase">
                                                                    @{new Date(commit.committedAt || "").toISOString()}
                                                                </time>
                                                            </div>
                                                            <p className="text-sm line-clamp-3 tracking-tight font-medium">{commit.commitMessage}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    {totalPages > 1 && (
                                        <div className="flex items-center justify-between mt-4 text-sm font-medium">
                                            <p>Showing page {page} of {totalPages} ({total} commits)</p>
                                            <div className="flex gap-2">
                                                <button type="button" disabled={page === 1} onClick={() => goToPage(page - 1)} className="px-2 py-1 rounded disabled:opacity-40 bg-zinc-200 dark:bg-zinc-800">Prev</button>
                                                <button type="button" disabled={page === totalPages} onClick={() => goToPage(page + 1)} className="px-2 py-1 rounded disabled:opacity-40 bg-zinc-200 dark:bg-zinc-800">Next</button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            );
                        }}
                    </Await>
                </Suspense>
            </div>
        </div>
    );
}
