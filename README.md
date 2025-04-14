## Types of Pending UI
1. Busy indicators
2. Optimistic UI 
3. Skeleton fallbacks 

## Route Configuration
1. [Nested Routes (segmenting routes)](https://remix.run/docs/en/main/discussion/routes#what-is-nested-routing)


## [Prisma ORM](https://www.prisma.io/docs/getting-started/quickstart-sqlite) - [Getting Started](https://www.prisma.io/docs/getting-started)
```shell
# Install and initialize Prisma
npm install prisma --save-dev

npx prisma init --datasource-provider sqlite --output ../generated/prisma
```

1. Model your data in the generated Prisma schema. 
2. Run a migration to create your database tables with Prisma Migrate (At this point, you have a Prisma schema but no database yet. Run the following command in your terminal to create the SQLite database)

```shell  
npx prisma migrate dev --name init
```
