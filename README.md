<div align="center">

# GitTalk (Local Single‑User Edition)

Local-first GitHub repository research, semantic search & LLM augmentation using **Remix + Prisma (SQLite) + LangChainJS + Qdrant**. This branch intentionally targets a single developer on a single machine: **no auth flow, no multi-user complexity, fast iteration**.

</div>

---

## ✨ Feature Highlights

- Zero-auth single-user mode (simpler mental model; everything is “your data”).
- Project ingestion: add a GitHub repo → fetch metadata, commits, and document content.
- Incremental vector indexing (Qdrant) for semantic retrieval / RAG.
- Pluggable LLM + embedding providers (Gemini, OpenAI-compatible, Ollama local, Weaviate client present, etc.).
- Commit + content summarization pipeline (extensible via LangChain graph patterns).
- Dynamic environment/credential management (UI dialog) stored in DB (not `.env`) for hot-swapping keys without restart.
- Modular server layer (`*.server.ts`) separated from Remix route UI.
- Tailwind + shadcn-inspired primitives + custom Sidebar for a clean, responsive dashboard.

---

## 🧱 Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| Web Framework | Remix (Vite dev) | File-based routes + loaders/actions |
| DB / ORM | SQLite + Prisma | Custom client output in `generated/prisma` |
| Vector Store | Qdrant | Local Docker or remote; collection name configurable |
| LLM / Embeddings | LangChainJS integrations | Gemini, OpenAI-style, Ollama, etc. (choose at runtime) |
| UI | TailwindCSS + shadcn/ui components | Some custom wrappers and layout components |
| Icons | Lucide / react-icons | Lightweight iconography |
| Tooling | TypeScript, ESLint | Dev-time safety |

---

## 🗂 Project Structure

```
app/
  components/            # UI primitives & layout (sidebar, navbar, theme)
  routes/                # Remix route modules (UI + loader/action)
  models/                # Server-only logic (Prisma queries, integrations, LLM pipeline)
  lib/                   # Utilities (helpers, cn, etc.)
  hooks/                 # Reusable React hooks
generated/prisma/        # Generated Prisma Client (custom output path)
prisma/                  # Schema & migrations (SQLite WAL enabled pragmas)
public/                  # Static assets
qdrant_data/             # Qdrant persistent volume (if mapped)
```

---

## 🚀 Quick Start

```powershell
git clone <repo-url>
cd GitTalk_V2
npm install

# (Optional) clean previous generated client (Windows PowerShell)
Remove-Item -Recurse -Force generated/prisma -ErrorAction SilentlyContinue

# Apply migrations & generate client
npx prisma migrate dev --name init

# Start dev server
npm run dev
```

Open http://localhost:5173 (or the printed port).

---

## 🔐 Auth Model

No sessions, cookies or user table retained. All operations implicitly belong to the single local user. Converting to multi-user later would involve reintroducing a `User` model, sessions, and scoping queries by `userId`.

---

## ⚙️ Configuration & Credentials

### 1. Static `.env` (loaded once at process start)
Create `.env` for baseline config:

```
DATABASE_URL="file:./dev.db"
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=
COLLECTION_NAME=gittalk_local
GEMINI_API_KEY=
GITHUB_ACCESS_TOKEN=
```

### 2. Dynamic Env Vars (Runtime Editable)
The **Settings → Env Vars** dialog persists key/value pairs in the `EnvVar` table (SQLite). They are **not** injected into `process.env`; fetch them when needed:

```ts
import { requireEnvVar, pickEnvVars } from "~/models/envVar.server";

const token = await requireEnvVar("GITHUB_TOKEN");       // throws if missing
const { GEMINI_API_KEY } = await pickEnvVars(["GEMINI_API_KEY"]); // optional fetch
```

Why two layers?
* `.env`: boot-time, stable infrastructure settings.
* DB-backed vars: hot-swappable credentials (no server restart) useful for rotating tokens, trying different providers, or sandbox accounts.

Export button in dialog creates a snapshot file you can manually merge into `.env` if desired.

Security (current local mode): plaintext in SQLite, no masking. For production you’d add encryption, masking, access control & audit logs.

---

## 🧬 Ingestion & RAG Pipeline (Conceptual)

1. User registers a project with a GitHub URL.
2. GitHub data layer (Octokit) fetches repo metadata, commits, file contents.
3. Documents are chunked & embedded (provider configurable) → vectors upserted into Qdrant (`collectionName`).
4. Commit summaries / semantic metadata optionally generated with LLM (Gemini / other providers through LangChain wrappers).
5. Q&A / retrieval flows query Qdrant + reconstruct context.
6. LLM answer generation merges retrieved context with user prompt.

Extensibility hooks:
* Swap embedding model provider (e.g., Gemini vs Ollama local embeddings) without schema changes.
* Introduce a queue for background summarization (see Roadmap) when latency grows.

---

## 🛠 Common Commands

| Task | Command |
|------|---------|
| Generate Prisma Client | `npx prisma generate` |
| New Migration | `npx prisma migrate dev --name <name>` |
| DB UI Studio | `npx prisma studio` |
| Start Dev Server | `npm run dev` |
| Type Check | `npm run typecheck` |
| Lint | `npm run lint` |

Windows lock issues? Delete `generated/prisma` then re-run `npx prisma generate`.

---

## 🧩 Architecture Notes

* Server-only modules end in `.server.ts` to keep them out of the client bundle.
* SQLite pragmas applied at startup for better WAL concurrency.
* `EnvVar` cache (1 minute) prevents excessive DB lookups while keeping keys hot-swappable.
* Vector operations isolated so future Weaviate / Pinecone swaps need minimal changes.
* Use incremental re-indexing instead of full wipes when scaling (future enhancement).

---

## 🔍 Choosing / Using LLM & Embedding Providers

Installed packages allow:
* Gemini (`@google/generative-ai`, `@langchain/google-genai`)
* OpenAI-compatible (`@langchain/openai`) – supply `OPENAI_API_KEY` via dynamic env or `.env`.
* Ollama local models (`@langchain/ollama`) – run Ollama daemon, set model name in code / config.
* Weaviate / Other vector backends packages present for experimentation.

Pattern example:
```ts
const { GEMINI_API_KEY } = await pickEnvVars(["GEMINI_API_KEY"]);
// Fallback to process.env if not set dynamically
const apiKey = GEMINI_API_KEY || process.env.GEMINI_API_KEY;
```

---

## 🧪 Testing & Validation (Manual Focus Right Now)

No formal test suite bundled yet. Recommended next steps:
1. Introduce unit tests for ingestion + env var helpers.
2. Add smoke test for critical loader/action pairs.

---

## 🔐 Security & Limitations (Local Mode Assumptions)

| Aspect | Current | Production Consideration |
|--------|---------|--------------------------|
| Auth | None | Add user model + sessions |
| Secrets Storage | Plaintext in SQLite | Encrypt + mask + RBAC |
| Rate Limiting | None | Add per-user / token limits |
| Audit | None | Change/event logging |
| Multi-Tenancy | Single process | Per-user scoping + isolation |

---

## 🗺 Roadmap (Updated)

Planned / Open:
- [ ] Landing page polish & marketing copy
- [ ] Project list filtering / sorting / search
- [ ] Commit diff view + semantic summarization inline
- [ ] Vector search / Q&A UI surface (expose retrieval results visually)
- [ ] Background summarization / indexing queue
- [ ] Branch selection (currently implicit default branch)
- [ ] Environment validation pre-flight (fail fast on missing critical keys)
- [ ] Optional encryption layer for `EnvVar`
- [ ] Model/provider selection UI (per query or per project)

Recently Completed:
- [x] Single-user simplification & session removal
- [x] Dynamic EnvVar management dialog (CRUD + export)
- [x] Settings UI refactor & beautification
- [x] GitHub URL validation & ingestion pipeline base

---

## 🩺 Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `database is locked` (SQLite) | Another Node process open | Kill stray `node.exe` / stop dev server then retry migrate |
| Missing `envVar` delegate | Client not regenerated | `npx prisma generate` |
| Empty vector results | Collection missing or no embeddings | Confirm `COLLECTION_NAME` & ingestion completed |
| GitHub rate limit | No/low-scope token | Add `GITHUB_ACCESS_TOKEN` dynamically or to `.env` |
| Qdrant connection error | Container not running / wrong URL | Verify Docker & `QDRANT_URL` |

---

## 📚 References

- Remix Docs: https://remix.run/docs
- Prisma: https://www.prisma.io/docs
- LangChainJS: https://js.langchain.com
- Qdrant: https://qdrant.tech /
- Gemini API: https://ai.google.dev

---

## 🤝 Contributing
PRs welcome if they preserve the single-user assumption. If proposing multi-user changes, include a migration path & security notes.

---

Happy hacking!