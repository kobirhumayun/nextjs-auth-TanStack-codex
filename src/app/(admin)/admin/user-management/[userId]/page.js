// File: src/app/(admin)/admin/user-management/[userId]/page.js
import PageHeader from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fetchAdminUserProfile } from "@/lib/mock-data";

// Detailed user profile for administrators.
export default async function AdminUserProfilePage({ params }) {
  const profile = await fetchAdminUserProfile(params.userId);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`User: ${profile.username}`}
        description={`Plan: ${profile.plan}`}
        actions={<Button variant="outline">Reset password</Button>}
      />
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <p className="font-medium">Email</p>
              <p className="text-muted-foreground">{profile.email}</p>
            </div>
            <div>
              <p className="font-medium">Status</p>
              <p className="text-muted-foreground">{profile.status}</p>
            </div>
            <div>
              <p className="font-medium">Joined</p>
              <p className="text-muted-foreground">{profile.registeredAt}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Plan & permissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <p className="font-medium">Current plan</p>
              <p className="text-muted-foreground">{profile.plan}</p>
            </div>
            <div>
              <p className="font-medium">Actions</p>
              <div className="mt-2 flex gap-2">
                <Button size="sm">Change plan</Button>
                <Button size="sm" variant="outline">
                  Update profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
