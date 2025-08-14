## Some Awesome Stuff:

- [ChunkViz v0.1](https://chunkviz.up.railway.app/)
- [CodeSplitter](https://js.langchain.com/docs/how_to/code_splitter/)

## Route Configuration
- [Nested Routes (segmenting routes)](https://remix.run/docs/en/main/discussion/routes#what-is-nested-routing)

## [Prisma ORM](https://www.prisma.io/docs/getting-started/quickstart-sqlite) - [Getting Started](https://www.prisma.io/docs/getting-started)

**Important**: You need to re-run the prisma generate command after every change that's made to your Prisma schema to update the generated Prisma Client code.

```shell
# Install and initialize Prisma
npm install prisma --save-dev

npx prisma init --datasource-provider sqlite --output ../generated/prisma
```

1. Model your data in the generated Prisma schema.
2. Run a migration to create your database tables with Prisma Migrate (At this point, you have a Prisma schema but no database yet. Run the following command in your terminal to create the SQLite database)

```shell
npx prisma generate
npx prisma migrate dev --name init
```

```shell
# If making changes to the Prisma schema
npx prisma db push
# or
npx prisma migrate dev --name remove_repo_url
```

Ensure to keep client in the Prisma schema or while generating the Prisma Client.

## [Sessions](https://remix.run/docs/en/main/utils/sessions#using-sessions)

## TODOs

High Priority - HP, Medium Priority - MP, Low Priority - LP

1. Landing Page - LP
2. Registration and Logout (1/2 done). Work on Error handling - MP
3. Project CRUD operations (file created. Testing functions). Work on form submission and display projects - MP
4. Fill Dashboard, Q&A, Meetings with components - LP
5. Lazy Loading and Skeletons, Optimistic UI - HP
6. Work on Data Fetching, where and why to load data in certain route - MP
7. Able to load commits via Octokit, but they're not being saved in DB. In order to update the DB, we can create a update button that will trigger the octokit to fetch the recent commits of the repo and update them in the DB.
8. Add a validator for GitHub repo URL - Done
9. Adding a caching mechanism for the Vector DB

## Performance Tips

1. Use .server.ts suffix for files that touch server-only code like Prisma. That way Remix won't accidentally try to send Prisma into the browser bundle (Performance + security)
2. Since our RepoCommit model has optional summary, we can later build a queue system (like background jobs) to summarize commits when pendingSummary is true (eg - a cron job or background worker)
3. Only Query What You Need ("select" and "include"). Smaller queries = faster database = less memory = faster page loads.
4. Re-ingestion option for vector DB

```tsx
// In your run function or API endpoint for re-ingestion:
async function reIngestProject(
  githubUrl: string,
  userId: string,
  projectId: string
) {
  if (!collection_name) {
    throw new Error("❌ COLLECTION_NAME is missing in .env");
  }

  // 1. Delete all existing points for this project in Qdrant (and cache if desired)
  await deleteProjectFromCollection(projectId); // This will clear old points

  // 2. Load and process the (potentially updated) GitHub documents
  const docs = await loadGithubDocs(githubUrl, userId, projectId);

  // 3. Upsert the new (or re-cached) documents
  await upsertSummarizedDocsToQdrant(docs, collection_name);
  console.log(`✅ Re-ingestion complete for project ${projectId}.`);
}
```

5. Data is being stored in VectorDB even if the Summarization function fails.

## References

- [Input Types](https://www.w3schools.com/html/html_form_input_types.asp)
- [Text-Embeddings](https://ai.google.dev/gemini-api/docs/models#text-embedding)
  - Output dimension size: 768
  - Input token limit: 2,048
  - RL: 1,500 requests per minute
- [Qdrant JS](https://github.com/qdrant/qdrant-js)
- [Weaviate](https://weaviate.io/developers/weaviate/quickstart)

## Issues
#### Credentials are not being loaded from the .env file.

```shell
$ npx prisma migrate dev --name init2
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Datasource "db": SQLite database

Error: P1013: The provided database string is invalid. The scheme is not recognized in database URL. Please refer to the documentation in https://www.prisma.io/docs/reference/database-reference/connection-urls for constructing a correct connection string. In some cases, certain characters must be escaped. Please check the string for any illegal characters.
```

Fix for this: Ensure .env credentials are imported correctly in the working file. If not, add the private token in the working file temporarily.

- When a project is created, the user is redirected to the single project page—but commit summaries are not yet in the DB, so it appears empty.

```shell
$ npx prisma generate
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Error:
EPERM: operation not permitted, rename 'D:\CODING\Remix\GitTalk_V2\generated\prisma\query_engine-windows.dll.node.tmp20224' -> 'D:\CODING\Remix\GitTalk_V2\generated\prisma\query_engine-windows.dll.node'
```
Solution: 'rm -rf generated/prisma' and then 'npx prisma generate'

## Local Setup for Qdrant or any VectorDB
1. Ensure to install dependencies and run the Docker container

```shell
docker pull qdrant/qdrant
docker run -p 6333:6333 -p 6334:6334 -v $(pwd)/qdrant_data:/qdrant/storage qdrant/qdrant
http://localhost:6333/dashboard
```

## [LangChainJS](https://js.langchain.com/docs/introduction/)

- [Chatbot](https://js.langchain.com/docs/tutorials/chatbot/)
- [Memory Chat](https://js.langchain.com/docs/tutorials/chatbot/#managing-conversation-history)

Here’s your checklist and findings formatted in clean Markdown:

---

# Project Audit Report - August

## **Checklist**

* Identify correctness issues (bad imports, type/runtime pitfalls)
* Security and secrets handling
* Build/deploy configuration risks (Prisma, generated assets, envs)
* Data and persistence concerns (SQLite/Prisma usage, migrations)
* UX/performance concerns (streaming, background jobs, loaders)
* Propose specific fixes and quick wins

---

## **Actions Taken**

* **Scanned**: key server, routes, models, config files, and Prisma schema for issues.
* **Fixed**:

  1. Corrected `json`/`redirect` imports to come from `@remix-run/node` in `login.tsx` and `dashboard.projects.createProject.tsx`.
  2. Removed plaintext password logging in `register.tsx`.
  3. Verified no new type/lint errors for edited files.

---

## **Notable Flaws & Fixes**

### **1. Prisma Client Output and Generated Artifacts**

* **Problem**:

  * Prisma client imported from `generated/prisma/client` with generated output committed in repo.
  * Platform-specific engines cause brittleness.
  * `.gitignore` ignores `generated/` but files still tracked — builds may fail on fresh clone.
* **Fix**:

  * Switch back to `@prisma/client` default output.
  * Or keep custom path but add `postinstall: prisma generate` in `package.json`.
  * Remove generated binaries from Git.

---

### **2. SQLite PRAGMA Always Runs**

* **Problem**:

  * `isSQLite` is hard-coded to `true` in `db.server.ts`.
  * PRAGMAs run even if moving to Postgres/MySQL.
* **Fix**:

  * Detect SQLite dynamically:

    ```ts
    const isSQLite = process.env.DATABASE_URL?.startsWith("file:");
    ```
  * Only run PRAGMAs when `isSQLite` is true.

---

### **3. Session Cookie Configuration Not Production-Safe**

* **Problem**:

  * `domain: "localhost"` will break in production.
  * Default `SESSION_SECRET` fallback is insecure.
* **Fix**:

  * Use `process.env.COOKIE_DOMAIN` in production; omit locally.
  * Throw if `SESSION_SECRET` missing in production.

---

### **4. Qdrant Client & Env Handling**

* **Problems**:

  * `COLLECTION_NAME` check conflicts between server and route usage.
  * Cloud/local clients always constructed on module load.
* **Fix**:

  * Export a single validated `COLLECTION_NAME` constant from Qdrant server.
  * Conditionally create clients only if required env vars are present.

---

### **5. Background “Warmup” Fetch**

* **Problem**:

  * `await fetch("http://localhost", { method: "HEAD" })` in background task — fails in production.
* **Fix**:

  * Remove warmup fetch entirely.

---

### **6. GitHub Loader Hard-Coded to "main"**

* **Problem**:

  * Loader will miss repos with default branch `master` or custom names.
* **Fix**:

  * Detect default branch via GitHub API or accept branch as parameter.

---

### **7. Sensitive Data Logging**

* **Problem**:

  * Logged `{ email, password, username }` in `register.tsx`.
* **Fix**:

  * **Already removed**. Never log credentials.

---

### **8. Generated Artifacts & DB Files in Repo**

* **Problem**:

  * Build output, `generated/`, and `prisma/dev.db*` committed.
  * Causes noise and cross-platform issues.
* **Fix**:

  * Remove from history and enforce `.gitignore`.
  * Use migrations or seed scripts instead of shipping DB file.

---

### **9. Node Crypto in Shared Utils**

* **Problem**:

  * `crypto` imported in a file that may run in the browser.
* **Fix**:

  * Move crypto functions to `.server.ts` or conditionally import server-side only.

---

### **10. Octokit Auth/Env Resilience**

* **Problem**:

  * Missing `GITHUB_ACCESS_TOKEN` causes unauthenticated requests and rate limits.
* **Fix**:

  * Throw/warn at startup if missing in production.

---

### **11. Minor Hygiene**

* `dashboard.tsx`: unused `json` import.
* `AppSidebar`: unused `useMatches()` import.
* `bcryptjs-react` unused dependency — remove.
* `qdrant_data;C` path accidental — ignore/remove.

---

## **Security Notes**

* Replace default session secret in production.
* Never log tokens or passwords.
* Validate repository URLs and rate-limit ingestion to avoid abuse.

---

## **Performance & UX**

* Good: Remix `defer` + `Suspense` for progressive rendering.
* Suggestion: Queue background embeddings with a job queue if volume grows.

---

## **Recommended Next Steps**

1. Switch Prisma back to `@prisma/client` or add `postinstall` generate step.
2. Centralize env validation and fail fast in production.
3. Fix SQLite detection in `db.server.ts`.
4. Remove tracked artifacts from Git.
5. Remove warmup fetch & branch hardcode.

---

## **Quality Gates**

* **Typecheck**: ✅ PASS (edited files)
* **Lint**: ⚠ Not run; recommend after cleanup.
* **Build**: Not tested post-change; verify after Prisma config update.
* **Unit Tests**: None present; consider adding minimal server tests.