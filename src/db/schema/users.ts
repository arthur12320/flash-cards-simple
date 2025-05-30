import type { InferSelectModel } from "drizzle-orm"
import { pgTable, timestamp, uuid, varchar, integer } from "drizzle-orm/pg-core"

const users = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }).notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: varchar("image", { length: 2048 }),
  displayName: varchar("display_name", { length: 255 }),
  // Review interval settings (in minutes)
  easyInterval: integer("easy_interval").default(2880).notNull(), // 2 days = 2880 minutes
  mediumInterval: integer("medium_interval").default(1440).notNull(), // 1 day = 1440 minutes
  hardInterval: integer("hard_interval").default(5).notNull(), // 5 minutes
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
})

export type SelectUser = InferSelectModel<typeof users>

export default users
