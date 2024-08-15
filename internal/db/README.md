# @challenges/db

## Installation

Install Dependencies.

```bash
  pnpm install
```

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

| Name         | Description       |
| ------------ | ----------------- |
| DATABASE_URL | The database URL. |

## Setup Database

To Setup the database first you have to run all the migrations.

```bash
  pnpm db:migrate
```

To generate sql from drizzle schema you can run below command.

```bash
  pnpm db:generate
```

## Drizzle Studio

To see all of your database data locally, you can run the drizzle studio command, which will show you all of your data.

```bash
pnpm studio
```
