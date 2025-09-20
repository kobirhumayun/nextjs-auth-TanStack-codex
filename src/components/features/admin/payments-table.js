// File: src/components/features/admin/payments-table.js
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Displays manual payment submissions awaiting review.
export default function PaymentsTable({ payments = [], onApprove }) {
  if (!payments.length) {
    return <p className="text-sm text-muted-foreground">No payments found.</p>;
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reference</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>{payment.id}</TableCell>
              <TableCell>{payment.user}</TableCell>
              <TableCell>${payment.amount}</TableCell>
              <TableCell>{payment.method}</TableCell>
              <TableCell>
                <Badge variant={payment.status === "Approved" ? "outline" : "secondary"}>{payment.status}</Badge>
              </TableCell>
              <TableCell>{payment.submittedAt}</TableCell>
              <TableCell className="text-right">
                <Button
                  size="sm"
                  disabled={payment.status === "Approved"}
                  onClick={() => onApprove?.(payment)}
                >
                  Approve
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
