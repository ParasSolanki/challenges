import type { Config } from "drizzle-kit";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("Environment variable `DATABASE_URL` is required");
}

export default {
  schema: "./src/schema.ts",
  verbose: true,
  dialect: "mysql",
  out: "./migrations",
  migrations: {
    schema: "public",
  },
  dbCredentials: {
    url: dbUrl,
  },
  breakpoints: true,
} satisfies Config;
