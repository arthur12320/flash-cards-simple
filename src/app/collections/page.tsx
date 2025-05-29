import { getUserCollections } from "@/lib/actions/collections"
import { CollectionCard } from "@/components/collection-card"
import { CreateCollectionDialog } from "@/components/create-collection-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function CollectionsPage() {
  const collections = await getUserCollections()

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Collections</h1>
          <p className="text-muted-foreground mt-2">Organize your flash cards into collections for better studying</p>
        </div>
        <CreateCollectionDialog>
          <Button size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            New Collection
          </Button>
        </CreateCollectionDialog>
      </div>

      {collections.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No collections yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first collection to start organizing your flash cards
          </p>
          <CreateCollectionDialog>
            <Button>Create Collection</Button>
          </CreateCollectionDialog>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} />
          ))}
        </div>
      )}
    </div>
  )
}
