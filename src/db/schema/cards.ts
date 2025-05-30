import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core"
import { InferSelectModel, relations } from "drizzle-orm"
import { collections } from "./collections"

export const cards = pgTable("cards", {
  id: uuid("id").defaultRandom().primaryKey(),
  collectionId: uuid("collection_id")
    .notNull()
    .references(() => collections.id, { onDelete: "cascade" }),
  aSide: text("a_side").notNull(),
  bSide: text("b_side").notNull(),
  // Review tracking fields
  lastReviewed: timestamp("last_reviewed"),
  nextReview: timestamp("next_review"),
  difficulty: text("difficulty", { enum: ["easy", "medium", "hard"] }),
  reviewCount: integer("review_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const cardsRelations = relations(cards, ({ one }) => ({
  collection: one(collections, {
    fields: [cards.collectionId],
    references: [collections.id],
  }),
}))

export type SelectCards = InferSelectModel<typeof cards>;