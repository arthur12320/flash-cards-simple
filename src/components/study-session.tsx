"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RotateCcw, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

interface StudySessionProps {
  collection: {
    id: string
    name: string
  }
  cards: Array<{
    id: string
    aSide: string
    bSide: string
  }>
}

export function StudySession({ collection, cards }: StudySessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [shuffledCards] = useState(() => [...cards].sort(() => Math.random() - 0.5))

  const currentCard = shuffledCards[currentIndex]
  const progress = ((currentIndex + 1) / shuffledCards.length) * 100

  const nextCard = () => {
    if (currentIndex < shuffledCards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    }
  }

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
    }
  }

  const resetSession = () => {
    setCurrentIndex(0)
    setIsFlipped(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{collection.name}</h1>
          <p className="text-muted-foreground">
            Card {currentIndex + 1} of {shuffledCards.length}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={resetSession} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      <Progress value={progress} className="h-2" />

      <div className="relative">
        <Card
          className="min-h-[300px] cursor-pointer select-none transition-all duration-300 hover:shadow-lg active:scale-[0.98]"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <CardContent className="flex items-center justify-center p-8 min-h-[300px]">
            <div className="text-center space-y-4">
              <div className="text-sm font-medium text-muted-foreground">{isFlipped ? "Back" : "Front"}</div>
              <div className="text-2xl font-medium leading-relaxed">
                {isFlipped ? currentCard.bSide : currentCard.aSide}
              </div>
              <div className="text-sm text-muted-foreground">Tap to {isFlipped ? "flip back" : "reveal answer"}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={prevCard} disabled={currentIndex === 0} className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          {currentIndex === shuffledCards.length - 1 ? (
            <Button asChild>
              <Link href={`/collections/${collection.id}`}>Finish Session</Link>
            </Button>
          ) : (
            <Button onClick={nextCard} className="gap-2">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
