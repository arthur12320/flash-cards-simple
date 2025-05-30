"use server"

import  db  from "@/db"
import users from "@/db/schema/users"
import { auth } from "../../../auth"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getCurrentUser() {
  const session = await auth()
  if (!session?.user?.id) {
    return null
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  })

  return user
}

export async function createOrUpdateUser(userData: {
  id: string
  email: string
  name?: string | null
  image?: string | null
  emailVerified?: Date | null
}) {
  const existingUser = await db.query.users.findFirst({
    where: eq(users.id, userData.id),
  })

  if (existingUser) {
    const [updatedUser] = await db
      .update(users)
      .set({
        email: userData.email,
        name: userData.name,
        image: userData.image,
        emailVerified: userData.emailVerified,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userData.id))
      .returning()

    return updatedUser
  } else {
    const [newUser] = await db
      .insert(users)
      .values({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        image: userData.image,
        emailVerified: userData.emailVerified,
        displayName: userData.name, // Set initial display name to auth name
      })
      .returning()

    return newUser
  }
}

export async function updateUserSettings(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const displayName = formData.get("displayName") as string

  if (!displayName?.trim()) {
    throw new Error("Display name is required")
  }

  const [updatedUser] = await db
    .update(users)
    .set({
      displayName: displayName.trim(),
      updatedAt: new Date(),
    })
    .where(eq(users.id, session.user.id))
    .returning()

  revalidatePath("/account")
  return updatedUser
}

export async function deleteUserAccount() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  // Note: This will cascade delete collections and cards due to foreign key constraints
  await db.delete(users).where(eq(users.id, session.user.id))

  revalidatePath("/")
}
