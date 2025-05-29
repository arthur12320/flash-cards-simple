import { Card, CardContent } from "@/components/ui/card"
import { DeleteCardButton } from "./delete-card-button"

interface CardsListProps {
  cards: Array<{
    id: string
    aSide: string
    bSide: string
    createdAt: Date
  }>
}

export function CardsList({ cards }: CardsListProps) {
  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">📚</span>
        </div>
        <h3 className="text-lg font-semibold mb-2">No cards yet</h3>
        <p className="text-muted-foreground">Add your first card to start building this collection</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {cards.map((card) => (
        <Card key={card.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Front</h4>
                  <p className="text-lg">{card.aSide}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">Back</h4>
                  <p className="text-lg">{card.bSide}</p>
                </div>
              </div>
              <DeleteCardButton cardId={card.id} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
