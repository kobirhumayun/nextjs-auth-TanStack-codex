// File: src/components/features/admin/plan-form.js
"use client";

import { useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  price: z.string().min(1, "Price is required"),
  billingCycle: z.string().min(2, "Billing cycle required"),
  description: z.string().min(5, "Provide a short description"),
  features: z.string().min(3, "List at least one feature"),
});

// Form fields shared between create and update plan flows.
export default function PlanForm({ defaultValues, onSubmit, onCancel, isSubmitting }) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues || { name: "", price: "", billingCycle: "", description: "", features: "" },
  });

  useEffect(() => {
    if (defaultValues) form.reset(defaultValues);
  }, [defaultValues, form]);

  const handleSubmit = (values) => {
    const parsedFeatures = values.features
      .split(",")
      .map((feature) => feature.trim())
      .filter(Boolean);
    onSubmit?.({ ...values, features: parsedFeatures });
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="plan-name">Plan Name</Label>
        <Input id="plan-name" placeholder="Professional" disabled={isSubmitting} {...form.register("name")} />
        {form.formState.errors.name && <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="plan-price">Price</Label>
        <Input id="plan-price" placeholder="$29" disabled={isSubmitting} {...form.register("price")} />
        {form.formState.errors.price && <p className="text-sm text-destructive">{form.formState.errors.price.message}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="plan-cycle">Billing Cycle</Label>
        <Input id="plan-cycle" placeholder="Per month" disabled={isSubmitting} {...form.register("billingCycle")} />
        {form.formState.errors.billingCycle && (
          <p className="text-sm text-destructive">{form.formState.errors.billingCycle.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="plan-description">Description</Label>
        <Textarea
          id="plan-description"
          rows={3}
          placeholder="Explain the benefits of this plan"
          disabled={isSubmitting}
          {...form.register("description")}
        />
        {form.formState.errors.description && (
          <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="plan-features">Features (comma separated)</Label>
        <Textarea
          id="plan-features"
          rows={3}
          placeholder="Unlimited projects, Workflow automations"
          disabled={isSubmitting}
          {...form.register("features")}
        />
        {form.formState.errors.features && <p className="text-sm text-destructive">{form.formState.errors.features.message}</p>}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Plan"}
        </Button>
      </div>
    </form>
  );
}
