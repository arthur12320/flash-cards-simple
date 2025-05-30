import type { InferSelectModel } from "drizzle-orm"
import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core"

const users = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }).notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: varchar("image", { length: 2048 }),
  displayName: varchar("display_name", { length: 255 }), // Added for custom display name
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(), // Added
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(), // Added
})

export type SelectUser = InferSelectModel<typeof users>

export default users
