import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { env } from "./env.js";

async function main() {
  const pool = mysql.createPool({
    uri: env.DATABASE_URL,
  });
  const db = drizzle(pool, { logger: true });

  console.log("Running migrations");

  await migrate(db, {
    migrationsFolder: "./migrations",
  });

  pool.end();

  console.log("Migrated successfully");

  process.exit(0);
}

main().catch((e) => {
  console.error("Migration failed");
  console.error(e);
  process.exit(1);
});
