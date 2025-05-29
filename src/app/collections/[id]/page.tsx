import { getCollectionCards } from "@/lib/actions/cards"
import { getUserCollections } from "@/lib/actions/collections"
import { CardsList } from "@/components/cards-list"
import { CreateCardDialog } from "@/components/create-card-dialog"
import { BulkCreateCardsDialog } from "@/components/bulk-create-cards-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Upload, Play } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"



export default async function CollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const {id} = await params;
  const collections = await getUserCollections()
  const collection = collections.find((c) => c.id === id)

  if (!collection) {
    notFound()
  }

  const cards = await getCollectionCards(id)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-start justify-between mb-8">
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight mb-2">{collection.name}</h1>
          {collection.description && <p className="text-muted-foreground mb-4">{collection.description}</p>}
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="gap-1">
              {cards.length} cards
            </Badge>
            {cards.length > 0 && (
              <Button asChild className="gap-2">
                <Link href={`/study/${collection.id}`}>
                  <Play className="h-4 w-4" />
                  Study Collection
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <CreateCardDialog collectionId={collection.id}>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Card
          </Button>
        </CreateCardDialog>
        <BulkCreateCardsDialog collectionId={collection.id}>
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Bulk Import
          </Button>
        </BulkCreateCardsDialog>
      </div>

      <CardsList cards={cards} />
    </div>
  )
}
