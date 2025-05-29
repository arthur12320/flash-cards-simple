import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Play } from "lucide-react"
import { DeleteCollectionButton } from "./delete-collection-button"
import { SelectCard } from '@/db/schema/cards'

interface CollectionCardProps {
  collection: {
    id: string
    name: string
    description: string | null
    cards: SelectCard[]
    createdAt: Date
  }
}

export function CollectionCard({ collection }: CollectionCardProps) {
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
        <div className="flex items-center gap-2 mb-4">
          <Badge variant="secondary" className="gap-1">
            <BookOpen className="h-3 w-3" />
            {collection.cards.length} cards
          </Badge>
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
