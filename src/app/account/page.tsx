import { getCurrentUser } from "@/lib/actions/users"
import { AccountSettings } from "@/components/account-settings"
import { ReviewIntervalsSettings } from "@/components/review-intervals-settings"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { redirect } from "next/navigation"

export default async function AccountPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/signin")
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your account preferences and settings</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <AccountSettings user={user} />
          </CardContent>
        </Card>

        <ReviewIntervalsSettings user={user} />

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <div className="flex items-center gap-2">
                <p className="text-sm">{user.email}</p>
                {user.emailVerified && (
                  <Badge variant="secondary" className="text-xs">
                    Verified
                  </Badge>
                )}
              </div>
            </div>
            {user.emailVerified && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email verified</label>
                <p className="text-sm">{new Date(user.emailVerified).toLocaleDateString()}</p>
              </div>
            )}
            {user.createdAt && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Member since</label>
                <p className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
