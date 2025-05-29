import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { InferSelectModel, relations } from "drizzle-orm"
import { collections } from "./collections"

export const cards = pgTable("cards", {
  id: uuid("id").defaultRandom().primaryKey(),
  collectionId: uuid("collection_id")
    .notNull()
    .references(() => collections.id, { onDelete: "cascade" }),
  aSide: text("a_side").notNull(),
  bSide: text("b_side").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const cardsRelations = relations(cards, ({ one }) => ({
  collection: one(collections, {
    fields: [cards.collectionId],
    references: [collections.id],
  }),
}))

export type SelectCard = InferSelectModel<typeof cards>;