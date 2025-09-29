// File: src/app/(admin)/admin/dashboard/page.js
"use client";

import { useQuery } from "@tanstack/react-query";
import PageHeader from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchAdminPayments, fetchAdminUsers } from "@/lib/mock-data";
import { qk } from "@/lib/query-keys";
import { adminPlansOptions } from "@/lib/queries/admin-plans";

// Admin dashboard summarizing platform-wide stats.
export default function AdminDashboardPage() {
  const { data: plans = [] } = useQuery(adminPlansOptions());
  const { data: payments = [] } = useQuery({ queryKey: qk.admin.payments(), queryFn: fetchAdminPayments });
  const { data: users = [] } = useQuery({ queryKey: qk.admin.users(), queryFn: fetchAdminUsers });

  const pendingPayments = payments.filter((payment) => payment.status === "Pending");

  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin Overview"
        description="Monitor system metrics, pending approvals, and high-level adoption."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{users.length}</p>
            <p className="text-sm text-muted-foreground">Across all plans</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{plans.length}</p>
            <p className="text-sm text-muted-foreground">Configured in the catalog</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{pendingPayments.length}</p>
            <p className="text-sm text-muted-foreground">Require manual approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Enterprise Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{users.filter((user) => user.plan === "Enterprise").length}</p>
            <p className="text-sm text-muted-foreground">Managed by customer success</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent manual payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.id}</TableCell>
                    <TableCell>{payment.user}</TableCell>
                    <TableCell>${payment.amount}</TableCell>
                    <TableCell>{payment.status}</TableCell>
                    <TableCell>{payment.submittedAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
