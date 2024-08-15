import { boolean } from "drizzle-orm/mysql-core";
import {
  varchar,
  bigint,
  text,
  mysqlTableCreator,
} from "drizzle-orm/mysql-core";
import { ulid } from "ulid";

const fullTimeTable = mysqlTableCreator((name) => `fulltime_${name}`);
// const internTable = mysqlTableCreator((name) => `intern_${name}`);

export const fullTimeBannerTable = fullTimeTable("banners", {
  id: varchar("id", { length: 256 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => ulid()),
  name: varchar("name", { length: 2048 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(false).notNull(),
  expiresAt: bigint("expires_at", { mode: "number" }).notNull(),
  createdAt: bigint("created_at", { mode: "number" })
    .notNull()
    .default(0)
    .$defaultFn(() => Date.now()),
  updatedAt: bigint("updated_at", { mode: "number" }).$onUpdateFn(() =>
    Date.now()
  ),
});
