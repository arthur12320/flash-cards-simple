"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createCard } from "@/lib/actions/cards"

interface CreateCardDialogProps {
  children: React.ReactNode
  collectionId: string
}

export function CreateCardDialog({ children, collectionId }: CreateCardDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    try {
      formData.append("collectionId", collectionId)
      await createCard(formData)
      setOpen(false)
    } catch (error) {
      console.error("Failed to create card:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Card</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="aSide">Front Side</Label>
            <Textarea id="aSide" name="aSide" placeholder="Enter the question or prompt..." rows={3} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bSide">Back Side</Label>
            <Textarea id="bSide" name="bSide" placeholder="Enter the answer or explanation..." rows={3} required />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Card"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
