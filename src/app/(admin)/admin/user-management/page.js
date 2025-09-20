// File: src/app/(admin)/admin/user-management/page.js
"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/shared/page-header";
import UserTable from "@/components/features/admin/user-table";
import { Card, CardContent } from "@/components/ui/card";
import { qk } from "@/lib/query-keys";
import { fetchAdminUsers } from "@/lib/mock-data";

// Administrative user list with search and navigation to detail view.
export default function AdminUserManagementPage() {
  const router = useRouter();
  const { data: users = [] } = useQuery({ queryKey: qk.admin.users(), queryFn: fetchAdminUsers });

  return (
    <div className="space-y-8">
      <PageHeader
        title="User management"
        description="Search, filter, and inspect customer accounts."
      />
      <Card>
        <CardContent className="pt-6">
          <UserTable users={users} onViewProfile={(user) => router.push(`/admin/user-management/${user.id}`)} />
        </CardContent>
      </Card>
    </div>
  );
}
