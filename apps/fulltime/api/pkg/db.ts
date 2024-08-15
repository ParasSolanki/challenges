import { mysql2Drizzle, mysql2 } from "@challenges/db";
import { env } from "../../env";

export * from "@challenges/db";

let db: ReturnType<typeof mysql2Drizzle> | null = null;
let pool: mysql2.Pool | null = null;

type Options = {
  url: (typeof env)["DATABASE_URL"];
  environment: (typeof env)["ENVIRONMENT"];
};

export function createOrGetConnection(opts: Options) {
  if (db) db;

  pool = mysql2.createPool({
    uri: opts.url,
  });

  db = mysql2Drizzle(pool, {
    logger: opts.environment === "production",
  });

  console.log("Database connected.");

  return db;
}

export async function closeDatabase() {
  if (pool) {
    return pool.end();
  }
}

process.on("SIGINT", () => {
  closeDatabase().then(() => {
    console.log("Database connection closed.");
    process.exit(0);
  });
});
