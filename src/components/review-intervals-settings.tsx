"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { updateReviewIntervals } from "@/lib/actions/users"
import { useRouter } from "next/navigation"
import { Save, Clock, Info } from "lucide-react"
import type { SelectUser } from "@/db/schema/users"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ReviewIntervalsSettingsProps {
  user: SelectUser
}

export function ReviewIntervalsSettings({ user }: ReviewIntervalsSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Convert minutes to days/hours/minutes for display
  const [easyDays, setEasyDays] = useState(Math.floor(user.easyInterval / (24 * 60)))
  const [easyHours, setEasyHours] = useState(Math.floor((user.easyInterval % (24 * 60)) / 60))
  const [mediumDays, setMediumDays] = useState(Math.floor(user.mediumInterval / (24 * 60)))
  const [mediumHours, setMediumHours] = useState(Math.floor((user.mediumInterval % (24 * 60)) / 60))
  const [hardMinutes, setHardMinutes] = useState(user.hardInterval)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    try {
      await updateReviewIntervals(formData)
      router.refresh()
    } catch (error) {
      console.error("Failed to update review intervals:", error)
      setError(error instanceof Error ? error.message : "Failed to update review intervals")
    } finally {
      setIsLoading(false)
    }
  }

  const formatPreview = (days: number, hours: number, minutes?: number) => {
    const parts = []
    if (days > 0) parts.push(`${days} day${days !== 1 ? "s" : ""}`)
    if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`)
    if (minutes !== undefined && minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`)
    return parts.join(", ") || "0 minutes"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Review Intervals
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            These settings control how long to wait before showing a card again based on your difficulty rating. Hard
            cards appear sooner, easy cards appear later.
          </AlertDescription>
        </Alert>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form action={handleSubmit} className="space-y-6">
          {/* Easy Interval */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-green-700">Easy Cards</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="easyDays" className="text-sm">
                  Days
                </Label>
                <Input
                  id="easyDays"
                  name="easyDays"
                  type="number"
                  min="0"
                  max="365"
                  value={easyDays}
                  onChange={(e) => setEasyDays(Number.parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="easyHours" className="text-sm">
                  Hours
                </Label>
                <Input
                  id="easyHours"
                  name="easyHours"
                  type="number"
                  min="0"
                  max="23"
                  value={easyHours}
                  onChange={(e) => setEasyHours(Number.parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Preview: {formatPreview(easyDays, easyHours)}</p>
          </div>

          {/* Medium Interval */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-yellow-700">Medium Cards</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mediumDays" className="text-sm">
                  Days
                </Label>
                <Input
                  id="mediumDays"
                  name="mediumDays"
                  type="number"
                  min="0"
                  max="365"
                  value={mediumDays}
                  onChange={(e) => setMediumDays(Number.parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="mediumHours" className="text-sm">
                  Hours
                </Label>
                <Input
                  id="mediumHours"
                  name="mediumHours"
                  type="number"
                  min="0"
                  max="23"
                  value={mediumHours}
                  onChange={(e) => setMediumHours(Number.parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Preview: {formatPreview(mediumDays, mediumHours)}</p>
          </div>

          {/* Hard Interval */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-red-700">Hard Cards</Label>
            <div>
              <Label htmlFor="hardMinutes" className="text-sm">
                Minutes
              </Label>
              <Input
                id="hardMinutes"
                name="hardMinutes"
                type="number"
                min="1"
                max="1440"
                value={hardMinutes}
                onChange={(e) => setHardMinutes(Number.parseInt(e.target.value) || 5)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">Preview: {formatPreview(0, 0, hardMinutes)}</p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button type="submit" disabled={isLoading} className="gap-2">
              <Save className="h-4 w-4" />
              {isLoading ? "Saving..." : "Save Intervals"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
