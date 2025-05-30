"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateUserSettings } from "@/lib/actions/users"
import { useRouter } from "next/navigation"
import { Save, User } from "lucide-react"
import type { SelectUser } from "@/db/schema/users"

interface AccountSettingsProps {
  user: SelectUser
}

export function AccountSettings({ user }: AccountSettingsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [displayName, setDisplayName] = useState(user.displayName || user.name || "")
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    try {
      await updateUserSettings(formData)
      router.refresh()
    } catch (error) {
      console.error("Failed to update settings:", error)
      alert(error instanceof Error ? error.message : "Failed to update settings")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="displayName"
            name="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your display name"
            className="pl-10"
            required
          />
        </div>
        <p className="text-xs text-muted-foreground">This is how your name will appear throughout the application</p>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium text-muted-foreground">Auth Name</Label>
        <p className="text-sm">{user.name || "Not set"}</p>
        <p className="text-xs text-muted-foreground">This comes from your authentication provider</p>
      </div>

      <Button type="submit" disabled={isLoading || !displayName.trim()} className="gap-2">
        <Save className="h-4 w-4" />
        {isLoading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  )
}
