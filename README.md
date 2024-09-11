# How to deploy an Express app w/ Postgresql in Vercel

### Part 1: Setting up your Postgres database in Vercel

-   _Parts of #1-3 are borrowed from [Vercel's Postgres Getting Started Quick guide](https://vercel.com/docs/storage/vercel-postgres/quickstart)_

1. Getting started

-   Create a github repo and clone it in your local environment. Then, initialize node and commit the changes
    ```
    git clone _[repo ssh url]_
    npm init
    _[git add, commit, push]_
    ```
-   Go to your Vercel dashboard and create a project connected to your Github repo
-   Install Vercel CLI and Vercel Postgres
    ```
    npm i vercel@latest @vercel/postgres
    ```

2. Create a Postgres database
   In your dashboard on Vercel, create or select the project you want to work on

-   Select the Storage tab, then select the Connect Store button
-   Select Postgres
-   Name the db, his _Create and Continue_ and then _Connect_

3. Link the Vercel Project and Pull auto-generated env variables to your local environment
    ```
    vercel link
    ```
    _Follow linking steps_
    ```
    vercel env pull .env.development.local
    ```
4. Install Prisma Client and Prisma CLI
   `npm i prisma @prisma/client`

5. Install Typescript, ts-node, and @types/node and initialize Typescript to create tsconfig.json

-   `npm i typescript ts-node @types/node`
-   `npx tsc --init`

6. Create your schema file within a Prisma folder in your root directory, example provided below

-   `code prisma/schema.prisma`

```
generator client {
    provider = "prisma-client-js"
}

datasource db {
    provider  = "postgresql"
    // Uses connection pooling
    url       = env("POSTGRES_PRISMA_URL")
    // Uses direct connection, ⚠️ make sure to keep this to `POSTGRES_URL_NON_POOLING`
    // or you'll have dangling databases from migrations
    directUrl = env("POSTGRES_URL_NON_POOLING")
}

model User {
    id        Int      @id @default(autoincrement())
    name      String
    email     String   @unique
    image     String?
    createdAt DateTime @default(now())
}
```

7. Run a migration and run prisma generate to update the generated type generations

-   `npx prisma migrate dev`
-   Add the following script to your package.json

_Note the final echo hello command to allow Vercel to run it's build command once deployed_

```
{
  "scripts": {
    "vercel-build": "prisma generate && prisma migrate deploy && echo hello"
  }
}
```

-   `npm run vercel-build`

8. Use a query script to test that the everything is working as expected.

_script.ts_ example

```
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createUser() {
  const newUser = await prisma.user.create({
    data: {
      name: 'Elliott',
      email: 'xelliottx@example-user.com',
    },
  });
}

async function selectAll() {
    const users = await prisma.user.findMany();
    console.log('users', users)
}

createUser()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
```

### Part 2: Setting up your Express App to leverage your database

1. Install express and cors
   `npm i express cors`

2. Set-up a boilerplate server in your root directory.

_Note, you must export the app for Vercel to recognize it for deployment_
```
mkdir api
touch api/server.js
```

```
const express = require('express')

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient()

const app = express()

async function getUsers() {
    const users = await prisma.user.findMany();
    return users
}

app.get('/',
    async (req, res, next) => {
        const users = await getUsers();
        res.send(`<h1>here are the users: ${users[0].name}</h1>`)
    }
)

app.listen(3000)

module.exports = app;
```

3. Run your server locally and ensure it works as expected

4. Add a vercel.json file to enable Express and avoid Vercel's default of Next.js configuration

-   _[More info on using Express with Vercel](https://vercel.com/guides/using-express-with-vercel)_

```
{
    "version": 2,
    "redirects": [
        {
            "source": "/(.*)",
            "destination": "server.js"
        }
    ]
}
```

4. Deploy to vercel or push changed to Github assuming your vercel project has an associated Github

All done!
