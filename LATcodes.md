### Prisma Schema
```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  username  String
  email     String   @unique
  password  String
  credits   Int      @default(100)

  projects  Project[]
}

model Project {
  id             String          @id @default(uuid())
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
  
  projectName    String
  githubUrl      String
  githubToken    String?
  description    String?

  userId         String
  user           User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  projectCommits ProjectCommit[]
}

model RepoCommit {
  id              String         @id @default(uuid())
  repoUrl         String
  commitHash      String         // the commit hash for this commit
  message         String
  authorName      String
  authorAvatarUrl String
  committedAt     DateTime
  url             String
  summary         String?        // LLM-generated summary (optional initially)
  pendingSummary  Boolean        @default(true)

  projectCommits  ProjectCommit[]

  // Avoid collisions if by chance two different repos generate the same hash,
  // enforce uniqueness on combination of repoUrl and commitHash.
  @@unique([repoUrl, commitHash])
}

model ProjectCommit {
  id         String     @id @default(uuid())
  projectId  String
  commitId   String
  project    Project    @relation(fields: [projectId], references: [id], onDelete: Cascade)
  commit     RepoCommit @relation(fields: [commitId], references: [id], onDelete: Cascade)
}
```