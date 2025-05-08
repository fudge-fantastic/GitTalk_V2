## Types of Pending UI
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

## Performance Tips
1. Use .server.ts suffix for files that touch server-only code like Prisma. That way Remix won't accidentally try to send Prisma into the browser bundle (Performance + security)
2. Since our RepoCommit model has optional summary, we can later build a queue system (like background jobs) to summarize commits when pendingSummary is true (eg - a cron job or background worker)
3. Only Query What You Need ("select" and "include"). Smaller queries = faster database = less memory = faster page loads.

## References
1. [Input Types](https://www.w3schools.com/html/html_form_input_types.asp)

## Application Layout
- __dashboard.tsx__: Loading user and projects using loader function. In loader, checking if the user is authenticated. If not, redirect to login page. If yes, load user and projects. This is where our dashboard layout is defined (Sidebar) and using Outlet to pass the data to child routes 
- __dashboard.projects.tsx__: Fetching data from the parent route (dashboard.tsx) using outletContext. This is where our projects layout is defined
- __dashboard.projects._index.tsx__: Fetching data from the parent route (dashboard.projects.tsx) using outletContext. We're displaying a list of projects. 
- __dashboard.projects.$id.tsx__: Fetching data from the parent route (dashboard.projects.tsx) using outletContext. We're displaying a single project.