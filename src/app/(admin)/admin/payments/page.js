// File: src/app/(admin)/admin/payments/page.js
"use client";

import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/shared/page-header";
import PaymentsTable from "@/components/features/admin/payments-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { qk } from "@/lib/query-keys";
import { fetchAdminPayments } from "@/lib/mock-data";
import { toast } from "@/components/ui/sonner";

// Payments moderation view for administrators.
export default function AdminPaymentsPage() {
  const queryClient = useQueryClient();
  const { data: payments = [] } = useQuery({ queryKey: qk.admin.payments(), queryFn: fetchAdminPayments });
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredPayments = useMemo(() => {
    if (statusFilter === "all") return payments;
    return payments.filter((payment) => payment.status.toLowerCase() === statusFilter);
  }, [payments, statusFilter]);

  const handleApprove = (payment) => {
    queryClient.setQueryData(qk.admin.payments(), (prev = []) =>
      prev.map((item) => (item.id === payment.id ? { ...item, status: "Approved" } : item))
    );
    toast.success(`Payment ${payment.id} approved.`);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Payments"
        description="Review and approve manual payment submissions from customers."
      />
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid max-w-xs gap-2">
          <Label>Status</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
      <PaymentsTable payments={filteredPayments} onApprove={handleApprove} />
    </div>
  );
}
