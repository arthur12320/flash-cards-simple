"use server"

import  db  from "@/db"
import { cards, SelectCards } from "@/db/schema/cards"
import { collections } from "@/db/schema/collections"
import users from "@/db/schema/users"
import { auth } from "../../../auth"
import { eq, and, lte, or, isNull } from "drizzle-orm"
import { revalidatePath } from "next/cache"

type Difficulty = "easy" | "medium" | "hard"

export async function reviewCard(cardId: string, difficulty: Difficulty) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Get user settings for intervals
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  })

  if (!user) {
    throw new Error("User not found")
  }

  // Get card with collection to verify ownership
  const card = await db.query.cards.findFirst({
    where: eq(cards.id, cardId),
    with: {
      collection: true,
    },
  })

  if (!card || card.collection.userId !== session.user.id) {
    throw new Error("Card not found")
  }

  const now = new Date()

  // Get interval in minutes based on difficulty and user settings
  let intervalMinutes: number
  switch (difficulty) {
    case "easy":
      intervalMinutes = user.easyInterval
      break
    case "medium":
      intervalMinutes = user.mediumInterval
      break
    case "hard":
      intervalMinutes = user.hardInterval
      break
  }

  const nextReview = new Date(now.getTime() + intervalMinutes * 60 * 1000)

  const [updatedCard] = await db
    .update(cards)
    .set({
      lastReviewed: now,
      nextReview,
      difficulty,
      reviewCount: card.reviewCount + 1,
      updatedAt: now,
    })
    .where(eq(cards.id, cardId))
    .returning()

  // Don't revalidate the study page to avoid cards disappearing mid-session
  return updatedCard
}

export async function completeStudySession(collectionId: string, reviewedCardIds: string[]) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Verify collection belongs to user
  const collection = await db.query.collections.findFirst({
    where: and(eq(collections.id, collectionId), eq(collections.userId, session.user.id)),
  })

  if (!collection) {
    throw new Error("Collection not found")
  }

  // Revalidate paths after session completion
  revalidatePath(`/study/${collectionId}`)
  revalidatePath(`/collections/${collectionId}`)
  revalidatePath("/collections")

  return { success: true, reviewedCount: reviewedCardIds.length }
}

export async function getDueCards(collectionId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  // Verify collection belongs to user
  const collection = await db.query.collections.findFirst({
    where: and(eq(collections.id, collectionId), eq(collections.userId, session.user.id)),
  })

  if (!collection) {
    return []
  }

  const now = new Date()

  // Get cards that are due for review (never reviewed OR next review time has passed)
  const dueCards = await db.query.cards.findMany({
    where: and(eq(cards.collectionId, collectionId), or(isNull(cards.nextReview), lte(cards.nextReview, now))),
    orderBy: (cards, { asc }) => [asc(cards.nextReview)],
  })

  return dueCards
}

export async function getCollectionStats(collectionId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return null
  }

  // Verify collection belongs to user
  const collection = await db.query.collections.findFirst({
    where: and(eq(collections.id, collectionId), eq(collections.userId, session.user.id)),
    with: {
      cards: true,
    },
  })

  if (!collection) {
    return null
  }

  const now = new Date()
  const totalCards = collection.cards.length
  const reviewedCards = collection.cards.filter((card:SelectCards) => card.lastReviewed).length
  const dueCards = collection.cards.filter((card:SelectCards) => !card.nextReview || card.nextReview <= now).length

  return {
    totalCards,
    reviewedCards,
    dueCards,
    newCards: totalCards - reviewedCards,
  }
}

export async function resetCardProgress(cardId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Get card with collection to verify ownership
  const card = await db.query.cards.findFirst({
    where: eq(cards.id, cardId),
    with: {
      collection: true,
    },
  })

  if (!card || card.collection.userId !== session.user.id) {
    throw new Error("Card not found")
  }

  const [updatedCard] = await db
    .update(cards)
    .set({
      lastReviewed: null,
      nextReview: null,
      difficulty: null,
      reviewCount: 0,
      updatedAt: new Date(),
    })
    .where(eq(cards.id, cardId))
    .returning()

  revalidatePath(`/collections/${card.collectionId}`)
  return updatedCard
}
