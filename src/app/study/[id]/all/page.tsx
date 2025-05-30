import { getCollectionCards } from "@/lib/actions/cards"
import { getUserCollections } from "@/lib/actions/collections"
import { StudySession } from "@/components/study-session"
import { notFound } from "next/navigation"



export default async function StudyAllPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const {id} = await params
  const collections = await getUserCollections()
  const collection = collections.find((c) => c.id === id)

  if (!collection) {
    notFound()
  }

  const cards = await getCollectionCards(id)

  if (cards.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">No Cards to Study</h1>
          <p className="text-muted-foreground">Add some cards to this collection before starting a study session.</p>
        </div>
      </div>
    )
  }

  // Shuffle cards for variety
  const shuffledCards = [...cards].sort(() => Math.random() - 0.5)

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <StudySession collection={collection} cards={shuffledCards} />
    </div>
  )
}
