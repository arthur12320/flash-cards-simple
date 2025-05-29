"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createCardsBulk } from "@/lib/actions/cards"

interface BulkCreateCardsDialogProps {
  children: React.ReactNode
  collectionId: string
}

export function BulkCreateCardsDialog({ children, collectionId }: BulkCreateCardsDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [jsonInput, setJsonInput] = useState("")

  const exampleJson = `[
  {"aSide": "What is the capital of France?", "bSide": "Paris"},
  {"aSide": "What is 2 + 2?", "bSide": "4"},
  {"aSide": "Who wrote Romeo and Juliet?", "bSide": "William Shakespeare"}
]`

  async function handleSubmit() {
    setIsLoading(true)
    try {
      const cardsData = JSON.parse(jsonInput)

      if (!Array.isArray(cardsData)) {
        throw new Error("JSON must be an array")
      }

      for (const card of cardsData) {
        if (!card.aSide || !card.bSide) {
          throw new Error("Each card must have both aSide and bSide properties")
        }
      }

      await createCardsBulk(collectionId, cardsData)
      setOpen(false)
      setJsonInput("")
    } catch (error) {
      console.error("Failed to create cards:", error)
      alert(error instanceof Error ? error.message : "Failed to create cards")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
       <DialogTrigger asChild>{children}</DialogTrigger>
       <DialogContent className="sm:max-w-2xl">
         <DialogHeader>
           <DialogTitle>Bulk Import Cards</DialogTitle>
         </DialogHeader>
         <div className="space-y-4">
           <div className="space-y-2">
             <Label htmlFor="jsonInput">JSON Data</Label>
             <Textarea
              id="jsonInput"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={exampleJson}
              rows={10}
              className="font-mono text-sm max-h-48 overflow-scroll"
            />
            <p className="text-xs text-muted-foreground">
              {`Provide an array of objects with "aSide" and "bSide" properties`}
            </p>
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1" disabled={isLoading || !jsonInput.trim()}>
              {isLoading ? "Importing..." : "Import Cards"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
