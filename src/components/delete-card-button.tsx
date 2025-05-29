"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { deleteCard } from "@/lib/actions/cards"

interface DeleteCardButtonProps {
  cardId: string
}

export function DeleteCardButton({ cardId }: DeleteCardButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this card?")) {
      return
    }

    setIsLoading(true)
    try {
      await deleteCard(cardId)
    } catch (error) {
      console.error("Failed to delete card:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={isLoading}
      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  )
}
