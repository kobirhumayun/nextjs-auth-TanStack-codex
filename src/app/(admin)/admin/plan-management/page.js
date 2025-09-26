// File: src/app/(admin)/admin/plan-management/page.js
"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PlanForm from "@/components/features/admin/plan-form";
import { qk } from "@/lib/query-keys";
import { fetchAdminPlans } from "@/lib/mock-data";
import { toast } from "@/components/ui/sonner";

// Plan management interface for administrators.
export default function PlanManagementPage() {
  const queryClient = useQueryClient();
  const { data: plans = [] } = useQuery({ queryKey: qk.admin.plans(), queryFn: fetchAdminPlans });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openCreate = () => {
    setEditingPlan(null);
    setDialogOpen(true);
  };

  const openEdit = (plan) => {
    setEditingPlan({
      name: plan.name,
      price: plan.price,
      billingCycle: plan.billingCycle,
      description: plan.description,
      features: plan.features.join(", "),
    });
    setDialogOpen(true);
  };

  const handleDelete = (plan) => {
    queryClient.setQueryData(qk.admin.plans(), (prev = []) => prev.filter((item) => item.id !== plan.id));
    toast.success(`Plan "${plan.name}" removed locally.`);
  };

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      if (editingPlan) {
        queryClient.setQueryData(qk.admin.plans(), (prev = []) =>
          prev.map((plan) => (plan.name === editingPlan.name ? { ...plan, ...values, features: values.features } : plan))
        );
        toast.success("Plan updated.");
      } else {
        const newPlan = {
          id: `plan-${Date.now()}`,
          name: values.name,
          price: values.price,
          billingCycle: values.billingCycle,
          description: values.description,
          features: values.features,
          status: "Draft",
          userCount: 0,
        };
        queryClient.setQueryData(qk.admin.plans(), (prev = []) => [newPlan, ...prev]);
        toast.success("Plan created locally.");
      }
      setDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Plan management"
        description="Create, update, or retire subscription tiers."
        actions={<Button onClick={openCreate}>Add new plan</Button>}
      />
      <Card>
        <CardHeader>
          <CardTitle>Available plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>User Count</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>{plan.price}</TableCell>
                    <TableCell>{plan.userCount}</TableCell>
                    <TableCell>{plan.status}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(plan)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(plan)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {!plans.length && <p className="p-4 text-sm text-muted-foreground">No plans have been configured.</p>}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPlan ? "Edit plan" : "Add plan"}</DialogTitle>
          </DialogHeader>
          <PlanForm
            defaultValues={editingPlan}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
