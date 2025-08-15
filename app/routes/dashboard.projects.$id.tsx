// dashboard.projects.$id.tsx
import { useLoaderData, Link, Await, useFetcher, Form, useRevalidator } from "@remix-run/react";
import { Textarea } from "~/components/ui/textarea";
import { FaCodeCommit } from "react-icons/fa6";
import { ScrollArea } from "~/components/ui/scroll-area";
import { json, LoaderFunctionArgs, ActionFunctionArgs, defer } from "@remix-run/node";
import { refreshCommitsWithRateLimit, getCommitsPageFromDB, RateLimitError } from "~/models/github.server";
import { FiExternalLink } from "react-icons/fi";
import { useEffect, useRef, useState, Suspense } from "react"; import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "~/components/ui/dialog"
import { Pencil, X } from "lucide-react";
import { ensureLocalUser } from "~/models/user.server";
import { prisma } from "~/db.server";

export async function action({ request, params }: ActionFunctionArgs) {
    const formData = await request.formData();
    const intent = formData.get("intent");
    const projectId = params.id;
    if (!projectId) return json({ error: "Missing project id" }, { status: 400 });
    const user = await ensureLocalUser();
    if (intent === "refresh") {
        try {
            const { commits, newCount } = await refreshCommitsWithRateLimit(projectId);
            return json({ ok: true, newCount, count: commits.length });
        } catch (e) {
            if (e instanceof RateLimitError) {
                return json({ error: `Too many refreshes. Try again in ${Math.ceil(e.retryAfterMs / 1000)}s.`, retryAfterMs: e.retryAfterMs }, { status: 429 });
            }
            return json({ error: "Refresh failed" }, { status: 500 });
        }
    }
    if (intent === "update-description") {
        const description = (formData.get("description") ?? "").toString();
        // Ensure ownership
    const proj = await prisma.project.findFirst({ where: { id: projectId, userId: user.id }, select: { id: true } });
        if (!proj) return json({ error: "Project not found" }, { status: 404 });
        await prisma.project.update({ where: { id: projectId }, data: { description } });
        // Return projectId so the client can ignore late responses for other projects
        return json({ ok: true, description, projectId });
    }
    return json({ ok: true });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
    const user = await ensureLocalUser();
    const projectId = params.id;
    if (!projectId) throw new Response("Project ID required", { status: 400 });

    // Fetch project first to validate existence (we don't want to stream a 404 late)
    const project = await prisma.project.findFirst({
    where: { id: projectId, userId: user.id },
        include: { repo: true },
    });
    if (!project) throw new Response("Project not found", { status: 404 });

    const url = new URL(request.url);
    const pageParam = url.searchParams.get("page");
    let page = Number.parseInt(pageParam || "1", 10);
    if (Number.isNaN(page) || page < 1) page = 1;
    const PAGE_SIZE = 25;

    // Count total commits stored
    let totalCount = await prisma.repoCommit.count({ where: { repoId: project.repoId } });

    // If none stored yet, attempt a refresh (rate limited) to populate
    if (totalCount === 0) {
        try {
            await refreshCommitsWithRateLimit(projectId);
            totalCount = await prisma.repoCommit.count({ where: { repoId: project.repoId } });
        } catch { /* ignore rate limit / errors */ }
    }

    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    if (page > totalPages) page = totalPages; // clamp to valid range

    // Stream only the requested page (keeps response light)
    const commitsPromise: Promise<any[]> = getCommitsPageFromDB(projectId, page, PAGE_SIZE);

    return defer({ project, commits: commitsPromise, page, totalPages, totalCount, pageSize: PAGE_SIZE });
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
    const data = useLoaderData<typeof loader>() as { project: any; commits: Promise<any[]> | any[]; page: number; totalPages: number; totalCount: number; pageSize: number };
    const { project } = data;
    const revalidator = useRevalidator();
    const [question, setQuestion] = useState("");
    const [open, setOpen] = useState(false);
    // Refresh dialog
    const [refreshOpen, setRefreshOpen] = useState(false);
    const [refreshMode, setRefreshMode] = useState<"confirm" | "result">("confirm");
    const refreshFetcher = useFetcher<{ ok?: boolean; newCount?: number; count?: number; error?: string }>();
    const onRefreshClick = () => {
        setRefreshMode("confirm");
        setRefreshOpen(true);
    };
    const onConfirmRefresh = () => {
        refreshFetcher.submit({ intent: "refresh" }, { method: "post" });
        setRefreshMode("result");
    };
    // When refresh completes, revalidate to update commits list
    useEffect(() => {
        if (refreshFetcher.state === "idle" && refreshFetcher.data) {
            revalidator.revalidate();
        }
    }, [refreshFetcher.state, refreshFetcher.data, revalidator]);
    // Description editing with optimistic UI
    const [desc, setDesc] = useState<string>(project.description ?? "");
    const [isEditingDesc, setIsEditingDesc] = useState(false);
    const [descDraft, setDescDraft] = useState<string>(project.description ?? "");
    const prevDescRef = useRef(desc);
    // Track which project we submitted for to avoid cross-project updates
    const lastEditedProjectIdRef = useRef<string | null>(null);
    const descFetcher = useFetcher<{ ok?: boolean; description?: string; error?: string; projectId?: string }>();
    // Autosave: debounce submissions while typing
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastSubmittedDescRef = useRef<string>(desc);
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
    const [saveError, setSaveError] = useState<string | null>(null);

    const scheduleAutoSave = (value: string) => {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        setSaveStatus("saving");
        debounceTimerRef.current = setTimeout(() => {
            const fd = new FormData();
            fd.append("intent", "update-description");
            fd.append("description", value);
            lastSubmittedDescRef.current = value;
            lastEditedProjectIdRef.current = project.id;
            descFetcher.submit(fd, { method: "post" });
        }, 600);
    };
    // When project changes (same route, different param), reset local state to avoid stale description showing
    useEffect(() => {
        setDesc(project.description ?? "");
        setDescDraft(project.description ?? "");
        setIsEditingDesc(false);
        // Clear any previous optimistic backup since it's a different project
        prevDescRef.current = project.description ?? "";
        // Also forget any last edited project so late responses are ignored unless matching
        lastEditedProjectIdRef.current = null;
        setSaveStatus("idle");
        setSaveError(null);
    }, [project.id]);
    useEffect(() => {
        if (descFetcher.state === "idle" && descFetcher.data) {
            const responseProjectId = descFetcher.data.projectId;
            // Only apply if this response corresponds to the current project view
            if (responseProjectId && responseProjectId !== project.id) return;
            if (descFetcher.data.error) {
                // revert on error, but only if the error is for the current project
                setSaveStatus("error");
                setSaveError(descFetcher.data.error);
            } else if (descFetcher.data.description !== undefined) {
                // Only update if it matches the last submitted draft; otherwise keep the user's current typing
                if (descFetcher.data.description === lastSubmittedDescRef.current) {
                    setDesc(descFetcher.data.description);
                }
                setSaveStatus("saved");
                setSaveError(null);
                // Revalidate parents so project lists reflect the updated description
                revalidator.revalidate();
            }
        }
    }, [descFetcher.state, descFetcher.data]);

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setOpen(true);
    }

    return (
        <div key={project.id}>
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
                    <div className="flex items-start justify-between gap-2">
                        <h1 className="text-lg font-semibold mb-1">{project.projectName}</h1>
                        {!isEditingDesc ? (
                            <button title="Edit description" onClick={() => { setDescDraft(desc ?? ""); setIsEditingDesc(true); }} className="p-1 mr-3 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800">
                                <Pencil className="w-4 h-4" />
                            </button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                    {saveStatus === "saving" && "Saving…"}
                                    {saveStatus === "saved" && "Auto-saved"}
                                    {saveStatus === "error" && <span className="text-red-500">Save failed</span>}
                                </span>
                                <button title="Close" onClick={() => { setIsEditingDesc(false); }} className="p-1 mr-3 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                    {!isEditingDesc ? (
                        <ScrollArea className="font-medium text-muted-foreground text-sm h-44 overflow-auto pr-4 text-justify">
                            {desc?.trim() ? desc : "No description provided."}
                        </ScrollArea>
                    ) : (
                        <div className="pr-4">
                            <Textarea
                                value={descDraft}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setDescDraft(val);
                                    // Optimistic update visible immediately
                                    setDesc(val);
                                    scheduleAutoSave(val);
                                }}
                                className="bg-white dark:bg-zinc-950 rounded-md h-32 w-full"
                            />
                            {saveError && (
                                <p className="text-xs text-red-500 mt-1">{saveError}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <div className="mt-3">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <FaCodeCommit className="w-7 h-7" />
                        <h1 className="font-semibold text-xl">Recent Commits</h1>
                        <Link to={project.repo.githubUrl} target="_blank" className="font-medium text-sm lowercase hover:underline flex items-center gap-1 ml-1" rel="noreferrer">
                            <p>Visit Repository</p>
                            <FiExternalLink className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                    <button onClick={onRefreshClick} className="flex items-center gap-1 px-2.5 py-1.5 dark:bg-white dark:text-black dark:hover:bg-zinc-200 bg-zinc-950 text-white hover:bg-zinc-900 rounded-md text-sm font-semibold transition">
                        <p>Refresh Commits</p>
                    </button>
                </div>
                <Dialog open={refreshOpen} onOpenChange={setRefreshOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Refresh commits</DialogTitle>
                            {refreshMode === "confirm" ? (
                                <DialogDescription>
                                    This will fetch from GitHub and replace the latest 25 commits for this project.
                                    <div className="mt-3 flex justify-end gap-2">
                                        <button onClick={() => setRefreshOpen(false)} className="px-2 py-0.5 text-xs shadow-sm dark:shadow-none hover:shadow-md shadow-zinc-400 hover:shadow-zinc-400 dark:bg-zinc-800 border dark:hover:border-zinc-700 rounded-md font-semibold duration-150">Cancel</button>
                                        <button onClick={onConfirmRefresh} className="px-3 py-2 text-xs font-semibold bg-green-600 shadow-sm hover:shadow-md hover:shadow-green-500 shadow-green-500 text-white rounded-md duration-150">Confirm</button>
                                    </div>
                                </DialogDescription>
                            ) : (
                                <DialogDescription>
                                    {refreshFetcher.state === "submitting" && "Refreshing…"}
                                    {refreshFetcher.state === "idle" && refreshFetcher.data && (
                                        refreshFetcher.data.error
                                            ? refreshFetcher.data.error
                                            : (refreshFetcher.data.newCount ?? 0) > 0
                                                ? `${refreshFetcher.data.newCount} commit(s) refreshed.`
                                                : "No new commits."
                                    )}
                                    <div className="mt-3 flex justify-end">
                                        <button onClick={() => setRefreshOpen(false)} className="px-2 py-1 rounded bg-zinc-950 text-white dark:bg-white dark:text-black">Close</button>
                                    </div>
                                </DialogDescription>
                            )}
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
                <Suspense fallback={<div className="bg-zinc-100 dark:bg-zinc-900 shadow-sm shadow-zinc-400 dark:shadow-none rounded-md mt-3 h-auto overflow-hidden pr-4 px-4 py-4"><CommitsSkeleton /></div>}>
                    <Await resolve={data.commits} errorElement={<p className="text-sm text-red-500 mt-3">Failed to load commits.</p>}>
                        {(commits: any[]) => (
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
                                {/* Pagination Controls */}
                                <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                                    <p className="text-xs text-muted-foreground">Page {data.page} of {data.totalPages} • Showing {(commits.length > 0) ? ((data.page - 1) * data.pageSize + 1) : 0}-{(data.page - 1) * data.pageSize + commits.length} of {data.totalCount}</p>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            to={`?page=${data.page - 1}`}
                                            prefetch="intent"
                                            className={`px-2 py-1 rounded text-xs font-medium border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition ${data.page === 1 ? 'pointer-events-none opacity-50' : ''}`}
                                        >Prev</Link>
                                        <div className="flex items-center gap-1">
                                            {/* Show up to 5 page buttons around current */}
                                            {Array.from({ length: data.totalPages }, (_, i) => i + 1)
                                                .filter(p => (p === 1) || (p === data.totalPages) || (Math.abs(p - data.page) <= 2))
                                                .reduce<(number | 'ellipsis')[]>((acc, p, idx, arr) => {
                                                    if (idx === 0) return [p];
                                                    const prev = arr[idx - 1];
                                                    if (typeof prev === 'number' && p - prev > 1) acc.push('ellipsis');
                                                    acc.push(p);
                                                    return acc;
                                                }, [])
                                                .map((p, idx) => p === 'ellipsis' ? (
                                                    <span key={`e-${idx}`} className="px-2 py-1 text-xs text-muted-foreground">…</span>
                                                ) : (
                                                    <Link
                                                        key={p}
                                                        to={`?page=${p}`}
                                                        prefetch="intent"
                                                        className={`px-2 py-1 rounded text-xs font-medium border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition ${p === data.page ? 'bg-zinc-200 dark:bg-zinc-800' : ''}`}
                                                    >{p}</Link>
                                                ))}
                                        </div>
                                        <Link
                                            to={`?page=${data.page + 1}`}
                                            prefetch="intent"
                                            className={`px-2 py-1 rounded text-xs font-medium border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition ${data.page >= data.totalPages ? 'pointer-events-none opacity-50' : ''}`}
                                        >Next</Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Await>
                </Suspense>
            </div>
        </div>
    );
}