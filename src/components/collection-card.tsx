import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Play, Clock } from "lucide-react"
import { DeleteCollectionButton } from "./delete-collection-button"
import { getCollectionStats } from "@/lib/actions/card-reviews"
import { SelectCards } from "@/db/schema"

interface CollectionCardProps {
  collection: {
    id: string
    name: string
    description: string | null
    cards: SelectCards[]
    createdAt: Date
  }
}

export async function CollectionCard({ collection }: CollectionCardProps) {
  const stats = await getCollectionStats(collection.id)

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2">{collection.name}</CardTitle>
          <DeleteCollectionButton collectionId={collection.id} />
        </div>
        {collection.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{collection.description}</p>
        )}
      </CardHeader>

      <CardContent className="flex-1">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Badge variant="secondary" className="gap-1">
            <BookOpen className="h-3 w-3" />
            {collection.cards.length} cards
          </Badge>
          {stats && stats.dueCards > 0 && (
            <Badge variant="default" className="gap-1 bg-green-600 hover:bg-green-700">
              <Clock className="h-3 w-3" />
              {stats.dueCards} due
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0 gap-2">
        <Button asChild variant="outline" className="flex-1">
          <Link href={`/collections/${collection.id}`}>Manage</Link>
        </Button>
        {collection.cards.length > 0 && (
          <Button asChild className="flex-1 gap-2">
            <Link href={`/study/${collection.id}`}>
              <Play className="h-4 w-4" />
              Study
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
