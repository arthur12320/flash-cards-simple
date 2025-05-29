"use server"

import db from "@/db"
import { collections } from "@/db/schema/collections"
import { auth } from "../../../auth"
import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function createCollection(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string

  if (!name) {
    throw new Error("Collection name is required")
  }

  const [collection] = await db
    .insert(collections)
    .values({
      name,
      description,
      userId: session.user.id,
    })
    .returning()

  revalidatePath("/collections")
  return collection
}

export async function getUserCollections() {
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  const userCollections = await db.query.collections.findMany({
    where: eq(collections.userId, session.user.id),
    with: {
      cards: true,
    },
    orderBy: (collections, { desc }) => [desc(collections.createdAt)],
  })

  return userCollections
}

export async function deleteCollection(collectionId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  await db.delete(collections).where(and(eq(collections.id, collectionId), eq(collections.userId, session.user.id)))

  revalidatePath("/collections")
}
