import { getDueCards, getCollectionStats } from "@/lib/actions/card-reviews"
import { getUserCollections } from "@/lib/actions/collections"
import { getCurrentUser } from "@/lib/actions/users"
import { StudySession } from "@/components/study-session"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, BookOpen } from "lucide-react"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"



export default async function StudyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/signin")
  }

  const collections = await getUserCollections()
  const collection = collections.find((c) => c.id === id)

  if (!collection) {
    notFound()
  }

  const dueCards = await getDueCards(id)
  const stats = await getCollectionStats(id)

  if (dueCards.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          <div className="text-center">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">All Caught Up!</h1>
            <p className="text-muted-foreground mb-6">No cards are due for review in "{collection.name}" right now.</p>
          </div>

          {stats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Collection Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.totalCards}</div>
                    <div className="text-sm text-muted-foreground">Total Cards</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.reviewedCards}</div>
                    <div className="text-sm text-muted-foreground">Reviewed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.dueCards}</div>
                    <div className="text-sm text-muted-foreground">Due Now</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.newCards}</div>
                    <div className="text-sm text-muted-foreground">New Cards</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link href={`/collections/${collection.id}`}>Back to Collection</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/study/${collection.id}/all`}>Study All Cards</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <StudySession collection={collection} cards={dueCards} user={user} />
    </div>
  )
}
