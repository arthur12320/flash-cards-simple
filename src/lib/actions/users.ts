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

export async function updateReviewIntervals(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const easyDays = Number.parseInt(formData.get("easyDays") as string)
  const easyHours = Number.parseInt(formData.get("easyHours") as string) || 0
  const mediumDays = Number.parseInt(formData.get("mediumDays") as string)
  const mediumHours = Number.parseInt(formData.get("mediumHours") as string) || 0
  const hardMinutes = Number.parseInt(formData.get("hardMinutes") as string)

  // Validate inputs
  if (isNaN(easyDays) || easyDays < 0 || easyDays > 365) {
    throw new Error("Easy interval days must be between 0 and 365")
  }
  if (isNaN(easyHours) || easyHours < 0 || easyHours > 23) {
    throw new Error("Easy interval hours must be between 0 and 23")
  }
  if (isNaN(mediumDays) || mediumDays < 0 || mediumDays > 365) {
    throw new Error("Medium interval days must be between 0 and 365")
  }
  if (isNaN(mediumHours) || mediumHours < 0 || mediumHours > 23) {
    throw new Error("Medium interval hours must be between 0 and 23")
  }
  if (isNaN(hardMinutes) || hardMinutes < 1 || hardMinutes > 1440) {
    throw new Error("Hard interval must be between 1 and 1440 minutes")
  }

  // Convert to minutes
  const easyInterval = easyDays * 24 * 60 + easyHours * 60
  const mediumInterval = mediumDays * 24 * 60 + mediumHours * 60
  const hardInterval = hardMinutes

  // Ensure logical ordering (hard < medium < easy)
  if (hardInterval >= mediumInterval || mediumInterval >= easyInterval) {
    throw new Error("Intervals must be in order: Hard < Medium < Easy")
  }

  const [updatedUser] = await db
    .update(users)
    .set({
      easyInterval,
      mediumInterval,
      hardInterval,
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
