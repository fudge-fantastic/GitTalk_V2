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

1. High Priority: Create a dummy user or use Prima to create a temp user, test login.
2. High Priority: Work on creating user using Sign-up form. 