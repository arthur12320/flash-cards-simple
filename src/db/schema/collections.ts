import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { InferSelectModel, relations } from "drizzle-orm"
import { cards } from "./cards"

export const collections = pgTable("collections", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const collectionsRelations = relations(collections, ({ many }) => ({
  cards: many(cards),
}))

export type SelectCollection = InferSelectModel<typeof collections>;