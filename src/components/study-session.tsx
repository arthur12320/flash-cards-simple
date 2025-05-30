"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { RotateCcw, ChevronLeft, ChevronRight, Clock, CheckCircle } from "lucide-react"
import Link from "next/link"
import { reviewCard, completeStudySession } from "@/lib/actions/card-reviews"
import { useRouter } from "next/navigation"
import type { SelectUser } from "@/db/schema/users"

interface StudySessionProps {
  collection: {
    id: string
    name: string
  }
  cards: Array<{
    id: string
    aSide: string
    bSide: string
    lastReviewed: Date | null
    nextReview: Date | null
    difficulty: "easy" | "medium" | "hard" | null
    reviewCount: number
  }>
  user: SelectUser
}

type Difficulty = "easy" | "medium" | "hard"

interface CardReview {
  cardId: string
  difficulty: Difficulty
  timestamp: Date
}

export function StudySession({ collection, cards, user }: StudySessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [showDifficulty, setShowDifficulty] = useState(false)
  const [isReviewing, setIsReviewing] = useState(false)
  const [sessionReviews, setSessionReviews] = useState<CardReview[]>([])
  const [isCompletingSession, setIsCompletingSession] = useState(false)
  const router = useRouter()

  const currentCard = cards[currentIndex]
  const progress = ((currentIndex + 1) / cards.length) * 100
  const reviewedInSession = sessionReviews.some((review) => review.cardId === currentCard?.id)

  const handleCardFlip = () => {
    setIsFlipped(true)
    setShowDifficulty(true)
  }

  const handleDifficultySelect = async (difficulty: Difficulty) => {
    if (!currentCard || isReviewing || reviewedInSession) return

    setIsReviewing(true)
    try {
      await reviewCard(currentCard.id, difficulty)

      // Track the review in session state
      const newReview: CardReview = {
        cardId: currentCard.id,
        difficulty,
        timestamp: new Date(),
      }
      setSessionReviews((prev) => [...prev, newReview])

      // Auto-advance to next card after a short delay
      setTimeout(() => {
        nextCard()
      }, 500)
    } catch (error) {
      console.error("Failed to review card:", error)
    } finally {
      setIsReviewing(false)
    }
  }

  const nextCard = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
      setShowDifficulty(false)
    }
  }

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
      setShowDifficulty(false)
    }
  }

  const resetSession = () => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setShowDifficulty(false)
    setSessionReviews([])
  }

  const finishSession = async () => {
    setIsCompletingSession(true)
    try {
      const reviewedCardIds = sessionReviews.map((review) => review.cardId)
      await completeStudySession(collection.id, reviewedCardIds)
      router.push(`/collections/${collection.id}`)
    } catch (error) {
      console.error("Failed to complete session:", error)
    } finally {
      setIsCompletingSession(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500 hover:bg-green-600"
      case "medium":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "hard":
        return "bg-red-500 hover:bg-red-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  const getNextReviewText = (difficulty: Difficulty) => {
    let minutes: number
    switch (difficulty) {
      case "easy":
        minutes = user.easyInterval
        break
      case "medium":
        minutes = user.mediumInterval
        break
      case "hard":
        minutes = user.hardInterval
        break
    }

    if (minutes < 60) {
      return `${minutes} min`
    } else if (minutes < 24 * 60) {
      const hours = Math.floor(minutes / 60)
      return `${hours} hour${hours !== 1 ? "s" : ""}`
    } else {
      const days = Math.floor(minutes / (24 * 60))
      const remainingHours = Math.floor((minutes % (24 * 60)) / 60)
      if (remainingHours > 0) {
        return `${days}d ${remainingHours}h`
      }
      return `${days} day${days !== 1 ? "s" : ""}`
    }
  }

  const getSessionReviewForCard = (cardId: string) => {
    return sessionReviews.find((review) => review.cardId === cardId)
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <Clock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-4">All Caught Up!</h1>
        <p className="text-muted-foreground mb-4">No cards are due for review right now.</p>
        <Button asChild>
          <Link href={`/collections/${collection.id}`}>Back to Collection</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{collection.name}</h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-muted-foreground">
              Card {currentIndex + 1} of {cards.length}
            </p>
            {sessionReviews.length > 0 && (
              <Badge variant="secondary" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                {sessionReviews.length} reviewed this session
              </Badge>
            )}
            {currentCard.reviewCount > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />
                Reviewed {currentCard.reviewCount} times
              </Badge>
            )}
            {currentCard.difficulty && (
              <Badge variant="secondary" className={`text-white ${getDifficultyColor(currentCard.difficulty)}`}>
                {currentCard.difficulty}
              </Badge>
            )}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={resetSession} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      <Progress value={progress} className="h-2" />

      <div className="relative">
        <Card
          className={`min-h-[300px] transition-all duration-300 hover:shadow-lg ${
            !isFlipped ? "cursor-pointer active:scale-[0.98]" : ""
          } ${reviewedInSession ? "ring-2 ring-green-500" : ""}`}
          onClick={!isFlipped ? handleCardFlip : undefined}
        >
          <CardContent className="flex items-center justify-center p-8 min-h-[300px]">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <div className="text-sm font-medium text-muted-foreground">{isFlipped ? "Back" : "Front"}</div>
                {reviewedInSession && <CheckCircle className="h-4 w-4 text-green-500" />}
              </div>
              <div className="text-2xl font-medium leading-relaxed">
                {isFlipped ? currentCard.bSide : currentCard.aSide}
              </div>
              {!isFlipped && !reviewedInSession && (
                <div className="text-sm text-muted-foreground">Tap to reveal answer</div>
              )}
              {reviewedInSession && (
                <div className="text-sm text-green-600 font-medium">
                  ✓ Reviewed as {getSessionReviewForCard(currentCard.id)?.difficulty}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {showDifficulty && isFlipped && !reviewedInSession && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">How difficult was this card?</h3>
            <p className="text-sm text-muted-foreground">{`This affects when you'll see it again`}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              onClick={() => handleDifficultySelect("hard")}
              disabled={isReviewing}
              className={`${getDifficultyColor("hard")} text-white flex flex-col gap-1 h-auto py-4`}
            >
              <span className="font-semibold">Hard</span>
              <span className="text-xs opacity-90">Again in {getNextReviewText("hard")}</span>
            </Button>
            <Button
              onClick={() => handleDifficultySelect("medium")}
              disabled={isReviewing}
              className={`${getDifficultyColor("medium")} text-white flex flex-col gap-1 h-auto py-4`}
            >
              <span className="font-semibold">Medium</span>
              <span className="text-xs opacity-90">Again in {getNextReviewText("medium")}</span>
            </Button>
            <Button
              onClick={() => handleDifficultySelect("easy")}
              disabled={isReviewing}
              className={`${getDifficultyColor("easy")} text-white flex flex-col gap-1 h-auto py-4`}
            >
              <span className="font-semibold">Easy</span>
              <span className="text-xs opacity-90">Again in {getNextReviewText("easy")}</span>
            </Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={prevCard} disabled={currentIndex === 0} className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          {currentIndex === cards.length - 1 ? (
            <Button onClick={finishSession} disabled={isCompletingSession} className="gap-2">
              {isCompletingSession ? "Finishing..." : "Finish Session"}
              <CheckCircle className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={nextCard} className="gap-2">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {sessionReviews.length > 0 && (
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Session Progress</h4>
          <div className="text-sm text-muted-foreground">
            Reviewed {sessionReviews.length} of {cards.length} cards in this session
          </div>
          <div className="flex gap-2 mt-2">
            {sessionReviews.map((review) => (
              <Badge
                key={review.cardId}
                variant="secondary"
                className={`text-white ${getDifficultyColor(review.difficulty)}`}
              >
                {review.difficulty}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
