// ---------------------------------------------------------------------------
// Settings Page
// Enhanced UI + Local EnvVar management.
// Storage Mechanism:
//  - Env vars are persisted in SQLite via the Prisma model `EnvVar` (id, key, value, timestamps)
//  - They are NOT auto-injected into process.env. This avoids server restarts & keeps a clear boundary.
//  - Access patterns:
//      * Direct: prisma.envVar.findMany / findUnique
//      * Helper: functions in models/envVar.server.ts (getEnvMap, pickEnvVars, requireEnvVar)
//  - Recommended usage for LLM/GitHub/APIs: fetch the needed keys just-in-time (e.g. inside loader/action
//    or model initialization) instead of relying on process.env so changes are dynamic.
//  - Export: you can export a snapshot file for reference (.env-style) via the Export button.
// ---------------------------------------------------------------------------

import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
import { useState, useEffect } from "react";
import { prisma } from "~/db.server";
import { invalidateEnvCache } from "~/models/envVar.server";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "~/components/ui/dialog";
import { Separator } from "~/components/ui/separator";
import { Download } from "lucide-react";

type EnvVarDTO = { id: string; key: string; value: string; createdAt: string; updatedAt: string };

export async function loader(_: LoaderFunctionArgs) {
    const envVars = await prisma.envVar.findMany({ orderBy: { createdAt: "asc" } });
    return json({ username: "Local User", email: "local-mode", id: "local-user", envVars });
}

export async function action({ request }: ActionFunctionArgs) {
    const form = await request.formData();
    const intent = form.get("intent");

    if (intent === "create-env") {
        const key = (form.get("key") || "").toString().trim();
        const value = (form.get("value") || "").toString();
        if (!key) return json({ error: "Key required" }, { status: 400 });
        if (key.length > 100) return json({ error: "Key too long" }, { status: 400 });
        if (value.length > 10_000) return json({ error: "Value too long" }, { status: 400 });
        try {
            const created = await prisma.envVar.create({ data: { key, value } });
            invalidateEnvCache();
            return json({ ok: true, created });
        } catch (e: any) {
            if (e.code === "P2002") return json({ error: "Key already exists" }, { status: 400 });
            return json({ error: "Failed to create" }, { status: 500 });
        }
    }
    if (intent === "update-env") {
        const id = (form.get("id") || "").toString();
        const value = (form.get("value") || "").toString();
        if (!id) return json({ error: "Missing id" }, { status: 400 });
        if (value.length > 10_000) return json({ error: "Value too long" }, { status: 400 });
        try {
            const updated = await prisma.envVar.update({ where: { id }, data: { value } });
            invalidateEnvCache();
            return json({ ok: true, updated });
        } catch {
            return json({ error: "Failed to update" }, { status: 500 });
        }
    }
    if (intent === "delete-env") {
        const id = (form.get("id") || "").toString();
        if (!id) return json({ error: "Missing id" }, { status: 400 });
        try {
            await prisma.envVar.delete({ where: { id } });
            invalidateEnvCache();
            return json({ ok: true, deleted: id });
        } catch {
            return json({ error: "Failed to delete" }, { status: 500 });
        }
    }
    return json({ error: "Unknown action" }, { status: 400 });
}

export default function SettingsPage() {
    const data = useLoaderData<typeof loader>();
    const fetcher = useFetcher();
    const [open, setOpen] = useState(false);
    const [newKey, setNewKey] = useState("");
    const [newValue, setNewValue] = useState("");
    const [editing, setEditing] = useState<string | null>(null);
    const envVars = ((fetcher.data as any)?.envVars || (data as any).envVars) as EnvVarDTO[];

    // Refresh after mutation
    useEffect(() => {
        if (fetcher.state === "idle" && ((fetcher.data as any)?.ok || (fetcher.data as any)?.error)) {
            fetcher.load("/dashboard/settings?index");
        }
    }, [fetcher.state]);

    const submit = (fd: FormData) => fetcher.submit(fd, { method: "post" });

    const createEnv = () => {
        if (!newKey.trim()) return;
        const fd = new FormData();
        fd.append("intent", "create-env");
        fd.append("key", newKey.trim());
        fd.append("value", newValue);
        submit(fd);
        setNewKey("");
        setNewValue("");
    };
    const updateEnv = (id: string, value: string) => {
        const fd = new FormData();
        fd.append("intent", "update-env");
        fd.append("id", id);
        fd.append("value", value);
        submit(fd);
    };
    const deleteEnv = (id: string) => {
        const fd = new FormData();
        fd.append("intent", "delete-env");
        fd.append("id", id);
        submit(fd);
    };
    const downloadEnv = () => {
        const contents = envVars.map(v => `${v.key}=${JSON.stringify(v.value)}`).join("\n");
        const blob = new Blob([contents], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'env.export.local';
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-5xl mx-auto py-10 px-4 space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage local dev credentials & metadata for LLM + API pipelines.</p>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="gap-1">Env Vars <span className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-foreground/80">{envVars.length}</span></Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Environment Variables (Local)</DialogTitle>
                            <DialogDescription>
                                Stored in DB table <code className="text-xs bg-muted px-1 py-0.5 rounded">EnvVar</code>. Access dynamically via helpers; not injected into <code>process.env</code>.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6">
                            <div className="rounded-lg border bg-card shadow-sm">
                                <div className="p-4 border-b flex flex-row gap-3 sm:flex-row sm:items-start">
                                    <div className="flex flex-row">
                                        <div className="flex flex-col gap-2 w-full sm:w-1/3">
                                            <Input placeholder="KEY" value={newKey} onChange={e => setNewKey(e.target.value.toUpperCase())} className="font-mono" />
                                        </div>
                                        <div className="flex-1 flex flex-col gap-2">
                                            <Input placeholder="Value" value={newValue} onChange={e => setNewValue(e.target.value)} className="font-mono" />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button type="button" onClick={createEnv} disabled={!newKey.trim()}>Add</Button>
                                        <Button type="button" variant="outline" onClick={() => { setNewKey(""); setNewValue(""); }} disabled={!newKey && !newValue}>Reset</Button>
                                    </div>
                                </div>
                                <div className="divide-y max-h-96 overflow-auto">
                                    {envVars.length === 0 && (
                                        <p className="text-sm text-muted-foreground p-4">No keys stored yet.</p>
                                    )}
                                    {envVars.map(v => {
                                        const isEditing = editing === v.id;
                                        return (
                                            <div key={v.id} className="group p-4 flex flex-col gap-3">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="font-mono text-[11px] py-0.5 px-1.5 rounded bg-muted/60 border border-border">{v.key}</span>
                                                    <span className="text-[10px] text-muted-foreground">Updated {new Date(v.updatedAt).toLocaleString()}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    {isEditing ? (
                                                        <Textarea
                                                            autoFocus
                                                            className="w-full font-mono text-xs"
                                                            defaultValue={v.value}
                                                            rows={4}
                                                            onBlur={(e) => { updateEnv(v.id, e.target.value); setEditing(null); }}
                                                        />
                                                    ) : (
                                                        <pre className="text-[11px] leading-snug whitespace-pre-wrap break-all bg-muted/40 rounded p-2 border border-transparent group-hover:border-border transition-colors max-h-40 overflow-auto cursor-text" onClick={() => setEditing(v.id)}>
                                                            {v.value || "<empty>"}
                                                        </pre>
                                                    )}
                                                </div>
                                                <div className="flex gap-2 self-end">
                                                    <Button type="button" variant="outline" size="sm" onClick={() => setEditing(isEditing ? null : v.id)}>{isEditing ? "Cancel" : "Edit"}</Button>
                                                    <Button type="button" variant="destructive" size="sm" onClick={() => deleteEnv(v.id)}>Delete</Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                            <div className="space-y-2 text-xs text-muted-foreground leading-relaxed bg-muted/30 rounded-md p-4">
                                <p className="font-semibold text-foreground">Usage Patterns</p>
                                <ul className="list-disc pl-4 space-y-1">
                                    <li>Required: <code className="bg-background px-1 py-0.5 rounded">await requireEnvVar("GITHUB_TOKEN")</code></li>
                                    <li>Subset: <code className="bg-background px-1 py-0.5 rounded">const {`{ GEMINI_API_KEY }`} = await pickEnvVars(["GEMINI_API_KEY"])</code></li>
                                    <li>LLM: Fetch provider key per request (hot reload of creds without restart).</li>
                                    <li>GitHub: <code className="bg-background px-1 py-0.5 rounded">new Octokit({`{ auth: token }`})</code></li>
                                </ul>
                                <Separator className="my-2" />
                                <p className="font-semibold text-foreground">Security</p>
                                <p>Plain text storage for local development only. Add encryption + rotation for production.</p>
                            </div>
                        </div>
                        <DialogFooter className="sm:justify-between">
                            <DialogClose asChild>
                                <Button variant="outline">Close</Button>
                            </DialogClose>
                            <Button type="button" variant="secondary" onClick={downloadEnv} className="gap-1"><Download className="h-4 w-4" /> Export</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>Static demo user (local-only mode).</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-muted-foreground space-y-1">
                        <p>Name: <span className="font-medium">{data.username}</span></p>
                        <p>Email: <span className="font-medium">{data.email}</span></p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
