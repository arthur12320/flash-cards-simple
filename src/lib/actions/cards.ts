"use server"

import db from "@/db"
import {cards} from "@/db/schema/cards"
import { collections } from "@//db/schema/collections"
import { auth } from "../../../auth"
import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function createCard(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const collectionId = formData.get("collectionId") as string
  const aSide = formData.get("aSide") as string
  const bSide = formData.get("bSide") as string

  if (!collectionId || !aSide || !bSide) {
    throw new Error("All fields are required")
  }

  // Verify collection belongs to user
  const collection = await db.query.collections.findFirst({
    where: and(eq(collections.id, collectionId), eq(collections.userId, session.user.id)),
  })

  if (!collection) {
    throw new Error("Collection not found")
  }

  const [card] = await db
    .insert(cards)
    .values({
      collectionId,
      aSide,
      bSide,
    })
    .returning()

  revalidatePath(`/collections/${collectionId}`)
  return card
}

export async function createCardsBulk(collectionId: string, cardsData: { aSide: string; bSide: string }[]) {
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

  const newCards = await db
    .insert(cards)
    .values(
      cardsData.map((card) => ({
        collectionId,
        aSide: card.aSide,
        bSide: card.bSide,
      })),
    )
    .returning()

  revalidatePath(`/collections/${collectionId}`)
  return newCards
}

export async function getCollectionCards(collectionId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  // Verify collection belongs to user
  const collection = await db.query.collections.findFirst({
    where: and(eq(collections.id, collectionId), eq(collections.userId, session.user.id)),
    with: {
      cards: {
        orderBy: (cards, { desc }) => [desc(cards.createdAt)],
      },
    },
  })

  return collection?.cards || []
}

export async function deleteCard(cardId: string) {
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

  await db.delete(cards).where(eq(cards.id, cardId))
  revalidatePath(`/collections/${card.collectionId}`)
}
