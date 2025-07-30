## Some Awesome Stuff:
- [ChunkViz v0.1](https://chunkviz.up.railway.app/)
- [CodeSplitter](https://js.langchain.com/docs/how_to/code_splitter/)

## Pending UIs
1. Busy indicators
2. Optimistic UI 
3. Skeleton fallbacks 

## Route Configuration
1. [Nested Routes (segmenting routes)](https://remix.run/docs/en/main/discussion/routes#what-is-nested-routing)

## [Prisma ORM](https://www.prisma.io/docs/getting-started/quickstart-sqlite) - [Getting Started](https://www.prisma.io/docs/getting-started)

__Important__: You need to re-run the prisma generate command after every change that's made to your Prisma schema to update the generated Prisma Client code.

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
9. Adding a caching mechanism  for the Vector DB

## Performance Tips
1. Use .server.ts suffix for files that touch server-only code like Prisma. That way Remix won't accidentally try to send Prisma into the browser bundle (Performance + security)
2. Since our RepoCommit model has optional summary, we can later build a queue system (like background jobs) to summarize commits when pendingSummary is true (eg - a cron job or background worker)
3. Only Query What You Need ("select" and "include"). Smaller queries = faster database = less memory = faster page loads.
4. Re-ingestion option for vector DB
```tsx
// In your run function or API endpoint for re-ingestion:
async function reIngestProject(githubUrl: string, userId: string, projectId: string) {
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

## Application Layout
- __dashboard.tsx__: Loading user and projects using loader function. In loader, checking if the user is authenticated. If not, redirect to login page. If yes, load user and projects. This is where our dashboard layout is defined (Sidebar) and using Outlet to pass the data to child routes 
- __dashboard.projects.tsx__: Fetching data from the parent route (dashboard.tsx) using outletContext. This is where our projects layout is defined
- __dashboard.projects.index.tsx__: Fetching data from the parent route (dashboard.projects.tsx) using outletContext. We're displaying a list of projects. 
- __dashboard.projects.$id.tsx__: Fetching data from the parent route (dashboard.projects.tsx) using outletContext. We're displaying a single project.


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

## [LangChainJS](https://js.langchain.com/docs/introduction/) 
- __githubLoader.server.ts__: Loading a Github repo into LangChainJS. Spits out an array of documents. Summarizing documents: summaries = getSummary(document.pageContent). Then, get embeddings of the summaries, store em in the Vector DB


## Know the code
- summarizeCommits(diffs: string): summarizing commits - Completely irrelevant

- summarizeCode(doc: Document): Takes a document and summarizing SINGLE document
- generateEmbeddingsForSummary(summary: string): Takes a summary and generating embeddings for a summary
- loadGithubRepo(githubUrl: string,userId?: string,projectId?: string,githubToken?: string): Loading a Github repo into LangChainJS. Spits out an array of documents.
- generateEmbeddings(docs: Document[]): Generating embeddings for an array of summarized documents

## Local Setup for Qdrant or any VectorDB
1. Ensure to install dependencies and run the Docker container
```shell
docker pull qdrant/qdrant
docker run -p 6333:6333 -p 6334:6334 -v $(pwd)/qdrant_data:/qdrant/storage qdrant/qdrant
http://localhost:6333/dashboard
```

